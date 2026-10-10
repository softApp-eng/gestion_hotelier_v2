import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-clients',
  templateUrl: './gestion-clients.component.html'
})
export class GestionClientsComponent implements OnInit {

  clients: any[] = [];
  search = '';
  showForm = false;
  form: any = { typeClient: 'STANDARD' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.clients().subscribe(d => this.clients = d);
  }

  filtered(): any[] {
    if (!this.search) return this.clients;
    const q = this.search.toLowerCase();
    return this.clients.filter(c =>
      (c.nom || '').toLowerCase().includes(q) ||
      (c.prenom || '').toLowerCase().includes(q) ||
      (c.telephone || '').includes(q) ||
      (c.cin || '').includes(q));
  }

  newClient(): void {
    this.form = { typeClient: 'STANDARD' };
    this.showForm = true;
  }

  edit(c: any): void {
    this.form = { ...c };
    this.showForm = true;
  }

  save(): void {
    this.api.saveClient(this.form).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Client enregistré', timer: 1200, showConfirmButton: false });
        this.showForm = false; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  remove(c: any): void {
    Swal.fire({ title: 'Supprimer ?', text: `${c.nom} ${c.prenom}`, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deleteClient(c.id).subscribe(() => this.load());
    });
  }
}
