// app/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Page(props: any) {
    // Forzamos el tipado de props para que tenga params y searchParams
    const { params } = props as {
        params: { slug: string };
        searchParams: { [key: string]: string | string[] };
    };
    const { slug } = params;

    // Inicia el cronómetro general para la función
    console.time("Page-" + slug);

    // Mide el tiempo de consulta a la base de datos
    console.time("dbQuery-" + slug);
    const { data, error } = await supabase
        .from("urls")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
    console.timeEnd("dbQuery-" + slug);

    if (error || !data) {
        console.timeEnd("Page-" + slug);
        notFound();
    }

    // Si el enlace no está activo, se muestra un mensaje y finaliza la medición
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

    // Mide el tiempo de actualización del contador de clics
    console.time("updateClicks-" + slug);
    await supabase
        .from("urls")
        .update({ click_count: data.click_count + 1 })
        .eq("id", data.id);
    console.timeEnd("updateClicks-" + slug);

    // Finaliza el cronómetro general
    console.timeEnd("Page-" + slug);

    // Redirige al URL largo
    redirect(data.long_url);
}
