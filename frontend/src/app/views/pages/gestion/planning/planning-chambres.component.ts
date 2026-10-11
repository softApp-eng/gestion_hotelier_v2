import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';

@Component({
  selector: 'app-planning-chambres',
  templateUrl: './planning-chambres.component.html'
})
export class PlanningChambresComponent implements OnInit {

  pavillons: any[] = [];
  pavillonId: number | null = null;
  mois = '';
  planning: any = null;
  loading = false;

  constructor(private api: ApiService, private printService: PrintService) {}

  ngOnInit(): void {
    const n = new Date();
    this.mois = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
    this.api.pavillons().subscribe(d => this.pavillons = d);
    this.load();
  }

  debut(): string {
    return this.mois + '-01';
  }

  fin(): string {
    const parts = this.mois.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const last = new Date(y, m, 0).getDate();
    return this.mois + '-' + String(last).padStart(2, '0');
  }

  load(): void {
    if (!this.mois) return;
    this.loading = true;
    this.api.planning(this.debut(), this.fin(), this.pavillonId || undefined).subscribe({
      next: (d) => { this.planning = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  jours(): any[] {
    return this.planning && this.planning.chambres && this.planning.chambres.length
      ? this.planning.chambres[0].jours : [];
  }

  cellClass(statut: string): string {
    switch (statut) {
      case 'LIBRE': return 'bg-success';
      case 'RESERVEE': return 'bg-info';
      case 'OCCUPEE': return 'bg-danger';
      case 'BLOQUEE': return 'bg-secondary';
      default: return '';
    }
  }

  jourNum(date: string): string {
    return date ? date.substring(8, 10) : '';
  }

  imprimer(): void {
    if (!this.planning) return;
    const jours = this.jours();
    let html = '<div class="hdr"><div>';
    html += '<div class="brand">Hôtel V2 — Planning des chambres</div>';
    html += '<div class="sub">' + (this.planning.pavillonNom || 'Tous les pavillons')
      + ' — du ' + this.planning.debut + ' au ' + this.planning.fin + '</div></div>';
    html += '<div class="legend"><span class="LIBRE">Libre</span><span class="RESERVEE">Réservée</span>'
      + '<span class="OCCUPEE">Occupée</span><span class="BLOQUEE">Bloquée</span></div></div>';
    html += '<table><thead><tr><th class="lib">Chambre</th><th class="lib">Type</th>';
    jours.forEach((j: any) => { html += '<th>' + this.jourNum(j.date) + '</th>'; });
    html += '</tr></thead><tbody>';
    this.planning.chambres.forEach((c: any) => {
      html += '<tr><td class="lib"><b>' + c.numero + '</b></td><td class="lib">' + (c.typeChambre || '-') + '</td>';
      c.jours.forEach((j: any) => {
        html += '<td class="' + j.statut + '">' + (j.libelle || '') + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    this.printService.print('Planning des chambres', html, 'landscape');
  }
}
