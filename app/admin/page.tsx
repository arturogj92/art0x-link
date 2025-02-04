'use client';

import {FormEvent, useEffect, useState} from 'react';
import toast, {Toaster} from 'react-hot-toast';
import Toggle from '../components/toggle'; // Asegúrate de que la ruta sea correcta

// Función auxiliar para extraer el dominio de una URL.
function getDomain(url: string): string {
    try {
        return new URL(url.trim()).hostname;
    } catch (error) {
        return url;
    }
}

// Definición del tipo para cada registro de URL.
interface UrlRecord {
    id: number;
    slug: string;
    long_url: string;
    click_count: number;
    created_at: string;
    active: boolean;
}

export default function AdminPage() {
    // Estado de autenticación
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estados para el panel de administración
    const [longUrl, setLongUrl] = useState('');
    const [slug, setSlug] = useState('');
    const [urls, setUrls] = useState<UrlRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [editing, setEditing] = useState<{ [key: number]: boolean }>({});
    const [editedUrls, setEditedUrls] = useState<{ [key: number]: string }>({});

    // Verificar si ya está logueado (usando localStorage)
    useEffect(() => {
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            setLoggedIn(true);
        }
    }, []);

    // Función de login que consulta el endpoint de login
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
                localStorage.setItem('adminLoggedIn', 'true');
                setLoggedIn(true);
                toast.success('Login exitoso', {
                    style: { background: '#16a34a', color: '#fff' },
                });
            } else {
                toast.error(result.message, {
                    style: { background: '#dc2626', color: '#fff' },
                });
            }
        } catch (err: unknown) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error');
            toast.error(errorObj.message, {
                style: { background: '#dc2626', color: '#fff' },
            });
        }
    };


    // Función para obtener las URLs de la API.
    const fetchUrls = async () => {
        try {
            const res = await fetch('/api/url/list');
            const data = await res.json();
            setUrls(data.urls);
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            toast.error(`Error al obtener las URLs: ${err.message}`, {
                style: { background: '#dc2626', color: '#fff' },
            });
        }
    };

    // Función para crear una nueva URL.
    const createUrl = async (e: FormEvent) => {
        e.preventDefault();
        // Remover "http://" o "https://" y anteponer "https://"
        const fixedUrl = longUrl.replace(/^https?:\/\//, '');
        const urlWithProtocol = `https://${fixedUrl}`;
        try {
            const res = await fetch('/api/url/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ long_url: urlWithProtocol, slug }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success('URL creada exitosamente', {
                    style: { background: '#16a34a', color: '#fff' },
                });
                setLongUrl('');
                setSlug('');
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: '#dc2626', color: '#fff' },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            toast.error(`Error: ${err.message}`, {
                style: { background: '#dc2626', color: '#fff' },
            });
        }
    };

    // Función para cambiar el estado activo/inactivo de una URL.
    const toggleActive = async (id: number, currentActive: boolean) => {
        try {
            const res = await fetch('/api/url/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active: !currentActive }),
            });
            const result = await res.json();
            if (res.ok) {
                // No mostramos notificación en éxito
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: '#dc2626', color: '#fff' },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            toast.error(`Error: ${err.message}`, {
                style: { background: '#dc2626', color: '#fff' },
            });
        }
    };

    // Función para actualizar la URL (edición inline).
    const updateUrl = async (id: number) => {
        try {
            const newUrl = editedUrls[id];
            const fixedUrl = newUrl.replace(/^https?:\/\//, '');
            const urlWithProtocol = `https://${fixedUrl}`;
            const res = await fetch('/api/url/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, long_url: urlWithProtocol }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success('URL actualizada exitosamente', {
                    style: { background: '#16a34a', color: '#fff' },
                });
                setEditing((prev) => ({ ...prev, [id]: false }));
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: '#dc2626', color: '#fff' },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            toast.error(`Error: ${err.message}`, {
                style: { background: '#dc2626', color: '#fff' },
            });
        }
    };

    // Función para borrar una URL.
    const deleteUrl = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta URL?')) return;
        try {
            const res = await fetch('/api/url/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success('URL eliminada correctamente', {
                    style: { background: '#16a34a', color: '#fff' },
                });
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: '#dc2626', color: '#fff' },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            toast.error(`Error: ${err.message}`, {
                style: { background: '#dc2626', color: '#fff' },
            });
        }
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    // Filtrado y paginación de URLs.
    const filteredUrls = urls.filter((url) =>
        url.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.long_url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUrls.length / rowsPerPage);
    const paginatedUrls = filteredUrls.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Redirección: al hacer click en la fila, redirige al acortador (/{slug})
    const handleRowClick = (slug: string) => {
        window.location.href = `/${slug}`;
    };

    // Si no se ha iniciado sesión, muestra el formulario de login.
    if (!loggedIn) {
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

    // Renderiza el panel de administración si está autenticado.
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-10">
            <div className="max-w-6xl mx-auto bg-gray-800 shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Panel de Administración</h1>

                {/* Formulario para crear URL */}
                <form onSubmit={createUrl} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">URL Larga</label>
                        <input
                            type="text"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            required
                            placeholder="example.com"
                            className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-700 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            placeholder="nombre-personalizado"
                            className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-700 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Crear URL
                    </button>
                </form>

                {/* Buscador y paginación */}
                <div className="mt-8 flex justify-between items-center">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Buscar..."
                        className="block w-1/3 rounded-md border border-gray-700 bg-gray-700 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                    <div className="text-sm">
                        Página {currentPage} de {totalPages || 1}
                    </div>
                </div>

                {/* Tabla de URLs */}
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Slug</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">URL Larga</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Clicks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Activo</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Creado</th>
                        </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {paginatedUrls.map((url) => (
                            <tr
                                key={url.id}
                                className="hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleRowClick(url.slug)}
                            >
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{url.id}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{url.slug}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {editing[url.id] ? (
                                        <input
                                            type="text"
                                            value={editedUrls[url.id] || url.long_url.trim()}
                                            onChange={(e) =>
                                                setEditedUrls((prev) => ({ ...prev, [url.id]: e.target.value }))
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                                        />
                                    ) : (
                                        <span className="relative inline-block group">
                        {getDomain(url.long_url.trim())}
                                            {/* Tooltip personalizado */}
                                            <span className="absolute left-0 bottom-full mb-2 hidden whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:block group-hover:opacity-100 z-10">
                          {url.long_url.trim()}
                        </span>
                      </span>
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{url.click_count}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Toggle
                                            checked={url.active}
                                            onChange={() => toggleActive(url.id, url.active)}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                                    {editing[url.id] ? (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateUrl(url.id);
                                                }}
                                                className="mr-2 py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditing((prev) => ({ ...prev, [url.id]: false }));
                                                }}
                                                className="py-1 px-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditing((prev) => ({ ...prev, [url.id]: true }));
                                                    setEditedUrls((prev) => ({ ...prev, [url.id]: url.long_url }));
                                                }}
                                                className="mr-2 py-1 px-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-xs"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteUrl(url.id);
                                                }}
                                                className="py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                                            >
                                                Borrar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const shareableLink = `${window.location.origin}/${url.slug}`;
                                                    navigator.clipboard.writeText(shareableLink)
                                                        .then(() => {
                                                            toast.success("Enlace copiado: " + shareableLink, {
                                                                style: { background: '#16a34a', color: '#fff' },
                                                            });
                                                        })
                                                        .catch(() => {
                                                            toast.error("Error al copiar el enlace", {
                                                                style: { background: '#dc2626', color: '#fff' },
                                                            });
                                                        });
                                                }}
                                                className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs ml-2"
                                            >
                                                Copiar enlace
                                            </button>
                                        </>
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {new Date(url.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-center items-center space-x-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm">
            Página {currentPage} de {totalPages || 1}
          </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
            <Toaster />
        </div>
    );
}
