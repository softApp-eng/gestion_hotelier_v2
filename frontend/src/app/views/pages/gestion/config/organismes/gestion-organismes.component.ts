import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-organismes',
  templateUrl: './gestion-organismes.component.html'
})
export class GestionOrganismesComponent implements OnInit {

  organismes: any[] = [];
  showForm = false;
  form: any = { type: 'ARMEE', actif: true };

  types = ['ARMEE', 'GENDARMERIE', 'DELEGATION', 'AUTRE'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.organismes().subscribe(d => this.organismes = d);
  }

  newOrganisme(): void {
    this.form = { type: 'ARMEE', actif: true };
    this.showForm = true;
  }

  edit(o: any): void {
    this.form = { ...o };
    this.showForm = true;
  }

  save(): void {
    this.api.saveOrganisme(this.form).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Enregistré', timer: 1200, showConfirmButton: false });
        this.showForm = false;
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  remove(o: any): void {
    Swal.fire({ title: 'Supprimer ?', text: o.nom, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deleteOrganisme(o.id).subscribe(() => this.load());
    });
  }
}
