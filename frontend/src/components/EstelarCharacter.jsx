import { motion } from 'framer-motion';

/**
 * Ilustração 100% ORIGINAL de uma princesa cósmica, criada especialmente para
 * este projeto — não reproduz nenhuma arte oficial de personagens de
 * terceiros (nem design de rosto, nem traje, nem paleta exata de pele/cabelo
 * de qualquer obra existente). O destaque é a animação dos olhos brilhando,
 * que fica mais intensa quando a Estelar está "pensando" (prop `thinking`),
 * dando a sensação de que ela está canalizando energia para responder.
 */
export default function EstelarCharacter({ size = 160, thinking = false, className = '' }) {
  return (
    <motion.div
      className={`estelar-character ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={thinking ? 'glow-intense' : 'glow-soft'}
      >
        <defs>
          <radialGradient id="skinGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#c9a7f0" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </radialGradient>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0faff" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>

        {/* cabelo (atrás) */}
        <path
          d="M40 70 Q20 140 55 185 Q100 200 145 185 Q180 140 160 70 Q150 20 100 15 Q50 20 40 70 Z"
          fill="url(#hairGradient)"
        />

        {/* rosto */}
        <ellipse cx="100" cy="95" rx="48" ry="55" fill="url(#skinGradient)" />

        {/* franja */}
        <path d="M55 70 Q100 30 145 70 Q140 55 100 45 Q60 55 55 70 Z" fill="url(#hairGradient)" />

        {/* tiara estelar */}
        <polygon
          points="100,38 106,52 121,52 109,61 114,76 100,67 86,76 91,61 79,52 94,52"
          fill="#fde68a"
          opacity="0.9"
        />

        {/* glow dos olhos (camada animada via CSS) */}
        <circle className="eye-glow" cx="78" cy="95" r="14" fill="url(#eyeGlow)" />
        <circle className="eye-glow" cx="122" cy="95" r="14" fill="url(#eyeGlow)" />

        {/* núcleo dos olhos */}
        <circle className="eye-core" cx="78" cy="95" r="7" fill="#ffffff" />
        <circle className="eye-core" cx="122" cy="95" r="7" fill="#ffffff" />

        {/* sobrancelhas */}
        <path d="M66 82 Q78 75 90 82" stroke="#5b21b6" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M110 82 Q122 75 134 82" stroke="#5b21b6" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* sorriso */}
        <path d="M82 120 Q100 132 118 120" stroke="#5b1a8b" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* partículas cósmicas ao redor da personagem */}
      <span className="sparkle sparkle-1" />
      <span className="sparkle sparkle-2" />
      <span className="sparkle sparkle-3" />
    </motion.div>
  );
}
