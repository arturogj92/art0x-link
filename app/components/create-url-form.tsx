// app/components/CreateUrlForm.tsx
"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface CreateUrlFormProps {
    onUrlCreated: () => void;
}

export default function CreateUrlForm({ onUrlCreated }: CreateUrlFormProps) {
    const [longUrl, setLongUrl] = useState("");
    const [slug, setSlug] = useState("");

    const createUrl = async (e: FormEvent) => {
        e.preventDefault();
        const fixedUrl = longUrl.replace(/^https?:\/\//, "");
        const urlWithProtocol = `https://${fixedUrl}`;
        try {
            const res = await fetch("/api/url/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ long_url: urlWithProtocol, slug }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("URL creada exitosamente", {
                    style: { background: "#16a34a", color: "#fff" },
                });
                setLongUrl("");
                setSlug("");
                onUrlCreated();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: "#dc2626", color: "#fff" },
                });
            }
        } catch (error: any) {
            toast.error(`Error: ${error.message}`, {
                style: { background: "#dc2626", color: "#fff" },
            });
        }
    };

    return (
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
    );
}
