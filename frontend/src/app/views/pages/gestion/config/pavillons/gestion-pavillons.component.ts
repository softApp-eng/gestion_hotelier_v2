import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-pavillons',
  templateUrl: './gestion-pavillons.component.html'
})
export class GestionPavillonsComponent implements OnInit {

  pavillons: any[] = [];
  showForm = false;
  form: any = { actif: true };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.pavillons().subscribe(d => this.pavillons = d);
  }

  newPavillon(): void {
    this.form = { actif: true };
    this.showForm = true;
  }

  edit(p: any): void {
    this.form = { ...p };
    this.showForm = true;
  }

  save(): void {
    this.api.savePavillon(this.form).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Enregistré', timer: 1200, showConfirmButton: false });
        this.showForm = false;
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  remove(p: any): void {
    Swal.fire({ title: 'Supprimer ?', text: p.nom, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deletePavillon(p.id).subscribe(() => this.load());
    });
  }
}
