/**
 * Conversions entre une date « métier » au format ISO (yyyy-MM-dd, tel qu'envoyé
 * à l'API) et l'objet Date utilisé par les sélecteurs Angular Material.
 *
 * Les modèles restent des chaînes ISO : seule l'interface se sert de ces helpers
 * pour alimenter / lire les matDatepicker, ce qui évite de toucher à la logique
 * métier et aux appels API existants.
 */

/** Chaîne ISO (yyyy-MM-dd), objet Date, ou « yyyy-MM » → Date locale. */
export function isoToDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') return new Date(value);
  const s = String(value).trim();
  if (!s) return null;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3]);
  const ym = /^(\d{4})-(\d{2})$/.exec(s);
  if (ym) return new Date(+ym[1], +ym[2] - 1, 1);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Date (ou chaîne) → chaîne ISO « yyyy-MM-dd » ('' si vide). */
export function dateToIso(value: any): string {
  const d = isoToDate(value);
  if (!d) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Date (ou chaîne) → « yyyy-MM » (pour un filtre mensuel). */
export function dateToMois(value: any): string {
  const d = isoToDate(value);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
