import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener el país a partir de una IP usando ipapi.co
async function fetchCountry(ip: string): Promise<string> {
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!res.ok) {
            console.error("Error en ipapi:", res.statusText);
            return "Desconocido";
        }
        const data = await res.json();
        return data.country_name || "Desconocido";
    } catch (err) {
        console.error("Error fetching country for IP:", ip, err);
        return "Desconocido";
    }
}

export async function GET() {
    // Busca en visit_logs aquellos registros en los que country sea nulo o "Desconocido"
    const { data: logs, error } = await supabase
        .from("visit_logs")
        .select("id, ip, country")
        .or("country.is.null,country.eq.Desconocido");

    if (error) {
        console.error("Error obteniendo logs:", error.message);
        return NextResponse.json({ message: "Error obteniendo logs", error: error.message }, { status: 500 });
    }

    let updatedCount = 0;
    if (logs && logs.length > 0) {
        for (const log of logs) {
            if (log.ip) {
                const country = await fetchCountry(log.ip);
                // Actualiza el registro si el país obtenido es distinto a "Desconocido" o si la columna aún está vacía
                const { error: updateError } = await supabase
                    .from("visit_logs")
                    .update({ country })
                    .eq("id", log.id);
                if (updateError) {
                    console.error(`Error actualizando el log ${log.id}:`, updateError.message);
                } else {
                    updatedCount++;
                }
            }
        }
    }

    return NextResponse.json({ message: "Proceso completado", updated: updatedCount });
}
