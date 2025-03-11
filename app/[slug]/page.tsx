// app/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Page(props: any) {
    // 1) Timers para medir duración global de la ruta
    console.time("Route-[slug]");

    // Desestructura props
    const { params } = props as {
        params: { slug: string };
        searchParams: { [key: string]: string | string[] };
    };
    const { slug } = await Promise.resolve(params);

    console.log("=== [slug] Page Start ===");
    console.log("Slug recibido:", slug);

    // 2) Consulta a la base de datos
    console.time("dbQuery-GetUrl");
    const { data, error } = await supabase
        .from("urls")
        .select("id, active, click_count, long_url")
        .eq("slug", slug)
        .maybeSingle();
    console.timeEnd("dbQuery-GetUrl");

    if (error || !data) {
        console.log("No se encontró la URL o hubo error. Llamando notFound().");
        console.timeEnd("Route-[slug]");
        notFound();
    }

    if (!data.active) {
        console.log("URL inactiva, devolviendo página de 'no disponible'.");
        console.timeEnd("Route-[slug]");
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-2xl font-bold text-red-600">
                    Este enlace no está disponible.
                </p>
            </div>
        );
    }

    // 3) Revisa los headers para ver si es un prefetch
    console.time("detectPrefetch");
    const reqHeaders = await headers() as Headers;
    // Ejemplo: Chrome envía "sec-fetch-purpose: 'prefetch'" en la primera llamada
    const secFetchPurpose = reqHeaders.get("sec-fetch-purpose") || "";
    console.log("sec-fetch-purpose:", secFetchPurpose);
    console.timeEnd("detectPrefetch");

    // 4) Si detectamos un prefetch, omitimos update/insert
    if (secFetchPurpose === "prefetch") {
        console.log("Prefetch detectado, Omitiendo update/insert y redirigiendo...");
        console.timeEnd("Route-[slug]");
        redirect(data.long_url);
    }

    // 5) Actualizar el contador de clicks
    console.time("dbQuery-UpdateClicks");
    try {
        await supabase
            .from("urls")
            .update({ click_count: data.click_count + 1 })
            .eq("id", data.id);

        console.log("Contador actualizado para slug:", slug);
    } catch (err) {
        console.error("Error al actualizar contador:", err);
    }
    console.timeEnd("dbQuery-UpdateClicks");

    // 6) Registrar la visita en visit_logs
    console.time("dbQuery-InsertVisit");
    try {
        const ipFromXForwarded = reqHeaders.get("x-forwarded-for");
        const ipFromXReal = reqHeaders.get("x-real-ip");
        const ip =
            ipFromXForwarded?.split(",")[0]?.trim() ||
            ipFromXReal ||
            "unknown";

        const { error: logError } = await supabase
            .from("visit_logs")
            .insert([{ url_id: data.id, ip, country: "Desconocido" }]);

        if (logError) {
            console.error("Error registrando visita:", logError.message);
        } else {
            console.log("Visita registrada para url_id:", data.id, "IP:", ip);
        }
    } catch (err) {
        console.error("Error en el registro de visita:", err);
    }
    console.timeEnd("dbQuery-InsertVisit");

    console.log("Redirigiendo a long_url:", data.long_url);
    console.timeEnd("Route-[slug]");

    // 7) Redirige desde el servidor
    redirect(data.long_url);
}
