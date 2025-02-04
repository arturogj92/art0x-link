// app/components/ClientRedirect.tsx
"use client";

import React, {JSX, useEffect} from "react";

interface ClientRedirectProps {
    targetUrl: string;
}

export default function ClientRedirect({ targetUrl }: ClientRedirectProps): JSX.Element {
    useEffect(() => {
        window.location.href = targetUrl;
    }, [targetUrl]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p className="text-xl font-bold text-gray-800">Redirigiendo, por favor espere...</p>
        </div>
    );
}
