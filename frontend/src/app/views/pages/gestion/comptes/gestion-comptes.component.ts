import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-comptes',
  templateUrl: './gestion-comptes.component.html'
})
export class GestionComptesComponent implements OnInit {

  comptes: any[] = [];
  selected: any = null;
  prestations: any[] = [];
  filtre = 'OUVERT';
  showForm = false;
  prestaForm: any = { type: 'DIVERS', quantite: 1 };
  typesManuels = ['RESTAURANT', 'DIVERS'];

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.comptes(this.filtre === 'OUVERT' ? 'OUVERT' : undefined).subscribe(d => this.comptes = d);
  }

  ouvrir(c: any): void {
    this.selected = c;
    this.api.comptePrestations(c.id).subscribe(d => this.prestations = d);
  }

  nouvellePrestation(): void {
    this.prestaForm = { type: 'DIVERS', quantite: 1, prixUnitaire: 0 };
    this.showForm = true;
  }

  savePrestation(): void {
    this.api.ajouterPrestation(this.selected.id, this.prestaForm).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Prestation ajoutée', timer: 1000, showConfirmButton: false });
        this.showForm = false; this.load(); this.ouvrir(this.selected); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Ajout impossible', 'error')
    });
  }

  ajouterHebergement(): void {
    this.api.ajouterHebergement(this.selected.id).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Hébergement imputé', timer: 1000, showConfirmButton: false });
        this.load(); this.ouvrir(this.selected); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Imputation impossible', 'error')
    });
  }

  cloturer(): void {
    Swal.fire({ title: 'Clôturer le compte ?', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.cloturerCompte(this.selected.id).subscribe(() => { this.selected = null; this.load(); });
    });
  }

  total(): number {
    return this.prestations.reduce((s, p) => s + (p.montant || 0), 0);
  }

  imprimer(): void {
    let html = '<div class="hdr"><div><div class="brand">Hôtel V2 — Compte client</div>';
    html += '<div class="sub">' + this.selected.numero + ' — '
      + (this.selected.client ? (this.selected.client.nom + ' ' + (this.selected.client.prenom || '')) : '') + '</div></div></div>';
    html += '<table><thead><tr><th class="lib">Date</th><th class="lib">Type</th><th class="lib">Libellé</th>'
      + '<th>Qté</th><th>P.U.</th><th>Montant</th></tr></thead><tbody>';
    this.prestations.forEach((p: any) => {
      html += '<tr><td class="lib">' + (p.dateHeure || '') + '</td><td class="lib">' + p.type + '</td>'
        + '<td class="lib">' + (p.libelle || '') + '</td><td>' + p.quantite + '</td>'
        + '<td>' + this.money(p.prixUnitaire) + '</td><td>' + this.money(p.montant) + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<p style="text-align:right;font-weight:bold;">TOTAL : ' + this.money(this.total()) + ' DA</p>';
    this.print.print('Compte client ' + this.selected.numero, html);
  }

  private money(v: number): string {
    return (v || 0).toFixed(2);
  }
}
