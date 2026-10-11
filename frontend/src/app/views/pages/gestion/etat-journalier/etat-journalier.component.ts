import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';

/**
 * État journalier des chambres au format « resource timeline » (maison) :
 * chambres en lignes regroupées par bâtiment (pavillon), jours en colonnes.
 * Les séjours/réservations apparaissent en barres (jour(s) consécutifs fusionnés).
 */
@Component({
  selector: 'app-etat-journalier',
  templateUrl: './etat-journalier.component.html',
  styles: [`
    .rt-wrap { overflow: auto; max-height: 72vh; border: 1px solid #dee2e6; border-radius: .5rem; }
    table.rt { border-collapse: separate; border-spacing: 0; margin: 0; font-size: .78rem; width: max-content; min-width: 100%; }
    table.rt th, table.rt td { border-bottom: 1px solid #e9ecef; border-right: 1px solid #f1f3f5; padding: 0; white-space: nowrap; }
    table.rt thead th { position: sticky; top: 0; z-index: 3; background: #f1f3f5; text-align: center; font-weight: 600; padding: 3px 2px; }
    table.rt th.rt-room, table.rt td.rt-room { position: sticky; left: 0; z-index: 2; background: #fff; width: 118px; min-width: 118px; max-width: 118px; text-align: left; padding: 3px 8px; border-right: 2px solid #ced4da; }
    table.rt thead th.rt-room { z-index: 4; background: #e9ecef; }
    table.rt td.rt-room .n { font-weight: 700; }
    table.rt td.rt-room .t { display: block; font-size: .68rem; color: #6c757d; overflow: hidden; text-overflow: ellipsis; }
    table.rt td.rt-day { height: 26px; }
    table.rt .rt-bar { display: block; height: 22px; line-height: 22px; margin: 2px 1px; border-radius: 3px; font-size: .67rem; color: #fff; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
    table.rt .st-LIBRE .rt-bar { background: transparent; }
    table.rt .st-RESERVEE .rt-bar { background: #17a2b8; }
    table.rt .st-OCCUPEE .rt-bar { background: #dc3545; }
    table.rt .st-BLOQUEE .rt-bar { background: #6c757d; }
    table.rt tr.rt-grp td { background: #343a40; color: #fff; font-weight: 700; padding: 4px 10px; }
    table.rt tbody tr:hover td.rt-room { background: #fff9e6; }
    table.rt td.rt-today { background: #fff3cd; }
    table.rt thead th.rt-today { background: #ffe69c; }
    .lg-dot { display: inline-block; width: 14px; height: 14px; border-radius: 3px; margin-right: 4px; vertical-align: middle; }
  `]
})
export class EtatJournalierComponent implements OnInit {

  etat: any = null;
  planning: any = null;
  du = '';
  au = '';
  loading = false;

  constructor(private api: ApiService, private printService: PrintService) {}

  ngOnInit(): void {
    this.setWeek(new Date());
    this.load();
  }

  /** Lundi → dimanche de la semaine contenant {@code d}. */
  private setWeek(d: Date): void {
    const day = (d.getDay() + 6) % 7; // lundi = 0
    const mon = new Date(d); mon.setDate(d.getDate() - day);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    this.du = this.iso(mon);
    this.au = this.iso(sun);
  }

  private iso(d: Date): string {
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const j = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + j;
  }

  prev(): void { this.shift(-7); }
  next(): void { this.shift(7); }
  thisWeek(): void { this.setWeek(new Date()); this.load(); }

  private shift(days: number): void {
    const d = new Date(this.du + 'T00:00:00');
    d.setDate(d.getDate() + days);
    this.setWeek(d);
    this.load();
  }

  load(): void {
    if (!this.du || !this.au) return;
    this.loading = true;
    this.api.etatJournalier(this.du).subscribe(d => this.etat = d);
    this.api.planning(this.du, this.au).subscribe({
      next: (d) => { this.planning = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  jours(): any[] {
    return this.planning && this.planning.chambres && this.planning.chambres.length
      ? this.planning.chambres[0].jours : [];
  }

  // ---------- regroupement par bâtiment (pavillon) ----------
  groupes(): any[] {
    const chambres = (this.planning && this.planning.chambres) || [];
    const byPav = new Map<string, any[]>();
    chambres.forEach((c: any) => {
      const p = c.pavillonNom || 'Sans pavillon';
      if (!byPav.has(p)) byPav.set(p, []);
      byPav.get(p)!.push(c);
    });
    const ordre = [...byPav.keys()].sort((a, b) => this.rangPav(a) - this.rangPav(b) || a.localeCompare(b));
    return ordre.map((p) => ({
      titre: 'PAVILLON ' + p.toUpperCase(),
      nb: byPav.get(p)!.length,
      chambres: byPav.get(p)!.sort((x, y) => this.cmpNum(x.numero, y.numero))
    }));
  }

  private rangPav(nom: string): number {
    const n = (nom || '').toLowerCase();
    if (n.includes('chellah')) return 0;
    if (n.includes('oudayas')) return 1;
    return 2;
  }

  private cmpNum(a: string, b: string): number {
    return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
  }

  // ---------- barres : jours consécutifs de même statut fusionnés ----------
  runs(c: any): any[] {
    const js = c.jours || [];
    const out: any[] = [];
    let i = 0;
    while (i < js.length) {
      const s = js[i].statut;
      let span = 1;
      while (i + span < js.length && js[i + span].statut === s) span++;
      out.push({ span, statut: s, libelle: js[i].libelle, debut: js[i].date, fin: js[i + span - 1].date });
      i += span;
    }
    return out;
  }

  labelFor(r: any): string {
    if (r.statut === 'LIBRE') return '';
    return r.libelle || this.statutFr(r.statut);
  }

  statutFr(s: string): string {
    switch (s) {
      case 'RESERVEE': return 'Réservée';
      case 'OCCUPEE': return 'Occupée';
      case 'BLOQUEE': return 'Bloquée';
      default: return 'Libre';
    }
  }

  tooltip(c: any, r: any): string {
    return c.numero + ' — ' + (c.typeChambre || '') + ' · ' + this.statutFr(r.statut)
      + (r.libelle ? ' : ' + r.libelle : '') + ' (' + this.fmt(r.debut) + ' → ' + this.fmt(r.fin) + ')';
  }

  jourCourt(date: string): string {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()];
  }

  numJour(date: string): string { return date ? date.substring(8, 10) : ''; }

  fmt(date: string): string {
    return date ? (date.substring(8, 10) + '/' + date.substring(5, 7)) : '';
  }

  estAujourdhui(date: string): boolean { return date === this.iso(new Date()); }

  imprimer(): void {
    if (!this.planning) return;
    const jours = this.jours();
    let html = '<div class="hdr"><div>';
    html += '<div class="brand">ÉTAT JOURNALIER DES CHAMBRES</div>';
    html += '<div class="sub">Semaine du ' + this.fmt(this.planning.debut) + ' au ' + this.fmt(this.planning.fin) + '</div></div>';
    if (this.etat) {
      html += '<div class="sub">Total ' + this.etat.totalChambres + ' — Libres ' + this.etat.libres
        + ' — Occupées ' + this.etat.occupees + ' — Nettoyage ' + this.etat.nettoyage
        + ' — Bloquées ' + this.etat.bloquees + ' — Taux ' + this.etat.tauxOccupation + '%</div>';
    }
    html += '<div class="legend"><span class="lg LIBRE">Libre</span><span class="lg RESERVEE">Réservée</span>'
      + '<span class="lg OCCUPEE">Occupée</span><span class="lg BLOQUEE">Bloquée</span></div></div>';

    html += '<table class="matrix"><thead><tr><th class="etage">Chambre</th>';
    jours.forEach((j: any) => { html += '<th>' + this.jourCourt(j.date).charAt(0) + '<br>' + this.numJour(j.date) + '</th>'; });
    html += '</tr></thead><tbody>';
    this.groupes().forEach((g: any) => {
      html += '<tr><td class="pav-row" colspan="' + (jours.length + 1) + '">' + g.titre + '</td></tr>';
      g.chambres.forEach((c: any) => {
        html += '<tr><td class="lab"><b>' + c.numero + '</b> ' + (c.typeChambre || '') + '</td>';
        this.runs(c).forEach((r: any) => {
          html += '<td class="' + r.statut + '" colspan="' + r.span + '">' + this.labelFor(r) + '</td>';
        });
        html += '</tr>';
      });
    });
    html += '</tbody></table>';
    this.printService.print('État journalier des chambres', html, 'landscape');
  }
}
