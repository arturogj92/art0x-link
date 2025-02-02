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

    // Consulta el registro en la base de datos
    const { data, error } = await supabase
        .from("urls")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

    if (error || !data) {
        notFound();
    }

    // Si el enlace no está activo, muestra un mensaje en lugar de redirigir
    if (!data.active) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-2xl font-bold text-red-600">
                    Este enlace no está disponible.
                </p>
            </div>
        );
    }

    // Incrementar el contador de clics (opcional, según tu lógica)
    await supabase
        .from("urls")
        .update({ click_count: data.click_count + 1 })
        .eq("id", data.id);

    // Redirige al URL largo
    redirect(data.long_url);
}
