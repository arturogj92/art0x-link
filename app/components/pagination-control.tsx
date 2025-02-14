// app/components/PaginationControls.tsx
"use client";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    return (
        <div className="mt-4 flex justify-center items-center space-x-4">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
                Anterior
            </button>
            <span className="text-sm">
        Página {currentPage} de {totalPages || 1}
      </span>
            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
                Siguiente
            </button>
        </div>
    );
}
