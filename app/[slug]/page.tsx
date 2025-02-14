// app/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ClientRedirect from "../components/redirect";
import { headers } from "next/headers";

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Page(props: any) {
    const { params } = props as {
        params: { slug: string };
        searchParams: { [key: string]: string | string[] };
    };
    const { slug } = await Promise.resolve(params);

    console.log("Inicio de Page para el slug:", slug);

    const { data, error } = await supabase
        .from("urls")
        .select("id, active, click_count, long_url")
        .eq("slug", slug)
        .maybeSingle();

    if (error || !data) {
        notFound();
    }

    if (!data.active) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-2xl font-bold text-red-600">
                    Este enlace no está disponible.
                </p>
            </div>
        );
    }

    // Actualiza el contador de clicks
    try {
        await supabase
            .from("urls")
            .update({ click_count: data.click_count + 1 })
            .eq("id", data.id);
        console.log("Contador actualizado para", slug);
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        console.error("Error al actualizar contador:", errorObj);
    }

    // Registrar la visita en visit_logs de forma server-side
    try {
        // Extraer los headers del request
        const reqHeaders = await headers() as Headers;
        // Intenta obtener la IP real
        const ipFromXForwarded = reqHeaders.get("x-forwarded-for");
        const ipFromXReal = reqHeaders.get("x-real-ip");
        const ip =
            ipFromXForwarded?.split(",")[0]?.trim() ||
            ipFromXReal ||
            "unknown";

        // Inserta el registro en la tabla visit_logs
        // Se asume que la tabla tiene columnas: url_id, ip, country y visited_at con valor por defecto (NOW())
        const { error: logError } = await supabase
            .from("visit_logs")
            .insert([{ url_id: data.id, ip, country: "Desconocido" }]);

        if (logError) {
            console.error("Error registrando visita:", logError.message);
        } else {
            console.log("Visita registrada para url_id:", data.id, "IP:", ip);
        }
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        console.error("Error en el registro de visita:", errorObj.message);
    }

    console.log("Redirigiendo para slug:", slug);
    // Renderiza el componente de redirección que redirige al URL largo
    return <ClientRedirect targetUrl={data.long_url} urlId={data.id} />;
}
