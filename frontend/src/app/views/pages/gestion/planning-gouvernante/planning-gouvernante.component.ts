import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';

@Component({
  selector: 'app-planning-gouvernante',
  templateUrl: './planning-gouvernante.component.html'
})
export class PlanningGouvernanteComponent implements OnInit {

  date: string;
  data: any = null;
  mode = 'etage'; // etage | type

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.date = new Date().toISOString().substring(0, 10);
    this.load();
  }

  load(): void {
    this.api.planningGouvernante(this.date).subscribe(d => this.data = d);
  }

  statutBadge(s: string): string {
    if (s === 'DEPART') return 'bg-danger';
    if (s === 'RECOUCHE') return 'bg-primary';
    if (s === 'ARRIVEE') return 'bg-success';
    return 'bg-light text-dark';
  }

  menageBadge(s: string): string {
    if (s === 'CLEAN') return 'bg-success';
    if (s === 'A_VERIFIER') return 'bg-warning text-dark';
    if (s === 'DIRTY') return 'bg-danger';
    if (s === 'BLOQUEE') return 'bg-secondary';
    return 'bg-light text-dark';
  }

  imprimer(): void {
    if (!this.data) return;
    let html = '<div class="hdr"><div class="brand">HÔTEL V2 — Planning gouvernante</div>'
      + '<div class="sub">Journée du ' + this.data.date + ' — Départs : ' + this.data.nbDepart
      + ' · Recouchés : ' + this.data.nbRecouche + ' · Arrivées : ' + this.data.nbArrivee + '</div></div>';

    const groups = this.mode === 'etage' ? this.data.parEtage : this.data.parType;
    const keyLabel = this.mode === 'etage' ? 'Étage' : 'Type';
    groups.forEach((g: any) => {
      const titre = this.mode === 'etage' ? g.etage : g.type;
      html += '<h4>' + keyLabel + ' : ' + titre + '</h4>';
      html += '<table><thead><tr><th class="lib">Chambre</th><th class="lib">Type</th><th class="lib">Situation</th>'
        + '<th class="lib">Ménage</th><th class="lib">Occupant</th><th class="lib">Gouvernante</th></tr></thead><tbody>';
      g.chambres.forEach((c: any) => {
        html += '<tr><td class="lib">' + c.numero + '</td><td class="lib">' + (c.typeChambre || '') + '</td>'
          + '<td class="lib">' + (c.statutJour || '—') + '</td><td class="lib">' + (c.etatMenage || '') + '</td>'
          + '<td class="lib">' + (c.occupant || '') + '</td><td class="lib">' + (c.gouvernante || '') + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    this.print.print('Planning gouvernante ' + this.data.date, html);
  }
}
