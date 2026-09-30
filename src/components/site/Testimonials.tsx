'use client';

import { useEffect, useState } from 'react';

type T = { id: string; author: string; origin: string | null; quote: string; isExample: boolean };

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function Testimonials({ items }: { items: T[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  const cur = items[i];
  if (!cur) return null;
  return (
    <>
      <blockquote key={cur.id} aria-live="polite">
        <p>« {cur.quote} »</p>
        <footer>
          <span className="avatar" aria-hidden="true">{initials(cur.author)}</span>
          <span>
            <b>{cur.author}</b>
            <small>{cur.origin}</small>
          </span>
        </footer>
      </blockquote>
      {cur.isExample && <p className="note note--light" style={{ marginTop: '1rem' }}>Avis d&apos;exemple — à remplacer par de vrais avis clients.</p>}
      {items.length > 1 && (
        <div className="say__dots">
          {items.map((t, k) => (
            <button key={t.id} aria-label={`Avis ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} />
          ))}
        </div>
      )}
    </>
  );
}
