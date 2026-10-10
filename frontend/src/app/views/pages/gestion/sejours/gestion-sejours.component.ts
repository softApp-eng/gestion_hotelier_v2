import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-sejours',
  templateUrl: './gestion-sejours.component.html'
})
export class GestionSejoursComponent implements OnInit {

  sejours: any[] = [];
  clients: any[] = [];
  chambres: any[] = [];
  pavillons: any[] = [];
  showForm = false;
  form: any = {};
  modesPaiement = ['ESPECES', 'TPE', 'PRISE_EN_CHARGE'];

  filtres: any = { checkinFrom: '', checkinTo: '', checkoutFrom: '', checkoutTo: '', statut: '', numero: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.clients().subscribe(d => this.clients = d);
    this.api.chambres().subscribe(d => this.chambres = d.filter((c: any) => c.etat === 'LIBRE'));
    this.api.pavillons().subscribe(d => this.pavillons = d);
  }

  load(): void {
    this.api.sejours().subscribe(d => this.sejours = d);
  }

  rechercher(): void {
    this.api.sejoursRecherche(this.filtres).subscribe(d => this.sejours = d);
  }

  resetFiltres(): void {
    this.filtres = { checkinFrom: '', checkinTo: '', checkoutFrom: '', checkoutTo: '', statut: '', numero: '' };
    this.load();
  }

  newWalkIn(): void {
    this.form = {
      client: { id: this.clients[0]?.id },
      chambre: { id: this.chambres[0]?.id },
      modePaiement: 'ESPECES'
    };
    this.showForm = true;
  }

  save(): void {
    this.api.checkinDirect(this.form).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Check-in effectué', timer: 1200, showConfirmButton: false });
        this.showForm = false; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Check-in impossible', 'error')
    });
  }

  checkout(s: any): void {
    Swal.fire({ title: 'Check-out', text: `Libérer la chambre ${s.chambre?.numero} ?`, icon: 'question',
      showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) {
        this.api.checkout(s.id).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Check-out effectué', timer: 1200, showConfirmButton: false }); this.load(); },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
        });
      }
    });
  }

  modeBadge(m: string): string {
    switch (m) {
      case 'TPE': return 'bg-info text-dark';
      case 'PRISE_EN_CHARGE': return 'bg-warning text-dark';
      case 'ESPECES': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
}
