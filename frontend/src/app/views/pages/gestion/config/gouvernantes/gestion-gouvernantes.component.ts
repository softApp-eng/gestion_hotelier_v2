import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-gouvernantes',
  templateUrl: './gestion-gouvernantes.component.html'
})
export class GestionGouvernantesComponent implements OnInit {

  gouvernantes: any[] = [];
  pavillons: any[] = [];

  showForm = false;
  form: any = { actif: true, pavillon: { id: null }, role: 'FEMME_DE_CHAMBRE' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.pavillons().subscribe(d => this.pavillons = d);
  }

  load(): void {
    this.api.gouvernantes().subscribe(d => this.gouvernantes = d);
  }

  nouveau(): void {
    this.form = { actif: true, role: 'FEMME_DE_CHAMBRE', pavillon: { id: this.pavillons[0] ? this.pavillons[0].id : null } };
    this.showForm = true;
  }

  edit(g: any): void {
    this.form = { ...g, pavillon: g.pavillon ? { id: g.pavillon.id } : { id: null } };
    this.showForm = true;
  }

  save(): void {
    this.api.saveGouvernante(this.form).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Enregistré', timer: 1000, showConfirmButton: false });
        this.showForm = false;
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  remove(g: any): void {
    Swal.fire({ title: 'Supprimer ?', text: g.nom + ' ' + (g.prenom || ''), icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deleteGouvernante(g.id).subscribe({ next: () => this.load() });
    });
  }
}
