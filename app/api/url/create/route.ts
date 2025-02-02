// app/api/url/create/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configura el cliente de Supabase usando las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    try {
        const { long_url, slug } = await request.json();
        console.log('[CREATE] Datos recibidos:', { long_url, slug });

        // Verificar que se hayan enviado los parámetros necesarios
        if (!long_url || !slug) {
            console.error('[CREATE] Faltan parámetros (long_url o slug)');
            return NextResponse.json(
                { message: 'Faltan parámetros (long_url o slug)' },
                { status: 400 }
            );
        }

        // Verificar que el slug no exista ya en la tabla
        const { data: existing, error: existingError } = await supabase
            .from('urls')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (existingError) {
            console.error('[CREATE] Error al verificar existencia del slug:', existingError);
            // Puedes optar por retornar un error o continuar dependiendo de tu lógica.
        }

        if (existing) {
            console.error('[CREATE] El slug ya existe:', slug);
            return NextResponse.json(
                { message: 'El slug ya existe, elige otro' },
                { status: 400 }
            );
        }

        // Inserta el nuevo registro en la tabla "urls"
        const { data, error } = await supabase
            .from('urls')
            .insert([{ long_url, slug }])
            .select()
            .single();

        if (error) {
            console.error('[CREATE] Error al insertar la URL:', error);
            return NextResponse.json(
                { message: 'Error al crear la URL', error: error.message },
                { status: 500 }
            );
        }

        console.log('[CREATE] URL creada exitosamente:', data);
        return NextResponse.json({ message: 'URL creada exitosamente', data });
    } catch (error: any) {
        console.error('[CREATE] Error en el servidor:', error);
        return NextResponse.json(
            { message: 'Error en el servidor', error: error.message },
            { status: 500 }
        );
    }
}
