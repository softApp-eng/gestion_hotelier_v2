import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-factures',
  templateUrl: './gestion-factures.component.html'
})
export class GestionFacturesComponent implements OnInit {

  factures: any[] = [];
  sejours: any[] = [];
  selected: any = null;
  sejourId: number | null = null;

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.load();
    this.api.sejours().subscribe(d => this.sejours = d);
  }

  load(): void {
    this.api.factures().subscribe(d => this.factures = d);
  }

  generer(): void {
    if (!this.sejourId) return;
    this.api.genererFactures(this.sejourId).subscribe({
      next: (fs: any) => {
        Swal.fire({ icon: 'success', title: fs.length + ' facture(s) générée(s)', timer: 1500, showConfirmButton: false });
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Génération impossible', 'error')
    });
  }

  voir(f: any): void {
    this.api.factureById(f.id).subscribe(d => this.selected = d);
  }

  pdf(f: any): void {
    this.api.facturePdf(f.id).subscribe(blob => this.print.openBlob(blob));
  }

  imprimer(f: any): void {
    this.api.factureById(f.id).subscribe(d => this.buildAndPrint(d));
  }

  private buildAndPrint(f: any): void {
    let html = '<div class="hdr"><div class="brand">HÔTEL V2</div>'
      + '<div class="sub">Facture ' + f.type + ' — N° ' + f.numero + '</div></div>';
    html += '<p><b>Date :</b> ' + (f.dateEmission || '')
      + '<br><b>Client :</b> ' + (f.client ? f.client.nom + ' ' + (f.client.prenom || '') : '-')
      + '<br><b>Mode de paiement :</b> ' + f.modePaiement
      + (f.organisme ? ' (' + f.organisme.nom + ')' : '')
      + (f.referencePec ? '<br><b>Réf. PEC :</b> ' + f.referencePec : '') + '</p>';
    html += '<table><thead><tr><th class="lib">Désignation</th><th>Qté</th><th>P.U.</th><th>Montant</th></tr></thead><tbody>';
    (f.lignes || []).forEach((l: any) => {
      html += '<tr><td class="lib">' + (l.libelle || '') + '</td><td>' + l.quantite + '</td>'
        + '<td>' + (l.prixUnitaire || 0).toFixed(2) + '</td><td>' + (l.montant || 0).toFixed(2) + '</td></tr>';
    });
    html += '</tbody></table>';
    if (f.totalHebergement > 0) html += '<p style="text-align:right;">Total hébergement : ' + f.totalHebergement.toFixed(2) + ' DA</p>';
    if (f.totalSubsistance > 0) html += '<p style="text-align:right;">Total subsistance : ' + f.totalSubsistance.toFixed(2) + ' DA</p>';
    html += '<p style="text-align:right;font-weight:bold;font-size:15px;">TOTAL GÉNÉRAL : ' + (f.totalGeneral || 0).toFixed(2) + ' DA</p>';
    this.print.print('Facture ' + f.numero, html);
  }
}
