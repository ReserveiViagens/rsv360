import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

interface NavigationButtonsProps {
    showBack?: boolean;
    showHome?: boolean;
    backUrl?: string;
    className?: string;
}

export default function NavigationButtons({ 
    showBack = true, 
    showHome = true, 
    backUrl,
    className = ""
}: NavigationButtonsProps) {
    const handleBack = () => {
        if (backUrl) {
            window.location.href = backUrl;
        } else {
            window.history.back();
        }
    };

    const handleHome = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            {showBack && (
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </button>
            )}
            
            {showHome && (
                <button
                    onClick={handleHome}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                    <Home className="h-4 w-4" />
                    Voltar para o Início
                </button>
            )}
        </div>
    );
} 