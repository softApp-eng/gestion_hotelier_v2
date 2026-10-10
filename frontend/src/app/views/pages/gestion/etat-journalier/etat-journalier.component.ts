import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';

@Component({
  selector: 'app-etat-journalier',
  templateUrl: './etat-journalier.component.html'
})
export class EtatJournalierComponent implements OnInit {

  etat: any = null;
  date = '';

  constructor(private api: ApiService, private printService: PrintService) {}

  ngOnInit(): void {
    const n = new Date();
    this.date = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-'
      + String(n.getDate()).padStart(2, '0');
    this.load();
  }

  load(): void {
    this.api.etatJournalier(this.date).subscribe(d => this.etat = d);
  }

  etatBadge(etat: string): string {
    switch (etat) {
      case 'LIBRE': return 'bg-success';
      case 'OCCUPEE': return 'bg-danger';
      case 'NETTOYAGE': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  imprimer(): void {
    if (!this.etat) return;
    let html = '<div class="hdr"><div>';
    html += '<div class="brand">Hôtel V2 — État journalier des chambres</div>';
    html += '<div class="sub">Date : ' + this.etat.date + '</div></div>';
    html += '<div class="sub">Total ' + this.etat.totalChambres + ' — Libres ' + this.etat.libres
      + ' — Occupées ' + this.etat.occupees + ' — Nettoyage ' + this.etat.nettoyage
      + ' — Bloquées ' + this.etat.bloquees + ' — Taux ' + this.etat.tauxOccupation + '%</div></div>';

    this.etat.pavillons.forEach((p: any) => {
      html += '<h3 style="font-size:14px;margin:12px 0 4px;">' + p.pavillonNom + '</h3>';
      html += '<table><thead><tr><th class="lib">Chambre</th><th class="lib">Type</th><th>État</th>'
        + '<th class="lib">Occupant</th><th>Arrivée</th><th>Départ prévu</th><th>Paiement</th></tr></thead><tbody>';
      p.chambres.forEach((c: any) => {
        const etatTxt = c.bloque ? 'BLOQUEE' : c.etat;
        html += '<tr><td class="lib"><b>' + c.numero + '</b></td><td class="lib">' + (c.typeChambre || '-') + '</td>'
          + '<td class="' + (etatTxt === 'OCCUPEE' ? 'OCCUPEE' : (etatTxt === 'LIBRE' ? 'LIBRE' : '')) + '">' + etatTxt + '</td>'
          + '<td class="lib">' + (c.occupant || '-') + '</td>'
          + '<td>' + (c.dateArrivee || '-') + '</td>'
          + '<td>' + (c.dateDepartPrevue || '-') + '</td>'
          + '<td>' + (c.modePaiement || '-') + '</td></tr>';
      });
      html += '</tbody></table>';
    });
    this.printService.print('État journalier des chambres', html);
  }
}
