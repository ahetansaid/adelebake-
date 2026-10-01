'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Slide = { src: string; alt: string; label: string };
const DUR = 6000;

/** Moment phare de l'accueil : l'image choisie se révèle en volet (clip-path). */
export function HeroSlider({ slides }: { slides: readonly Slide[] }) {
  const [cur, setCur] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const curRef = useRef(0);

  const go = useCallback((i: number) => {
    if (i === curRef.current) return;
    setLeaving(curRef.current);
    curRef.current = i;
    setCur(i);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setLeaving(null), 1100);
  }, []);

  useEffect(() => {
    const schedule = () => {
      clearTimeout(timer.current);
      if (!document.hidden) timer.current = setTimeout(() => go((cur + 1) % slides.length), DUR);
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [cur, go, slides.length]);

  return (
    <>
      <div className="hero__stage">
        {slides.map((s, i) => (
          <figure key={s.src} className={`slide${i === cur ? ' is-active' : ''}${i === leaving ? ' is-leaving' : ''}`}>
            <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="100vw" />
          </figure>
        ))}
      </div>
      <div className="hero__shade" />
      <div className="hero__thumbs" role="tablist" aria-label="Choisir une vue" style={{ ['--dur' as string]: `${DUR}ms` }}>
        {slides.map((s, i) => (
          <button key={s.src} role="tab" aria-selected={i === cur} aria-label={`Afficher : ${s.label}`} onClick={() => go(i)}>
            <Image src={s.src} alt="" fill sizes="128px" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
