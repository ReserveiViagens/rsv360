import React from 'react';

interface RSVLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function RSVLogo({ width = 120, height = 120, className = '' }: RSVLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo externo - Azul-claro */}
      <circle cx="60" cy="60" r="58" stroke="#4FC3F7" strokeWidth="2" fill="none" />
      {/* Círculo interno - Azul mais claro */}
      <circle cx="60" cy="60" r="54" stroke="#81D4FA" strokeWidth="1.5" fill="none" />
      
      {/* Símbolo principal (checkmark/r estilizado) - Verde-água vibrante */}
      <path
        d="M 30 40 L 30 50 L 45 65 L 60 50 L 60 45 L 45 60 L 30 45 Z"
        fill="#26A69A"
        stroke="#26A69A"
        strokeWidth="2.5"
      />
      <path
        d="M 45 40 Q 55 40 60 45"
        stroke="#26A69A"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Avião - Roxo-claro/Magenta */}
      <g transform="translate(20, 80)">
        <path
          d="M 0 0 L 6 -3 L 10 0 L 6 3 Z"
          fill="#BA68C8"
          stroke="#BA68C8"
          strokeWidth="1.2"
        />
        <path
          d="M 10 0 Q 15 -1.5 18 0 Q 15 1.5 10 0"
          stroke="#BA68C8"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      
      {/* Pin de localização - Roxo-claro/Magenta */}
      <g transform="translate(75, 45)">
        <path
          d="M 0 0 L -2.5 5 L 0 7 L 2.5 5 Z"
          fill="#BA68C8"
          stroke="#BA68C8"
          strokeWidth="1"
        />
        <circle cx="0" cy="0" r="2.5" fill="#BA68C8" />
      </g>
      
      {/* Ondas - Verde-água e Azul-claro */}
      <g transform="translate(25, 100)">
        {/* Onda superior - Verde-água */}
        <path
          d="M 0 0 Q 8 -2 16 0 Q 24 2 32 0 Q 40 -2 48 0 Q 56 2 64 0"
          stroke="#26A69A"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Onda inferior - Azul-claro/Ciano */}
        <path
          d="M 0 4 Q 8 2 16 4 Q 24 6 32 4 Q 40 2 48 4 Q 56 6 64 4"
          stroke="#4FC3F7"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

