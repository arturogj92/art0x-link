// app/components/ClientRedirect.tsx
"use client";

import React, {JSX, useEffect} from "react";

interface ClientRedirectProps {
    targetUrl: string;
    urlId: number;
}

export default function ClientRedirect({ targetUrl, urlId }: ClientRedirectProps): JSX.Element {
    useEffect(() => {
        const payload = JSON.stringify({ url_id: urlId });
        // Usa sendBeacon para registrar la visita sin bloquear la redirección
        if (navigator.sendBeacon) {
            navigator.sendBeacon(`/api/url/logVisit`, payload);
        } else {
            // Fallback a fetch en caso de que sendBeacon no esté disponible
            fetch(`/api/url/logVisit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
            }).catch((err) => console.error("Error registrando visita:", err));
        }
        // Redirige inmediatamente
        window.location.href = targetUrl;
    }, [targetUrl, urlId]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p className="text-xl font-bold text-gray-800">Redirigiendo, por favor espere...</p>
        </div>
    );
}
