// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import UrlTable, { UrlRecord } from "@/app/components/url-table";
import PaginationControls from "@/app/components/pagination-control";
import VisitStatsModal from "@/app/components/VisitStatsModal";
import CreateUrlForm from "@/app/components/create-url-form";

export default function AdminPage() {
    const [urls, setUrls] = useState<UrlRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [selectedUrlId, setSelectedUrlId] = useState<number | null>(null);

    const fetchUrls = async () => {
        try {
            const res = await fetch("/api/url/list");
            const data = await res.json();
            setUrls(data.urls);
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error("Unknown error");
            toast.error(`Error al obtener las URLs: ${err.message}`, {
                style: { background: "#dc2626", color: "#fff" },
            });
        }
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    const filteredUrls = urls.filter((url) =>
        url.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.long_url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUrls.length / rowsPerPage);
    const paginatedUrls = filteredUrls.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const toggleActive = async (id: number, currentActive: boolean) => {
        try {
            const res = await fetch("/api/url/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, active: !currentActive }),
            });
            const result = await res.json();
            if (res.ok) {
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: "#dc2626", color: "#fff" },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error("Unknown error");
            toast.error(`Error: ${err.message}`, {
                style: { background: "#dc2626", color: "#fff" },
            });
        }
    };

    const updateUrl = async (id: number, newUrl: string) => {
        try {
            const fixedUrl = newUrl.replace(/^https?:\/\//, "");
            const urlWithProtocol = `https://${fixedUrl}`;
            const res = await fetch("/api/url/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, long_url: urlWithProtocol }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("URL actualizada exitosamente", {
                    style: { background: "#16a34a", color: "#fff" },
                });
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: "#dc2626", color: "#fff" },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error("Unknown error");
            toast.error(`Error: ${err.message}`, {
                style: { background: "#dc2626", color: "#fff" },
            });
        }
    };

    const deleteUrl = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta URL?")) return;
        try {
            const res = await fetch("/api/url/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("URL eliminada correctamente", {
                    style: { background: "#16a34a", color: "#fff" },
                });
                fetchUrls();
            } else {
                toast.error(`Error: ${result.message}`, {
                    style: { background: "#dc2626", color: "#fff" },
                });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error("Unknown error");
            toast.error(`Error: ${err.message}`, {
                style: { background: "#dc2626", color: "#fff" },
            });
        }
    };

    const handleStats = (id: number) => {
        setSelectedUrlId(id);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-10">
            <div className="max-w-6xl mx-auto bg-gray-800 shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Panel de Administración</h1>
                <CreateUrlForm onUrlCreated={fetchUrls} />
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
                </div>
                <div className="mt-4">
                    <UrlTable
                        urls={paginatedUrls}
                        onToggleActive={toggleActive}
                        onUpdateUrl={updateUrl}
                        onDeleteUrl={deleteUrl}
                        onStats={handleStats}
                    />
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
            <Toaster />
            {showModal && selectedUrlId !== null && (
                <VisitStatsModal
                    urlId={selectedUrlId}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedUrlId(null);
                    }}
                />
            )}
        </div>
    );
}
