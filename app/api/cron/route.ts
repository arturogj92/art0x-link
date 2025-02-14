// app/api/cron/updateVisitCountry/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = "nodejs";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener el país a partir de una IP usando ipinfo.io (sin reintentos)
async function fetchCountry(ip: string): Promise<string> {
    try {
        const res = await fetch(`https://ipinfo.io/${ip}/json`);
        if (!res.ok) {
            console.error("Error en ipinfo:", res.statusText);
            return "Desconocido";
        }
        const data = await res.json();
        // ipinfo devuelve el país en formato ISO (por ejemplo, "US")
        return data.country || "Desconocido";
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
                console.log(`Procesando log ID ${log.id} con IP: ${log.ip}`);
                const country = await fetchCountry(log.ip);
                console.log(`País obtenido para log ID ${log.id}: ${country}`);
                // Actualiza el registro
                const { error: updateError } = await supabase
                    .from("visit_logs")
                    .update({ country })
                    .eq("id", log.id);
                if (updateError) {
                    console.error(`Error actualizando el log ${log.id}:`, updateError.message);
                } else {
                    updatedCount++;
                    console.log(`Log ${log.id} actualizado correctamente.`);
                }
                // Espera 5 segundos antes de procesar el siguiente registro
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
        }
    }

    return NextResponse.json({ message: "Proceso completado", updated: updatedCount });
}
