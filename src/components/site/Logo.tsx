import Link from 'next/link';
import { useId } from 'react';

/** Logo recréé en SVG d'après le logo fourni (à remplacer par le fichier vectoriel officiel). */
export function LogoMark({ tone = 'dark', className = 'logo__mark' }: { tone?: 'light' | 'dark'; className?: string }) {
  const id = useId().replace(/:/g, '');
  const ink = tone === 'light' ? ['#F3D2B2', '#E0A574', '#C9854F'] : ['#D39A67', '#A8643A', '#7C4424'];
  return (
    <svg className={className} viewBox="0 0 120 96" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={ink[0]} />
          <stop offset=".55" stopColor={ink[1]} />
          <stop offset="1" stopColor={ink[2]} />
        </linearGradient>
      </defs>
      <text x="60" y="54" textAnchor="middle" fontFamily="var(--font-logo), Cinzel, serif" fontSize="56" fontWeight="500" letterSpacing="-6" fill={`url(#${id})`}>
        AB
      </text>
      <path d="M4 92 C 26 82, 46 70, 60 58 C 74 70, 94 82, 116 92" fill="none" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" />
      <g fill={`url(#${id})`}>
        <rect x="54.5" y="70" width="5" height="5" rx=".6" />
        <rect x="60.5" y="70" width="5" height="5" rx=".6" />
        <rect x="54.5" y="76" width="5" height="5" rx=".6" />
        <rect x="60.5" y="76" width="5" height="5" rx=".6" />
      </g>
    </svg>
  );
}

export function Logo({ tone = 'light', stack = false }: { tone?: 'light' | 'dark'; stack?: boolean }) {
  return (
    <Link href="/" className={`logo logo--${tone}${stack ? ' logo--stack' : ''}`} aria-label="Adélé Baké — accueil">
      <LogoMark tone={tone} />
      <span className="logo__word">
        <span className="logo__name">Adélé Baké</span>
        <span className="logo__tag">Guesthouse &amp; Conference Venue</span>
      </span>
    </Link>
  );
}
