import type { BookingStatus, EventFormat, MenuSection, MessageStatus, QuoteStatus } from '@prisma/client';

type Badge = { label: string; tone: 'new' | 'ok' | 'warn' | 'off' | 'err' };

export const BOOKING_STATUS: Record<BookingStatus, Badge> = {
  NEW: { label: 'Nouvelle', tone: 'new' },
  CONFIRMED: { label: 'Confirmée', tone: 'ok' },
  DECLINED: { label: 'Refusée', tone: 'err' },
  CANCELLED: { label: 'Annulée', tone: 'off' },
};

export const QUOTE_STATUS: Record<QuoteStatus, Badge> = {
  NEW: { label: 'Nouvelle', tone: 'new' },
  QUOTED: { label: 'Devis envoyé', tone: 'warn' },
  WON: { label: 'Acceptée', tone: 'ok' },
  LOST: { label: 'Perdue', tone: 'off' },
};

export const MESSAGE_STATUS: Record<MessageStatus, Badge> = {
  NEW: { label: 'Non lu', tone: 'new' },
  READ: { label: 'Lu', tone: 'off' },
  ANSWERED: { label: 'Répondu', tone: 'ok' },
  ARCHIVED: { label: 'Archivé', tone: 'off' },
};

export const FORMAT_LABEL: Record<EventFormat, string> = { HALF_DAY: 'Demi-journée', FULL_DAY: 'Journée', MULTI_DAY: 'Plusieurs jours' };

export const SECTION_LABEL: Record<MenuSection, string> = {
  BENINOIS: 'Cuisine béninoise', GRILLADES: 'Grillades', PETIT_DEJEUNER: 'Petit-déjeuner', BOISSONS: 'Boissons',
};
