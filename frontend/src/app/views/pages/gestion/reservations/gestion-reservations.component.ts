import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-reservations',
  templateUrl: './gestion-reservations.component.html'
})
export class GestionReservationsComponent implements OnInit {

  reservations: any[] = [];
  arrivees: any[] = [];
  clients: any[] = [];
  chambres: any[] = [];
  loading = false;
  showForm = false;
  form: any = { nbPersonnes: 1, statut: 'CONFIRMEE' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.clients().subscribe(d => this.clients = d);
    this.api.chambres().subscribe(d => this.chambres = d.filter((c: any) => c.etat !== 'HORS_SERVICE'));
  }

  load(): void {
    this.loading = true;
    this.api.reservations().subscribe(d => { this.reservations = d; this.loading = false; });
    this.api.arrivees().subscribe(d => this.arrivees = d);
  }

  newRes(): void {
    this.form = { nbPersonnes: 1, statut: 'CONFIRMEE',
      client: { id: this.clients[0]?.id }, chambre: { id: this.chambres[0]?.id } };
    this.showForm = true;
  }

  edit(r: any): void {
    this.form = { ...r, client: { id: r.client?.id }, chambre: { id: r.chambre?.id } };
    this.showForm = true;
  }

  save(): void {
    this.api.saveReservation(this.form).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Réservation enregistrée', timer: 1200, showConfirmButton: false });
        this.showForm = false; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Conflit ou données invalides', 'error')
    });
  }

  checkin(r: any): void {
    Swal.fire({ title: 'Check-in', text: `Confirmer l'arrivée de ${r.client?.nom} (chambre ${r.chambre?.numero}) ?`,
      icon: 'question', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(res => {
      if (res.isConfirmed) {
        this.api.checkinReservation(r.id).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Check-in effectué', timer: 1200, showConfirmButton: false }); this.load(); },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Check-in impossible', 'error')
        });
      }
    });
  }

  statutBadge(s: string): string {
    switch (s) {
      case 'CONFIRMEE': return 'bg-primary';
      case 'EN_COURS': return 'bg-success';
      case 'TERMINEE': return 'bg-secondary';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-warning';
    }
  }

  remove(r: any): void {
    Swal.fire({ title: 'Supprimer la réservation ?', text: `Client ${r.client?.nom}, chambre ${r.chambre?.numero || '-'}`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' }).then(res => {
      if (res.isConfirmed) this.api.deleteReservation(r.id).subscribe(() => this.load());
    });
  }
}
