'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  BedDouble, CalendarCheck, ExternalLink, LayoutDashboard, LogOut, Mail, Map, Menu, MessageSquareQuote, Presentation,
  Settings, UserCog, UtensilsCrossed,
} from 'lucide-react';
import { LogoMark } from '@/components/site/Logo';
import { logout } from '@/app/admin/login/actions';

type Counts = { bookings: number; quotes: number; messages: number };

export function Shell({ user, counts, children }: { user: { name: string; email: string }; counts: Counts; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const link = (href: string, label: string, Icon: typeof Mail, count?: number) => {
    const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
    return (
      <Link href={href} aria-current={active ? 'page' : undefined}>
        <Icon /> {label}
        {count ? <span className="count" aria-label={`${count} en attente`}>{count}</span> : null}
      </Link>
    );
  };

  return (
    <div className={`adm-shell${open ? ' is-open' : ''}`}>
      <aside className="adm-side" aria-label="Menu du back-office">
        <Link href="/admin" className="adm-brand">
          <LogoMark tone="light" className="" />
          <span><b>ADÉLÉ BAKÉ</b><small>Espace de gestion</small></span>
        </Link>
        <nav className="adm-nav">
          {link('/admin', 'Tableau de bord', LayoutDashboard)}
          <p>Demandes</p>
          {link('/admin/reservations', 'Réservations', CalendarCheck, counts.bookings)}
          {link('/admin/devis', 'Devis salle', Presentation, counts.quotes)}
          {link('/admin/messages', 'Messages', Mail, counts.messages)}
          <p>Contenus</p>
          {link('/admin/chambres', 'Chambres', BedDouble)}
          {link('/admin/carte', 'Carte du restaurant', UtensilsCrossed)}
          {link('/admin/excursions', 'Excursions', Map)}
          {link('/admin/avis', 'Avis clients', MessageSquareQuote)}
          <p>Réglages</p>
          {link('/admin/parametres', 'Coordonnées & infos', Settings)}
          {link('/admin/compte', 'Comptes', UserCog)}
          <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink /> Voir le site</a>
        </nav>
        <div className="adm-side__foot">
          {user.name}<br />
          <small>{user.email}</small>
          <form action={logout}><button type="submit"><LogOut size={15} /> Se déconnecter</button></form>
        </div>
      </aside>
      <div className="adm-main">
        <button className="a-btn a-btn--ghost adm-burger" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu /> Menu</button>
        {children}
      </div>
    </div>
  );
}
