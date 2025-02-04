// app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export const runtime = "edge";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ message: 'Faltan credenciales' }, { status: 400 });
        }

        // Consulta el administrador por email
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
        }

        // Compara la contraseña proporcionada con el hash almacenado
        const isPasswordValid = bcrypt.compareSync(password, data.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
        }

        // (Opcional) Aquí puedes generar un token o una sesión

        return NextResponse.json({ message: 'Login exitoso', admin: data });
    } catch (err: unknown) {
        const errorObj = err instanceof Error ? err : new Error("Unknown error");
        return NextResponse.json({ message: 'Error en el servidor', error: errorObj.message }, { status: 500 });
    }
}
