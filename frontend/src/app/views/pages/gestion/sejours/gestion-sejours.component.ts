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
  showForm = false;
  form: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.clients().subscribe(d => this.clients = d);
    this.api.chambres().subscribe(d => this.chambres = d.filter((c: any) => c.etat === 'LIBRE'));
  }

  load(): void {
    this.api.sejours().subscribe(d => this.sejours = d);
  }

  newWalkIn(): void {
    this.form = { client: { id: this.clients[0]?.id }, chambre: { id: this.chambres[0]?.id } };
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
}
