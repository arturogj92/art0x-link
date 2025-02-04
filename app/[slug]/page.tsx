// app/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ClientRedirect from "../components/redirect"; // Ajusta la ruta según corresponda

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

    console.log("Inicio de Page para slug:", slug);
    console.time("Page-" + slug);

    const { data, error } = await supabase
        .from("urls")
        .select("id, active, click_count, long_url")
        .eq("slug", slug)
        .maybeSingle();

    if (error || !data) {
        console.timeEnd("Page-" + slug);
        notFound();
    }

    if (!data.active) {
        console.timeEnd("Page-" + slug);
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-2xl font-bold text-red-600">
                    Este enlace no está disponible.
                </p>
            </div>
        );
    }

    // Actualiza contador de clicks
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

    console.timeEnd("Page-" + slug);
    console.log("Redirigiendo para slug:", slug);

    return <ClientRedirect targetUrl={data.long_url} />;
}
