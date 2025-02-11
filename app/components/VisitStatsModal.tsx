// app/components/VisitStatsModal.tsx
"use client";

import {JSX, useEffect, useState} from "react";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DailyStat {
    date: string;
    count: number;
    countries: Record<string, number>;
}

interface VisitStatsModalProps {
    urlId: number;
    onClose: () => void;
}

export default function VisitStatsModal({ urlId, onClose }: VisitStatsModalProps): JSX.Element {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [range, setRange] = useState<"7d" | "28d">("7d");

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/url/visitStats?url_id=${urlId}&range=${range}`);
                const data = await res.json();
                setStats(data.stats);
            } catch (err) {
                toast.error("Error obteniendo estadísticas");
            }
            setLoading(false);
        };
        fetchStats();
    }, [urlId, range]);

    // Función para formatear la fecha en "dd-mm-YY"
    const formatDate = (isoDate: string): string => {
        const d = new Date(isoDate);
        return d.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    };

    const dailyStats = (stats?.dailyStats as DailyStat[]) || [];

    // Configurar datos del gráfico
    const chartData = {
        labels: dailyStats.map((d) => formatDate(d.date)),
        datasets: [
            {
                label: "Clics diarios",
                data: dailyStats.map((d) => d.count),
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const },
            title: { display: true, text: "Clics diarios" },
            tooltip: {
                callbacks: {
                    // Personaliza la etiqueta del tooltip
                    label: (context: any) => {
                        const index = context.dataIndex;
                        let label = context.dataset.label || "";
                        label += `: ${context.parsed.y}`;
                        // Agrega el desglose por país para este día
                        const dayData = dailyStats[index];
                        if (dayData && dayData.countries) {
                            label += "\nDesglose:";
                            for (const [country, num] of Object.entries(dayData.countries)) {
                                label += `\n  ${country}: ${num}`;
                            }
                        }
                        return label;
                    },
                },
            },
        },
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-3xl w-full">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">📊 Estadísticas de Visitas</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="flex justify-center mb-4">
                    <button
                        onClick={() => setRange("7d")}
                        className={`px-4 py-2 border border-gray-300 rounded-l ${
                            range === "7d" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                        }`}
                    >
                        🗓️ 7 días
                    </button>
                    <button
                        onClick={() => setRange("28d")}
                        className={`px-4 py-2 border border-gray-300 rounded-r ${
                            range === "28d" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                        }`}
                    >
                        🗓️ 28 días
                    </button>
                </div>
                {loading ? (
                    <p className="text-center text-gray-700">Cargando...</p>
                ) : stats ? (
                    <>
                        <div className="mb-4">
                            <ul className="space-y-2 text-base text-gray-700">
                                <li><strong>📅 Clics en el periodo:</strong> {stats.selected || 0}</li>
                                <li><strong>⏳ Lifetime Clicks:</strong> {stats.global || 0}</li>
                                <li><strong>📈 Variación %:</strong> {stats.variation ? stats.variation + "%" : "0%"}</li>
                            </ul>
                        </div>
                        <div className="mb-4" style={{ height: "300px" }}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-800">🌍 Visitas por país (global)</h3>
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {stats.byCountry &&
                                    Object.entries(stats.byCountry).map(([country, count]) => (
                                        <li key={country}>
                                            <strong>{country || "Desconocido"}:</strong> {String(count)}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-700">No hay datos.</p>
                )}
                <div className="text-right">
                    <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
