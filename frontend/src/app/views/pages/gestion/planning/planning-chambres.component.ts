import { Component, HostListener, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';

/**
 * Planning des chambres au format « resource timeline » (maison, sans dépendance) :
 * chambres en lignes, jours en colonnes sur le mois complet, regroupées par pavillon
 * (Chellah puis Oudayas), puis par type de chambre, puis par numéro.
 * Les séjours/réservations sont des barres fusionnant les jours consécutifs de même
 * statut. Un clic sur une barre ouvre la prolongation du séjour/de la réservation,
 * le zoom (scale) ajuste la largeur des colonnes et une ligne rouge marque le jour courant.
 */
@Component({
  selector: 'app-planning-chambres',
  templateUrl: './planning-chambres.component.html',
  styles: [`
    .rt-wrap { overflow: auto; max-height: 72vh; border: 1px solid #dee2e6; border-radius: .5rem; }
    .rt-inner { position: relative; display: inline-block; vertical-align: top; min-width: 100%; }
    .rt-today-line { position: absolute; top: 0; bottom: 0; width: 2px; background: #dc3545; z-index: 1; pointer-events: none; }
    table.rt { border-collapse: separate; border-spacing: 6px 0; margin: 0; font-size: .78rem; width: max-content; min-width: 100%; }
    table.rt th, table.rt td { border-bottom: 1px solid #e9ecef; border-right: 1px solid #f1f3f5; padding: 0; white-space: nowrap; }
    table.rt thead th { position: sticky; top: 0; z-index: 3; background: #f1f3f5; text-align: center; font-weight: 600; padding: 3px 2px; }
    table.rt thead th:not(.rt-room) { border: 1px solid #adb5bd; border-radius: 4px; }
    table.rt thead th.rt-jour-courant { background: #f8d7da; color: #842029; border-color: #dc3545; }
    table.rt th.rt-room, table.rt td.rt-room { position: sticky; left: 0; z-index: 2; background: #fff; width: 118px; min-width: 118px; max-width: 118px; text-align: left; padding: 3px 8px; border-right: 2px solid #ced4da; box-shadow: 6px 0 0 0 #fff; }
    table.rt thead th.rt-room { z-index: 4; background: #e9ecef; }
    table.rt td.rt-room .n { font-weight: 700; }
    table.rt td.rt-room .t { display: block; font-size: .68rem; color: #6c757d; overflow: hidden; text-overflow: ellipsis; }
    table.rt td.rt-day { height: 26px; border: 1px solid #e9ecef; border-radius: 3px; }
    table.rt td.rt-day.st-LIBRE { border-color: #e9ecef; }
    table.rt td.rt-day.st-RESERVEE { border-color: #9eeaf9; }
    table.rt td.rt-day.st-OCCUPEE { border-color: #f1aeb5; }
    table.rt td.rt-day.st-BLOQUEE { border-color: #ced4da; }
    table.rt td.rt-day.cliquable { cursor: pointer; }
    table.rt .rt-bar { display: block; height: 22px; line-height: 22px; margin: 2px 2px; border-radius: 3px; font-size: .67rem; color: #fff; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
    table.rt .st-LIBRE .rt-bar { background: transparent; }
    table.rt .st-RESERVEE .rt-bar { background: #17a2b8; }
    table.rt .st-OCCUPEE .rt-bar { background: #dc3545; }
    table.rt .st-BLOQUEE .rt-bar { background: #6c757d; }
    table.rt tr.rt-grp td { background: #343a40; color: #fff; font-weight: 700; padding: 4px 10px; box-shadow: -6px 0 0 #343a40, 6px 0 0 #343a40; }
    table.rt tr.rt-sub td { background: #e7f1ff; color: #084298; font-weight: 600; padding: 3px 14px; box-shadow: -6px 0 0 #e7f1ff, 6px 0 0 #e7f1ff; }
    table.rt tbody tr:hover td.rt-room { background: #fff9e6; }
    .lg-dot { display: inline-block; width: 14px; height: 14px; border-radius: 3px; margin-right: 4px; vertical-align: middle; }
    .lg-line { display: inline-block; width: 3px; height: 14px; background: #dc3545; margin-right: 4px; vertical-align: middle; }
  `]
})
export class PlanningChambresComponent implements OnInit {

  pavillons: any[] = [];
  pavillonId: number | null = null;
  mois = '';
  planning: any = null;
  loading = false;

  /** Échelle (zoom) : 1 = 34 px par colonne-jour. */
  zoom = 1;

  /** Position (px) de la ligne rouge « aujourd'hui » ; -1 si hors du mois affiché. */
  todayLeft = -1;

  constructor(private api: ApiService, private printService: PrintService) {}

  ngOnInit(): void {
    const n = new Date();
    this.mois = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
    this.api.pavillons().subscribe(d => this.pavillons = d);
    this.load();
  }

  // ----------------------------------------------------- période & échelle
  debut(): string {
    return this.mois + '-01';
  }

  fin(): string {
    const parts = this.mois.split('-');
    const last = new Date(Number(parts[0]), Number(parts[1]), 0).getDate();
    return this.mois + '-' + String(last).padStart(2, '0');
  }

  prevMois(): void { this.mois = this.decalerMois(this.mois, -1); this.load(); }
  nextMois(): void { this.mois = this.decalerMois(this.mois, 1); this.load(); }

  ceMois(): void {
    const n = new Date();
    this.mois = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
    this.load();
  }

  private decalerMois(mois: string, delta: number): string {
    const p = (mois || '').split('-');
    const d = new Date(Number(p[0]), Number(p[1]) - 1 + delta, 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  colW(): number { return Math.round(34 * this.zoom); }
  zoomIn(): void { this.zoom = Math.min(3, Math.round((this.zoom + 0.2) * 10) / 10); this.majLigneAujourdhui(); }
  zoomOut(): void { this.zoom = Math.max(0.5, Math.round((this.zoom - 0.2) * 10) / 10); this.majLigneAujourdhui(); }
  resetZoom(): void { this.zoom = 1; this.majLigneAujourdhui(); }

  @HostListener('window:resize')
  onResize(): void { this.majLigneAujourdhui(); }

  estAujourdhui(date: string): boolean { return date === this.iso(new Date()); }

  /** Recalcule la position de la ligne rouge à partir de la colonne « aujourd'hui ». */
  private majLigneAujourdhui(): void {
    setTimeout(() => {
      const th = document.querySelector('table.rt thead th.rt-jour-courant') as HTMLElement | null;
      this.todayLeft = th ? th.offsetLeft + th.offsetWidth / 2 : -1;
    });
  }

  load(): void {
    if (!this.mois) return;
    this.loading = true;
    this.api.planning(this.debut(), this.fin(), this.pavillonId || undefined).subscribe({
      next: (d) => { this.planning = d; this.loading = false; this.majLigneAujourdhui(); },
      error: () => { this.loading = false; }
    });
  }

  jours(): any[] {
    return this.planning && this.planning.chambres && this.planning.chambres.length
      ? this.planning.chambres[0].jours : [];
  }

  // ---------- regroupement : pavillon (Chellah puis Oudayas) → type → numéro ----------
  groupes(): any[] {
    const chambres = (this.planning && this.planning.chambres) || [];
    const byPav = new Map<string, any[]>();
    chambres.forEach((c: any) => {
      const p = c.pavillonNom || 'Sans pavillon';
      if (!byPav.has(p)) byPav.set(p, []);
      byPav.get(p)!.push(c);
    });
    const pavOrdre = [...byPav.keys()].sort((a, b) => this.rangPav(a) - this.rangPav(b) || a.localeCompare(b));
    return pavOrdre.map((p) => {
      const rooms = byPav.get(p)!;
      const byType = new Map<string, any[]>();
      rooms.forEach((c: any) => {
        const t = c.typeChambre || 'Autre';
        if (!byType.has(t)) byType.set(t, []);
        byType.get(t)!.push(c);
      });
      const typeOrdre = [...byType.keys()].sort((a, b) => this.minNum(byType.get(a)!) - this.minNum(byType.get(b)!));
      return {
        titre: 'PAVILLON ' + p.toUpperCase(),
        nb: rooms.length,
        sous: typeOrdre.map((t) => ({
          titre: t,
          chambres: byType.get(t)!.sort((x, y) => this.cmpNum(x.numero, y.numero))
        }))
      };
    });
  }

  private rangPav(nom: string): number {
    const n = (nom || '').toLowerCase();
    if (n.includes('chellah')) return 0;
    if (n.includes('oudayas')) return 1;
    return 2;
  }

  private minNum(list: any[]): number {
    return Math.min(...list.map((c: any) => parseInt(c.numero, 10) || 0));
  }

  private cmpNum(a: string, b: string): number {
    return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
  }

  // ---------- barres : fusionne les jours consécutifs de même statut ----------
  runs(c: any): any[] {
    const js = c.jours || [];
    const out: any[] = [];
    let i = 0;
    while (i < js.length) {
      const s = js[i].statut;
      let span = 1;
      while (i + span < js.length && js[i + span].statut === s) span++;
      out.push({
        span,
        statut: s,
        libelle: js[i].libelle,
        debut: js[i].date,
        fin: js[i + span - 1].date,
        sejourId: js[i].sejourId,
        reservationId: js[i].reservationId
      });
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
    const base = c.numero + ' — ' + (c.typeChambre || '') + ' · ' + this.statutFr(r.statut)
      + (r.libelle ? ' : ' + r.libelle : '') + ' (' + this.fmt(r.debut) + ' → ' + this.fmt(r.fin) + ')';
    return this.peutProlonger(r) ? base + ' — cliquer pour prolonger' : base;
  }

  jourCourt(date: string): string {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()];
  }

  numJour(date: string): string {
    return date ? date.substring(8, 10) : '';
  }

  fmt(date: string): string {
    return date ? (date.substring(8, 10) + '/' + date.substring(5, 7)) : '';
  }

  // ------------------------------------------------------ prolongation
  peutProlonger(r: any): boolean {
    return r.statut === 'OCCUPEE' || r.statut === 'RESERVEE';
  }

  prolonger(c: any, r: any): void {
    if (!this.peutProlonger(r)) return;
    const estSejour = r.statut === 'OCCUPEE';
    const id = estSejour ? r.sejourId : r.reservationId;
    if (!id) {
      Swal.fire('Prolongation', 'Aucun ' + (estSejour ? 'séjour' : 'réservation') + ' associé à cette ligne.', 'info');
      return;
    }
    const obs = estSejour ? this.api.sejourById(id) : this.api.reservationById(id);
    obs.subscribe({
      next: (e: any) => this.promptProlongation(c, r, e, estSejour, id),
      error: () => Swal.fire('Erreur', 'Impossible de charger ' + (estSejour ? 'le séjour' : 'la réservation') + '.', 'error')
    });
  }

  private promptProlongation(c: any, r: any, e: any, estSejour: boolean, id: number): void {
    const arrivee: string = estSejour
      ? (e.dateCheckin ? String(e.dateCheckin).substring(0, 10) : '')
      : (e.dateArrivee || '');
    const departActuel: string = estSejour ? (e.dateDepartPrevue || '') : (e.dateDepart || '');
    const mini = arrivee ? this.plusUnJour(arrivee) : undefined;
    const nom = e.client ? (e.client.nomComplet || '') : (r.libelle || '');
    Swal.fire({
      title: 'Prolonger ' + (estSejour ? 'le séjour' : 'la réservation'),
      html: '<div class="text-start small">'
        + '<div><b>Chambre ' + c.numero + '</b> · ' + (c.typeChambre || '') + '</div>'
        + '<div class="text-muted">' + nom + '</div>'
        + '<div class="text-muted">Arrivée : ' + this.fmt(arrivee) + ' — Départ actuel : ' + this.fmt(departActuel) + '</div>'
        + '<div class="text-muted mt-2">Nouvelle date de départ</div>'
        + '<input id="swal-depart" type="date" class="form-control" value="' + (departActuel || mini || '') + '" min="' + (mini || '') + '">'
        + '</div>',
      showCancelButton: true,
      confirmButtonText: 'Prolonger',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const el = document.getElementById('swal-depart') as HTMLInputElement;
        const v = el ? el.value : '';
        if (!v) { Swal.showValidationMessage('Veuillez choisir une date de départ.'); return false; }
        if (departActuel && v <= departActuel) {
          Swal.showValidationMessage('La nouvelle date doit être postérieure au départ actuel.');
          return false;
        }
        return v;
      }
    }).then((res) => {
      if (!res.isConfirmed || !res.value) return;
      const nouveau = String(res.value);
      const save = estSejour ? this.api.prolongerSejour(id, nouveau) : this.api.prolongerReservation(id, nouveau);
      save.subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Prolongation enregistrée', timer: 1000, showConfirmButton: false });
          this.load();
        },
        error: (er: any) => Swal.fire('Erreur', er.error?.message || 'Prolongation impossible', 'error')
      });
    });
  }

  private plusUnJour(date: string): string {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return this.iso(d);
  }

  private iso(d: Date): string {
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const j = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + j;
  }

  imprimer(): void {
    if (!this.planning) return;
    const jours = this.jours();
    let html = '<div class="hdr"><div>';
    html += '<div class="brand">PLANNING DES CHAMBRES</div>';
    html += '<div class="sub">'
      + (this.planning.pavillonNom ? 'Pavillon ' + this.planning.pavillonNom : 'Tous les pavillons')
      + ' — du ' + this.fmt(this.planning.debut) + ' au ' + this.fmt(this.planning.fin)
      + ' &nbsp;·&nbsp; ' + ((this.planning.chambres || []).length) + ' chambres</div></div>';
    html += '<div class="legend"><span class="lg LIBRE">Libre</span><span class="lg RESERVEE">Réservée</span>'
      + '<span class="lg OCCUPEE">Occupée</span><span class="lg BLOQUEE">Bloquée</span></div></div>';

    html += '<table class="matrix"><thead><tr><th class="etage">Chambre</th>';
    jours.forEach((j: any) => {
      html += '<th' + (this.estAujourdhui(j.date) ? ' style="background:#f8d7da;color:#842029;"' : '') + '>' + this.numJour(j.date) + '</th>';
    });
    html += '</tr></thead><tbody>';
    this.groupes().forEach((g: any) => {
      html += '<tr><td class="pav-row" colspan="' + (jours.length + 1) + '">' + g.titre + '</td></tr>';
      g.sous.forEach((sg: any) => {
        html += '<tr><td class="sub-row" colspan="' + (jours.length + 1) + '">' + sg.titre + '</td></tr>';
        sg.chambres.forEach((c: any) => {
          html += '<tr><td class="lab"><b>' + c.numero + '</b> ' + (c.typeChambre || '') + '</td>';
          this.runs(c).forEach((r: any) => {
            html += '<td class="' + r.statut + '" colspan="' + r.span + '">' + this.labelFor(r) + '</td>';
          });
          html += '</tr>';
        });
      });
    });
    html += '</tbody></table>';
    this.printService.print('Planning des chambres', html, 'landscape');
  }
}
