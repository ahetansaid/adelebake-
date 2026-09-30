/** URL publique d'une photo stockée en base (utilisable côté client comme serveur). */
export function mediaUrl(id: string | null | undefined) {
  return id ? `/media/${id}` : null;
}
