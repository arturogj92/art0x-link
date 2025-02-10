// app/components/ClientRedirect.tsx
"use client";

import React, {JSX, useEffect} from "react";

interface ClientRedirectProps {
    targetUrl: string;
    urlId: number;
}

export default function ClientRedirect({ targetUrl, urlId }: ClientRedirectProps): JSX.Element {
    useEffect(() => {
        // Llama al endpoint de registro de visita desde el cliente
        fetch(`/api/url/logVisit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url_id: urlId }),
        }).catch((err) => console.error("Error registrando visita:", err));

        // Luego redirige al targetUrl
        window.location.href = targetUrl;
    }, [targetUrl, urlId]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p className="text-xl font-bold text-gray-800">Redirigiendo, por favor espere...</p>
        </div>
    );
}
