import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-tarifs',
  templateUrl: './gestion-tarifs.component.html'
})
export class GestionTarifsComponent implements OnInit {

  categories: any[] = [];
  types: any[] = [];
  grid: any = {}; // key: categorieId_typeId -> prix

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.categoriesClients().subscribe(d => this.categories = d);
    this.api.typesChambre().subscribe(d => this.types = d);
    this.load();
  }

  load(): void {
    this.api.tarifs().subscribe(d => {
      this.grid = {};
      d.forEach((t: any) => {
        if (t.categorieClient && t.typeChambre) {
          this.grid[this.key(t.categorieClient.id, t.typeChambre.id)] = t.prix;
        }
      });
    });
  }

  key(catId: number, typeId: number): string {
    return catId + '_' + typeId;
  }

  prix(catId: number, typeId: number): any {
    return this.grid[this.key(catId, typeId)];
  }

  setPrix(catId: number, typeId: number, v: any): void {
    this.grid[this.key(catId, typeId)] = v;
  }

  saveCell(catId: number, typeId: number): void {
    const prix = Number(this.grid[this.key(catId, typeId)]);
    if (isNaN(prix)) return;
    this.api.saveTarif({ categorieClient: { id: catId }, typeChambre: { id: typeId }, prix }).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Tarif enregistré', timer: 900, showConfirmButton: false }),
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }
}
