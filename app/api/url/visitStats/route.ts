// app/api/url/visitStats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url_id = searchParams.get('url_id');
        if (!url_id) {
            return NextResponse.json({ message: "Falta el parámetro url_id" }, { status: 400 });
        }

        // Definir intervalos en minutos:
        const intervals: Record<string, number> = {
            "1m": 1,         // 1 minuto
            "1h": 60,        // 60 minutos
            "8h": 480,       // 480 minutos
            "24h": 1440,     // 1440 minutos
            "72h": 4320,     // 4320 minutos
            "7d": 10080,     // 7 días = 7*1440
        };

        const stats: Record<string, number> = {};

        // Para cada intervalo, calculamos el umbral en minutos y convertimos a ISO
        for (const key in intervals) {
            const minutes = intervals[key];
            const threshold = new Date(Date.now() - minutes * 60000).toISOString();

            const { count, error } = await supabase
                .from('visit_logs')
                .select('id', { count: 'exact', head: true })
                .eq('url_id', parseInt(url_id))
                .gte('visited_at', threshold);

            if (error) {
                console.error(`Error en estadística ${key}:`, error.message);
                stats[key] = 0;
            } else {
                stats[key] = count || 0;
            }
        }

        // Global: todas las visitas
        const { count: globalCount, error: globalError } = await supabase
            .from('visit_logs')
            .select('id', { count: 'exact', head: true })
            .eq('url_id', parseInt(url_id));

        if (globalError) {
            console.error("Error en estadística global:", globalError.message);
            stats["global"] = 0;
        } else {
            stats["global"] = globalCount || 0;
        }

        return NextResponse.json({ stats });
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        return NextResponse.json({ message: "Error en el servidor", error: errorObj.message }, { status: 500 });
    }
}
