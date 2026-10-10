import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-categories-clients',
  templateUrl: './gestion-categories-clients.component.html'
})
export class GestionCategoriesClientsComponent implements OnInit {

  categories: any[] = [];
  showForm = false;
  form: any = { ordre: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.categoriesClients().subscribe(d => this.categories = d);
  }

  newCategorie(): void {
    this.form = { ordre: this.categories.length + 1 };
    this.showForm = true;
  }

  edit(c: any): void {
    this.form = { ...c };
    this.showForm = true;
  }

  save(): void {
    this.api.saveCategorieClient(this.form).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Enregistré', timer: 1200, showConfirmButton: false });
        this.showForm = false;
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  remove(c: any): void {
    Swal.fire({ title: 'Supprimer ?', text: c.libelle, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deleteCategorieClient(c.id).subscribe(() => this.load());
    });
  }
}
