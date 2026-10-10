import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resto-menu',
  templateUrl: './resto-menu.component.html'
})
export class RestoMenuComponent implements OnInit {

  produits: any[] = [];
  categories: any[] = [];
  search = '';
  filterCategorieId: number | null = null;

  showForm = false;
  form: any = { type: 'MENU', disponible: true };
  catForm: any = { ordre: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.load();
  }

  loadCategories(): void {
    this.api.categories().subscribe(d => this.categories = d);
  }

  load(): void {
    this.api.produits(this.search, this.filterCategorieId || undefined).subscribe(d => this.produits = d);
  }

  newProduit(): void {
    this.form = { type: 'MENU', disponible: true, categorie: { id: this.categories[0]?.id } };
    this.showForm = true;
  }

  edit(p: any): void {
    this.form = { ...p, categorie: { id: p.categorie?.id } };
    this.showForm = true;
  }

  save(): void {
    this.api.saveProduit(this.form).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Produit enregistré', timer: 1000, showConfirmButton: false });
        this.showForm = false; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
    });
  }

  remove(p: any): void {
    Swal.fire({ title: 'Supprimer ?', text: p.nom, icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
      .then(r => { if (r.isConfirmed) this.api.deleteProduit(p.id).subscribe(() => this.load()); });
  }

  saveCategorie(): void {
    this.api.saveCategorie(this.catForm).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Catégorie ajoutée', timer: 1000, showConfirmButton: false });
        this.catForm = { ordre: 0 }; this.loadCategories(); }
    });
  }
}
