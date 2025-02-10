// app/api/url/logVisit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    try {
        console.log('llamada log recibida')
        const { url_id } = await request.json();
        if (!url_id) {
            return NextResponse.json({ message: "Falta el parámetro url_id" }, { status: 400 });
        }
        // Opcional: obtener la IP (desde x-forwarded-for, por ejemplo)
        const ip = request.headers.get("x-forwarded-for") || "unknown";

        console.log('visit logs')

        const { data, error } = await supabase
            .from("visit_logs")
            .insert([{ url_id, ip }]);
        if (error) {
            return NextResponse.json({ message: "Error al registrar visita", error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Visita registrada", data });
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        console.log('error')
        return NextResponse.json({ message: "Error en el servidor", error: errorObj.message }, { status: 500 });
    }
}
