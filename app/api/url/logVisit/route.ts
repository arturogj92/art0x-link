import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    try {
        const { url_id } = await request.json();
        if (!url_id) {
            return NextResponse.json({ message: "Falta el parámetro url_id" }, { status: 400 });
        }

        // Obtener varios headers para depuración
        const xForwardedFor = request.headers.get("x-forwarded-for");
        const cfConnectingIp = request.headers.get("cf-connecting-ip");
        const xRealIp = request.headers.get("x-real-ip");

        console.log("x-forwarded-for:", xForwardedFor);
        console.log("cf-connecting-ip:", cfConnectingIp);
        console.log("x-real-ip:", xRealIp);

        // Prioriza: x-forwarded-for (tomando la primera si hay varias), luego cf-connecting-ip, luego x-real-ip
        let ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : null;
        if (!ip && cfConnectingIp) ip = cfConnectingIp;
        if (!ip && xRealIp) ip = xRealIp;
        if (!ip) ip = "unknown";

        // Inserta la visita en la tabla visit_logs
        const { data, error } = await supabase
            .from("visit_logs")
            .insert([{ url_id, ip }]);

        if (error) {
            return NextResponse.json({ message: "Error registrando visita", error: error.message }, { status: 500 });
        }

        console.log("Visita registrada para url_id:", url_id, "IP:", ip);
        return NextResponse.json({ message: "Visita registrada", data });
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        return NextResponse.json({ message: "Error en el servidor", error: errorObj.message }, { status: 500 });
    }
}
