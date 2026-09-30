'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

const NAV = [
  { href: '/chambres', label: 'Chambres' },
  { href: '/la-table', label: 'La table' },
  { href: '/salle-de-conference', label: 'Conférences' },
  { href: '/decouvrir', label: 'Découvrir' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // referme le menu mobile à chaque changement de page
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`top${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <Logo tone="light" />
      <nav className="top__nav" id="menu-principal" aria-label="Navigation principale">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className="btn btn--copper top__cta" href="/reservation">
        Réserver
      </Link>
      <button
        className="top__burger"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
