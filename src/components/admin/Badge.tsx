export function Badge({ b }: { b: { label: string; tone: string } }) {
  return <span className={`badge badge--${b.tone}`}>{b.label}</span>;
}
