import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resto-commandes',
  templateUrl: './resto-commandes.component.html'
})
export class RestoCommandesComponent implements OnInit {

  commandes: any[] = [];
  selected: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.commandesOuvertes().subscribe(d => { this.commandes = d; if (!d.length) this.selected = null; });
  }

  select(c: any): void { this.selected = c; }

  payer(c: any): void {
    Swal.fire({
      title: 'Encaisser ' + (c.total || 0).toFixed(0) + ' DA',
      input: 'text', inputLabel: 'Mode de paiement', inputValue: 'ESPECES',
      showCancelButton: true, confirmButtonText: 'Encaisser', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.api.payerCommande(c.id, { typeVente: 'RESTAURANT', paiements: [{ mode: (r.value || 'ESPECES').toUpperCase(), montant: c.total }] })
          .subscribe({ next: () => { Swal.fire({ icon: 'success', title: 'Payée', timer: 1000, showConfirmButton: false }); this.load(); } });
      }
    });
  }

  annuler(c: any): void {
    Swal.fire({ title: 'Annuler la commande ?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
      .then(r => { if (r.isConfirmed) this.api.deleteCommande(c.id).subscribe(() => this.load()); });
  }

  total(): number { return (this.selected?.lignes || []).reduce((s: number, l: any) => s + l.quantite * l.prixUnitaire, 0); }
}
