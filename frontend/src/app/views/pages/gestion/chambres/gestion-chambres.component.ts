import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-chambres',
  templateUrl: './gestion-chambres.component.html'
})
export class GestionChambresComponent implements OnInit {

  chambres: any[] = [];
  types: any[] = [];
  loading = false;

  showForm = false;
  form: any = { etat: 'LIBRE' };
  typeForm: any = { capacite: 2 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
  }

  load(): void {
    this.loading = true;
    this.api.chambres().subscribe({
      next: (d) => { this.chambres = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadTypes(): void {
    this.api.typesChambre().subscribe({ next: (d) => this.types = d });
  }

  newRoom(): void {
    this.form = { etat: 'LIBRE', typeChambre: { id: this.types[0]?.id } };
    this.showForm = true;
  }

  edit(c: any): void {
    this.form = { ...c, typeChambre: c.typeChambre ? { id: c.typeChambre.id } : null };
    this.showForm = true;
  }

  save(): void {
    this.api.saveChambre(this.form).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Enregistré', timer: 1200, showConfirmButton: false });
        this.showForm = false;
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  setEtat(c: any, etat: string): void {
    this.api.changeEtatChambre(c.id, etat).subscribe({ next: () => this.load() });
  }

  remove(c: any): void {
    Swal.fire({ title: 'Supprimer ?', text: `Chambre ${c.numero}`, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deleteChambre(c.id).subscribe({ next: () => this.load() });
    });
  }

  saveType(): void {
    this.api.saveTypeChambre(this.typeForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Type ajouté', timer: 1200, showConfirmButton: false });
        this.typeForm = { capacite: 2 };
        this.loadTypes();
      }
    });
  }

  etatBadge(etat: string): string {
    switch (etat) {
      case 'LIBRE': return 'bg-success';
      case 'OCCUPEE': return 'bg-danger';
      case 'NETTOYAGE': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }
}
