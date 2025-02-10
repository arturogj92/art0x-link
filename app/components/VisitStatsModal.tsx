// app/components/VisitStatsModal.tsx
"use client";

import {JSX, useEffect, useState} from "react";
import toast from "react-hot-toast";

interface VisitStatsModalProps {
    urlId: number;
    onClose: () => void;
}

export default function VisitStatsModal({ urlId, onClose }: VisitStatsModalProps): JSX.Element {
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/url/visitStats?url_id=${urlId}`);
                const data = await res.json();
                setStats(data.stats);
            } catch (err) {
                toast.error("Error obteniendo estadísticas");
            }
            setLoading(false);
        };
        fetchStats();
    }, [urlId]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Estadísticas de Visitas</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </div>
                {loading ? (
                    <p className="text-gray-700">Cargando...</p>
                ) : stats ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li><strong>Último minuto:</strong> {stats["1m"] || 0}</li>
                        <li><strong>Última hora:</strong> {stats["1h"] || 0}</li>
                        <li><strong>Últimas 8 horas:</strong> {stats["8h"] || 0}</li>
                        <li><strong>Últimas 24 horas:</strong> {stats["24h"] || 0}</li>
                        <li><strong>Últimas 72 horas:</strong> {stats["72h"] || 0}</li>
                        <li><strong>Últimos 7 días:</strong> {stats["7d"] || 0}</li>
                        <li><strong>Global:</strong> {stats["global"] || 0}</li>
                    </ul>
                ) : (
                    <p className="text-gray-700">No hay datos.</p>
                )}
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
