// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(request: NextRequest) {
    // Proteger rutas que comienzan con /admin, excepto la de login
    if (
        request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.startsWith('/admin/login')
    ) {
        const token = request.cookies.get('adminAuthToken')?.value;
        if (!token) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
        try {
            // Verifica el token usando jose. Si el token no es válido se lanzará un error.
            await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
            // Si la verificación es correcta, se permite el acceso.
        } catch (err) {
            console.error("Token inválido:", err);
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
