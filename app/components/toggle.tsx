import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (newValue: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => {
    return (
        <label className="relative inline-block w-12 h-6 cursor-pointer">
            {/* Input oculto para manejar el estado */}
            <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="opacity-0 w-0 h-0 peer"
        />
        {/* Fondo del toggle */}
        <div className="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-200 peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-green-500"></div>
    {/* Bolita del toggle */}
    <div className="absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out peer-checked:translate-x-6"></div>
        </label>
);
};

export default Toggle;
