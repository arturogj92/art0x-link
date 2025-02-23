// app/api/url/visitStats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Maneja la petición OPTIONS (preflight)
export async function OPTIONS() {
    // Puedes ajustar los métodos y cabeceras según necesites
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const url_id = searchParams.get("url_id");
        const rangeParam = searchParams.get("range") || "7d";

        if (!url_id) {
            return new NextResponse(
                JSON.stringify({ message: "Falta el parámetro url_id" }),
                {
                    status: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    },
                },
            );
        }

        const rangeDays = rangeParam === "28d" ? 28 : 7;

        const now = new Date();
        const startDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );
        startDate.setUTCDate(startDate.getUTCDate() - (rangeDays - 1));

        // 1) Obtener las visitas en el rango
        const { data: visitsData, error: visitsError } = await supabase
            .from("visit_logs")
            .select("*")
            .eq("url_id", parseInt(url_id))
            .gte("visited_at", startDate.toISOString());

        if (visitsError) {
            console.error("Error obteniendo visitas:", visitsError.message);
            return new NextResponse(
                JSON.stringify({
                    message: "Error obteniendo estadísticas",
                    error: visitsError.message,
                }),
                {
                    status: 500,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    },
                },
            );
        }

        // 2) Generar array con cada día del rango
        const dailyStats: { date: string; count: number; countries: Record<string, number> }[] = [];
        for (let d = new Date(startDate); d <= now; d.setUTCDate(d.getUTCDate() + 1)) {
            const dayStr = d.toISOString().split("T")[0];
            dailyStats.push({ date: dayStr, count: 0, countries: {} });
        }
        const todayStr = new Date().toISOString().split("T")[0];
        if (!dailyStats.some((item) => item.date === todayStr)) {
            dailyStats.push({ date: todayStr, count: 0, countries: {} });
        }

        // 3) Rellenar dailyStats con los datos de visitsData
        dailyStats.forEach((dayEntry) => {
            const visitsForDay =
                visitsData?.filter((visit: any) => {
                    const visitDay = new Date(visit.visited_at).toISOString().split("T")[0];
                    return visitDay === dayEntry.date;
                }) || [];
            dayEntry.count = visitsForDay.length;
            visitsForDay.forEach((visit: any) => {
                let country = visit.country;
                if (!country || country === "null" || country === "Desconocido") {
                    country = "Desconocido";
                }
                dayEntry.countries[country] = (dayEntry.countries[country] || 0) + 1;
            });
        });

        const selectedTotal = dailyStats.reduce((sum, entry) => sum + entry.count, 0);

        // 4) Cálculo global
        const { count: globalCount, error: globalError } = await supabase
            .from("visit_logs")
            .select("id", { count: "exact", head: true })
            .eq("url_id", parseInt(url_id));

        let globalTotal = 0;
        if (globalError) {
            console.error("Error obteniendo visitas globales:", globalError.message);
        } else {
            globalTotal = globalCount || 0;
        }

        // 5) Variación respecto al periodo anterior
        const previousStartDate = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );
        previousStartDate.setUTCDate(previousStartDate.getUTCDate() - rangeDays);

        const { data: prevVisitsData, error: prevError } = await supabase
            .from("visit_logs")
            .select("*")
            .eq("url_id", parseInt(url_id))
            .gte("visited_at", previousStartDate.toISOString())
            .lt("visited_at", startDate.toISOString());

        let previousTotal = 0;
        if (!prevError && prevVisitsData) {
            previousTotal = prevVisitsData.length;
        } else if (prevError) {
            console.error("Error obteniendo visitas del periodo anterior:", prevError.message);
        }

        let variation = 0;
        if (previousTotal > 0) {
            variation = ((selectedTotal - previousTotal) / previousTotal) * 100;
        }

        // 6) Agrupar visitas por país en todo el rango (global actual)
        const countryStatsMap: Record<string, number> = {};
        visitsData?.forEach((visit: any) => {
            let country = visit.country;
            if (!country || country === "null" || country === "Desconocido") {
                country = "Desconocido";
            }
            countryStatsMap[country] = (countryStatsMap[country] || 0) + 1;
        });

        const stats = {
            dailyStats,
            selected: selectedTotal,
            global: globalTotal,
            variation: parseFloat(variation.toFixed(2)),
            byCountry: countryStatsMap,
        };

        // Respuesta con CORS
        return new NextResponse(JSON.stringify({ stats }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        return new NextResponse(
            JSON.stringify({ message: "Error en el servidor", error: errorObj.message }),
            {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            },
        );
    }
}
