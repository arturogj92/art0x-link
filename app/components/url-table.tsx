// app/components/UrlTable.tsx
"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import Toggle from "./toggle";

export interface UrlRecord {
    id: number;
    slug: string;
    long_url: string;
    click_count: number;
    created_at: string;
    active: boolean;
}

interface UrlTableProps {
    urls: UrlRecord[];
    onToggleActive: (id: number, currentActive: boolean) => void;
    onUpdateUrl: (id: number, newUrl: string) => Promise<void>;
    onDeleteUrl: (id: number) => Promise<void>;
    onStats: (id: number) => void;
}

export default function UrlTable({
                                     urls,
                                     onToggleActive,
                                     onUpdateUrl,
                                     onDeleteUrl,
                                     onStats,
                                 }: UrlTableProps) {
    const [editing, setEditing] = useState<{ [key: number]: boolean }>({});
    const [editedUrls, setEditedUrls] = useState<{ [key: number]: string }>({});

    const handleUpdate = async (id: number) => {
        await onUpdateUrl(id, editedUrls[id]);
        setEditing((prev) => ({ ...prev, [id]: false }));
    };

    return (
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
                {urls.map((url) => (
                    <tr key={url.id} className="hover:bg-gray-700">
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{url.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{url.slug}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {editing[url.id] ? (
                                <input
                                    type="text"
                                    value={editedUrls[url.id] ?? url.long_url.trim()}
                                    onChange={(e) =>
                                        setEditedUrls((prev) => ({ ...prev, [url.id]: e.target.value }))
                                    }
                                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                            ) : (
                                <span className="relative inline-block group">
                    {url.long_url.trim().substring(0, 30)}
                                    <span className="absolute left-0 bottom-full mb-2 hidden whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:block group-hover:opacity-100 z-10">
                      {url.long_url.trim()}
                    </span>
                  </span>
                            )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{url.click_count}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <Toggle
                                checked={url.active}
                                onChange={() => onToggleActive(url.id, url.active)}
                            />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {editing[url.id] ? (
                                <>
                                    <button
                                        onClick={() => handleUpdate(url.id)}
                                        className="mr-2 py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setEditing((prev) => ({ ...prev, [url.id]: false }))}
                                        className="py-1 px-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditing((prev) => ({ ...prev, [url.id]: true }));
                                            setEditedUrls((prev) => ({ ...prev, [url.id]: url.long_url }));
                                        }}
                                        className="mr-2 py-1 px-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-xs"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDeleteUrl(url.id)}
                                        className="py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                                    >
                                        Borrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            const shareableLink = `${window.location.origin}/${url.slug}`;
                                            navigator.clipboard
                                                .writeText(shareableLink.replace("www.", ""))
                                                .then(() => {
                                                    toast.success("Enlace copiado: " + shareableLink, {
                                                        style: { background: "#16a34a", color: "#fff" },
                                                    });
                                                })
                                                .catch(() => {
                                                    toast.error("Error al copiar el enlace", {
                                                        style: { background: "#dc2626", color: "#fff" },
                                                    });
                                                });
                                        }}
                                        className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs ml-2"
                                    >
                                        Copiar enlace
                                    </button>
                                    <button
                                        onClick={() => onStats(url.id)}
                                        className="py-1 px-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs ml-2"
                                    >
                                        Ver estadísticas
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
    );
}
