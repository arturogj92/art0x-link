// app/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ClientRedirect from "../components/redirect";

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

    // Actualiza el contador de clicks (puedes dejarlo si lo deseas o eliminarlo, ya que se registrará en el endpoint de logVisit)
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

    console.log("Redirigiendo para slug:", slug);

    // Aquí solo renderizamos el componente de redirección, que desde el cliente registrará la visita y redirigirá.
    return <ClientRedirect targetUrl={data.long_url} urlId={data.id} />;
}
