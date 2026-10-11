import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';

@Component({
  selector: 'app-planning-gouvernante',
  templateUrl: './planning-gouvernante.component.html',
  styles: [`
    .matrix-table th, .matrix-table td { text-align: center; vertical-align: middle; }
    .matrix-table thead th { background: #f1f3f5; font-size: .8rem; }
    .matrix-table .etage-cell { width: 56px; background: #f1f3f5; font-size: .8rem; white-space: nowrap; }
    .matrix-table .room-cell { min-width: 96px; padding: 4px 6px; }
    .matrix-table .room-cell .room-num { font-weight: 700; }
    .matrix-table .room-cell .room-type { font-size: .72rem; color: #6c757d; }
    .matrix-table .room-cell .room-badges { display: flex; gap: 3px; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 2px; }
    .matrix-table .room-cell .room-situation { display: inline-block; margin-top: 3px; font-size: .7rem; font-weight: 700; padding: 1px 6px; border-radius: 3px; }
    .matrix-table .room-cell.m-clean { background: #e8f6ec; }
    .matrix-table .room-cell.m-verif { background: #fff7e0; }
    .matrix-table .room-cell.m-dirty { background: #fdeaea; }
    .matrix-table .room-cell.m-block { background: #ececec; }
    .sit-recouche, .s-recouche { background: #dbeafe; color: #1e40af; }
    .sit-depart, .s-depart { background: #f8d7da; color: #842029; }
    .sit-arrivee, .s-arrivee { background: #d1e7dd; color: #0f5132; }
  `]
})
export class PlanningGouvernanteComponent implements OnInit {

  date: string;
  data: any = { pavillons: [] };

  private etatsMenage = [
    { code: 'CLEAN', label: 'Clean', cls: 'success' },
    { code: 'A_VERIFIER', label: 'À vérifier', cls: 'warning' },
    { code: 'DIRTY', label: 'Dirty', cls: 'danger' },
    { code: 'BLOQUEE', label: 'Bloquée', cls: 'secondary' }
  ];

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.date = new Date().toISOString().substring(0, 10);
    this.load();
  }

  load(): void {
    this.api.planningOccupation(this.date).subscribe(d => this.data = d || { pavillons: [] });
  }

  etatInfo(code: string): any {
    return this.etatsMenage.find(e => e.code === code) || { label: code, cls: 'light' };
  }

  menageCls(code: string): string {
    if (code === 'CLEAN') return 'm-clean';
    if (code === 'A_VERIFIER') return 'm-verif';
    if (code === 'DIRTY') return 'm-dirty';
    if (code === 'BLOQUEE') return 'm-block';
    return '';
  }

  sitCls(code: string): string {
    if (code === 'DEPART') return 's-depart';
    if (code === 'RECOUCHE') return 's-recouche';
    if (code === 'ARRIVEE') return 's-arrivee';
    return '';
  }

  responsableNoms(pav: any): string {
    const r = (pav.responsables || []).map((g: any) => g.nom);
    return r.length ? r.join(', ') : '—';
  }

  femmesNoms(pav: any): string {
    return (pav.femmes || []).map((g: any) => g.nom).join(', ');
  }

  imprimer(): void {
    if (!this.data) return;
    let html = '<div class="hdr"><div class="brand">PLANNING D\'OCCUPATION DES CHAMBRES</div>'
      + '<div class="sub">Journée du ' + this.fmt(this.data.date)
      + ' &nbsp;·&nbsp; Départ : <b>' + (this.data.nbDepart || 0) + '</b>'
      + ' &nbsp;·&nbsp; Recouché : <b>' + (this.data.nbRecouche || 0) + '</b>'
      + ' &nbsp;·&nbsp; Arrivée : <b>' + (this.data.nbArrivee || 0) + '</b>'
      + ' &nbsp;·&nbsp; Chambres : <b>' + (this.data.nbChambres || 0) + '</b></div></div>';

    (this.data.pavillons || []).forEach((pav: any) => {
      html += '<div class="pav-title">PAVILLON ' + (pav.pavillon || '').toUpperCase()
        + ' <span class="pav-g">Gouvernante : ' + this.responsableNoms(pav) + '</span></div>';
      html += this.matrixHtml(pav);
      if (pav.femmes && pav.femmes.length) {
        html += '<div class="pav-femmes">Femmes de chambre : ' + this.femmesNoms(pav) + '</div>';
      }
    });

    html += '<div class="legend"><span class="lg s-recouche">Recouché</span>'
      + '<span class="lg s-depart">Départ</span><span class="lg s-arrivee">Arrivée</span></div>';

    this.print.print('Planning d\'occupation ' + this.fmt(this.data.date), html, 'landscape');
  }

  private matrixHtml(pav: any): string {
    const cols = this.colonnes(pav).length;
    let h = '<table class="matrix"><thead><tr><th class="etage">Étage</th>'
      + '<th colspan="' + cols + '">Chambres — n° · situation</th></tr></thead><tbody>';
    (pav.etages || []).forEach((e: any) => {
      h += '<tr><th class="etage">Étage<br>' + e.etage + '</th>';
      (e.chambres || []).forEach((c: any) => {
        h += '<td class="room">'
          + '<div class="num">' + c.numero + '</div>'
          + (c.statutJour ? '<div class="sit-tag ' + this.sitCls(c.statutJour) + '">'
              + this.statutLabel(c.statutJour) + '</div>' : '')
          + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table>';
    return h;
  }

  statutLabel(s: string): string {
    if (s === 'DEPART') return 'DÉPART';
    if (s === 'RECOUCHE') return 'RECOUCHÉ';
    if (s === 'ARRIVEE') return 'ARRIVÉE';
    return '';
  }

  colonnes(pav: any): number[] {
    const etages = pav && pav.etages ? pav.etages : [];
    let n = 0;
    etages.forEach((e: any) => { if ((e.chambres || []).length > n) n = e.chambres.length; });
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(i);
    return out;
  }

  private fmt(d: string): string {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? (p[2] + '/' + p[1] + '/' + p[0]) : d;
  }
}
