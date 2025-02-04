// lib/urlCache.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Variable para almacenar la caché
let urlCache: Record<string, any> = {};

// Función para cargar todas las URLs y almacenarlas en caché
export async function loadUrlCache() {
    const { data, error } = await supabase
        .from("urls")
        .select("id, slug, active, click_count, long_url");
    if (error) {
        console.error("Error cargando caché de URLs:", error.message);
        return;
    }
    // Construir un diccionario indexado por slug
    urlCache = {};
    data?.forEach((row: any) => {
        urlCache[row.slug] = row;
    });
    console.log("Caché de URLs cargada:", Object.keys(urlCache).length, "entradas");
}

// Función para obtener un registro de la caché
export function getUrlFromCache(slug: string) {
    return urlCache[slug];
}

// Función para actualizar la caché tras cambios (crear/actualizar/eliminar)
export function updateUrlInCache(updatedRow: any) {
    if (updatedRow.slug) {
        urlCache[updatedRow.slug] = updatedRow;
    }
}

// Puedes incluso exportar una función para invalidar la caché si es necesario
export function clearUrlCache() {
    urlCache = {};
}
