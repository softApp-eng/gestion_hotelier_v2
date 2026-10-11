import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tour-menage',
  templateUrl: './tour-menage.component.html',
  styles: [`
    .tour-table th, .tour-table td { text-align: center; vertical-align: middle; }
    .tour-table .femme-cell { text-align: left; background: #f8f9fa; white-space: nowrap; }
    .tour-table .femme-cell .pav { font-size: .72rem; color: #6c757d; }
    .tour-table .day-cell { cursor: pointer; min-width: 76px; }
    .tour-table .day-cell:hover { outline: 2px solid #0d6efd; outline-offset: -2px; }
    .tour-table .etage-tag { display: inline-block; background: #d1e7dd; color: #0f5132; font-weight: 700; padding: 1px 8px; border-radius: 3px; }
    .tour-table .repos-tag { display: inline-block; background: #e2e3e5; color: #41464b; font-weight: 700; padding: 1px 8px; border-radius: 3px; }
    .tour-table th.sun, .tour-table td.sun { background: #fff5f5; }
    .tour-table thead th { background: #f1f3f5; font-size: .8rem; }
  `]
})
export class TourMenageComponent implements OnInit {

  data: any = { jours: [], femmes: [], affectations: [] };
  semaineOffset = 0;
  loading = false;

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.tourMenageSemaine(this.debut()).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  /** ISO Monday of the displayed week (undefined = current week, server-side). */
  debut(): string | undefined {
    if (!this.semaineOffset) return undefined;
    const d = new Date();
    const day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day + this.semaineOffset * 7);
    return this.iso(d);
  }

  private iso(d: Date): string {
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const j = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + j;
  }

  fmt(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    return parts.length === 3 ? (parts[2] + '/' + parts[1] + '/' + parts[0]) : iso;
  }

  prev(): void { this.semaineOffset--; this.load(); }
  next(): void { this.semaineOffset++; this.load(); }
  thisWeek(): void { this.semaineOffset = 0; this.load(); }

  aff(f: any, jour: any): any {
    const list = this.data.affectations || [];
    return list.find((a: any) => a.gouvernanteId === f.id && a.date === jour.date)
      || { gouvernanteId: f.id, date: jour.date, repos: false, etage: null };
  }

  editer(f: any, jour: any): void {
    const a = this.aff(f, jour);
    const options: any = { '': '— Aucune affectation —', 'REPOS': 'Repos (congé)' };
    const n = f.nbEtages || 5;
    for (let i = 1; i <= n; i++) options[String(i)] = 'Étage ' + i;
    Swal.fire({
      title: f.nomComplet,
      html: '<div class="text-muted small mb-1">' + jour.jour + ' ' + this.fmt(jour.date) + '</div>',
      input: 'select',
      inputOptions: options,
      inputValue: a.repos ? 'REPOS' : (a.etage ? String(a.etage) : ''),
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler'
    }).then((r) => {
      if (!r.isConfirmed) return;
      const v = String(r.value == null ? '' : r.value);
      const payload = {
        gouvernanteId: f.id,
        date: jour.date,
        repos: v === 'REPOS',
        etage: (v === 'REPOS' || v === '') ? null : v
      };
      this.api.saveTourMenage(payload).subscribe({ next: () => this.load() });
    });
  }

  imprimer(): void {
    const jours = this.data.jours || [];
    let h = '<h2>Tour de la semaine — Femmes de chambre</h2>';
    h += '<div class="sub">Semaine du ' + this.fmt(this.data.debut) + ' au ' + this.fmt(this.data.fin) + '</div>';
    h += '<table class="matrix"><thead><tr><th class="lib">Femme de chambre</th>';
    jours.forEach((j: any) => { h += '<th>' + j.jour + '<br>' + this.fmt(j.date) + '</th>'; });
    h += '</tr></thead><tbody>';
    (this.data.femmes || []).forEach((f: any) => {
      h += '<tr><td class="lib">' + f.nomComplet
        + (f.pavillon ? '<br><small>' + f.pavillon + '</small>' : '') + '</td>';
      jours.forEach((j: any) => {
        const a = this.aff(f, j);
        const txt = a.repos ? 'Repos' : (a.etage ? ('Ét. ' + a.etage) : '—');
        const cls = a.repos ? 's-repos' : (a.etage ? 's-etage' : '');
        h += '<td class="' + cls + '">' + txt + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table>';
    this.print.print('Tour de la semaine — Femmes de chambre', h, 'landscape');
  }
}
