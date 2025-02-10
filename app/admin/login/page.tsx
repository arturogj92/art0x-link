// app/admin/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    console.log('Inicio de AdminLoginPage');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success('Login exitoso', { style: { background: '#16a34a', color: '#fff' } });
                // Redirige al panel de administración
                router.push('/admin');
            } else {
                toast.error(result.message, { style: { background: '#dc2626', color: '#fff' } });
            }
        } catch (err: unknown) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error');
            toast.error(errorObj.message, { style: { background: '#dc2626', color: '#fff' } });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-md shadow-md w-80">
                <h2 className="text-xl font-bold mb-4">Login Admin</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 rounded mb-2 text-black"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded mb-4 text-black"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 p-2 rounded hover:bg-indigo-700"
                    >
                        Login
                    </button>
                </form>
            </div>
            <Toaster />
        </div>
    );
}
