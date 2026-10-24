import React from 'react';
import styles from './SimplificMascot.module.css';

/**
 * Mascote Simplific Pro no estilo de desenho minimalista/doodle (Pierre),
 * com óculos escuros e animação de reflexo passando nas lentes.
 * Adaptável para modo claro (Light) e escuro (Dark).
 */
const SimplificMascot = ({ size = 96, className = "" }) => {
  return (
    <div 
      className={`${styles.mascotContainer} ${styles.floatingMascot} ${className}`}
      style={{ width: size, height: size }}
      aria-label="Mascote Simplific Pro"
    >
      <svg
        viewBox="0 0 120 125"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.mascotSvg}
      >
        <defs>
          {/* Máscara de recorte apenas para as lentes do óculos */}
          <clipPath id="glasses-lenses-clip">
            {/* Lente Esquerda */}
            <path d="M 33 49 L 55 49 C 56.5 61 53 67 44 67 C 36 67 33 61 33 49 Z" />
            {/* Lente Direita */}
            <path d="M 65 49 L 87 49 C 88.5 61 85 67 76 67 C 68 67 65 61 65 49 Z" />
          </clipPath>

          {/* Gradiente do feixe de reflexo no óculos */}
          <linearGradient id="glasses-glint-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="52%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Cabelo Volumoso com Penteado Característico (Traço + Leve Preenchimento) */}
        {/* Mechas do Topo / Topete */}
        <path
          d="M 35 44 C 24 35 22 21 34 14 C 44 8 57 7 68 9 C 80 11 92 18 92 30 C 96 34 97 40 93 45"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Mechas internas do Cabelo */}
        <path
          d="M 46 12 C 54 18 64 20 75 16"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 38 24 C 48 26 62 25 72 23"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 76 13 C 84 19 88 25 87 32"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* 2. Orelhas */}
        <path
          d="M 29 55 C 22 55 22 66 29 68"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 91 55 C 98 55 98 66 91 68"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Contorno do Rosto / Queixo Amigável */}
        <path
          d="M 29 59 C 30 74 42 88 60 88 C 78 88 90 74 91 59"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 4. Nariz e Sorriso Confiante */}
        <path
          d="M 59 72 L 61 74 L 59 75"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Sorriso */}
        <path
          d="M 47 79 C 53 84 67 84 73 79"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Covinhas do sorriso */}
        <path
          d="M 45 78 L 47 80"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 75 78 L 73 80"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 5. Pescoço e Gola da Camiseta */}
        <path
          d="M 48 88 L 46 98"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 72 88 L 74 98"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 36 106 C 48 114 72 114 84 106"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 36 106 C 24 110 16 118 12 122"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 84 106 C 96 110 104 118 108 122"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* 6. ÓCULOS ESCUROS ESTILO PIERRE COM REFLEXO ANIMADO */}
        {/* Lentes Preenchidas Escuras */}
        <path
          d="M 33 49 L 55 49 C 56.5 61 53 67 44 67 C 36 67 33 61 33 49 Z"
          fill="#121316"
          className="dark:fill-[#09090b]"
        />
        <path
          d="M 65 49 L 87 49 C 88.5 61 85 67 76 67 C 68 67 65 61 65 49 Z"
          fill="#121316"
          className="dark:fill-[#09090b]"
        />

        {/* EFEITO DE REFLEXO PASSANDO PELAS LENTES (CLIP-PATH + ANIMATION) */}
        <g clipPath="url(#glasses-lenses-clip)">
          <rect
            x="-40"
            y="35"
            width="60"
            height="45"
            fill="url(#glasses-glint-gradient)"
            className={styles.glassesReflexo}
          />
        </g>

        {/* Armação Externa dos Óculos e Ponte */}
        {/* Ponte Central */}
        <path
          d="M 54 53 L 66 53"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        {/* Haste Esquerda */}
        <path
          d="M 27 52 L 34 52"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Haste Direita */}
        <path
          d="M 86 52 L 93 52"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Borda da Lente Esquerda */}
        <path
          d="M 33 49 L 55 49 C 56.5 61 53 67 44 67 C 36 67 33 61 33 49 Z"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Borda da Lente Direita */}
        <path
          d="M 65 49 L 87 49 C 88.5 61 85 67 76 67 C 68 67 65 61 65 49 Z"
          className="stroke-zinc-900 dark:stroke-zinc-100"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default SimplificMascot;
