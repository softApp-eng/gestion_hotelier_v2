import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ChambreService } from 'src/app/core/services/chambre.service';
import { TypeChambre } from 'src/app/core/services/models/typeChambre';
import { AddChambreDialogComponent } from './add-chambre-dialog/add-chambre-dialog.component';

export interface FilterObj {
  search: string;
  categorie: string;
}

@Component({
  selector: 'app-list-chambre',
  templateUrl: './list-chambre.component.html',
  styleUrls: ['./list-chambre.component.scss']
})
export class ListChambreComponent implements OnInit, AfterViewInit {

displayedColumns: string[] = ['id', 'code', 'libelle', 'capacite', 'description', 'active', 'actions'];
  dataSource = new MatTableDataSource<TypeChambre>();
  loading = true;

  // Liste pour remplir le dropdown
  categories: string[] = [];
  selectedCategorie: string = 'ALL';

  // Objet de filtre combiné
  filterValues: FilterObj = {
    search: '',
    categorie: 'ALL'
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private typeChambreService: ChambreService,
    private dialog: MatDialog // Injection de MatDialog
  ) {}

  ngOnInit(): void {
    // Configuration de la logique de filtrage personnalisée
    this.dataSource.filterPredicate = this.createFilter();
    this.loadData();
  }
  // Méthode pour ouvrir le modal d'ajout
  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddChambreDialogComponent, {
      width: '550px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recharger le tableau si un ajout a été effectué
        this.loadData();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading = true;
    this.typeChambreService.getTypeChambres().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        
        // Extraction dynamique des catégories uniques venant du backend
        this.categories = Array.from(new Set(data.map(item => item.categorie))).filter(Boolean);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.loading = false;
      }
    });
  }

  // Recherche textuelle globale (input search)
  applySearchFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.search = filterValue.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Filtre sélection catégorie (mat-select)
  applyCategorieFilter(value: string): void {
    this.filterValues.categorie = value;
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Predicate qui combine les 2 filtres (Catégorie + Texte)
  private createFilter(): (data: TypeChambre, filter: string) => boolean {
    return (data: TypeChambre, filter: string): boolean => {
      const searchTerms: FilterObj = JSON.parse(filter);

      // 1. Condition Categorie
      const matchCategorie = searchTerms.categorie === 'ALL' || data.categorie === searchTerms.categorie;

      // 2. Condition Recherche Textuelle (sur plusieurs champs)
      const dataStr = `${data.id || ''} ${data.pavillonNom || ''} ${data.numero || ''} ${data.categorie || ''} ${data.observation || ''}`.toLowerCase();
      const matchSearch = dataStr.includes(searchTerms.search);

      return matchCategorie && matchSearch;
    };
  }
// Méthode pour l'édition
editTypeChambre(element: any): void {
  // Vos instructions pour ouvrir la dialog d'édition
  console.log('Édition du type de chambre :', element);
}

// Méthode pour la suppression
deleteTypeChambre(id: number): void {
  if (confirm('Voulez-vous vraiment supprimer ce type de chambre ?')) {
    // Appels à votre service backend
    console.log('Suppression du type de chambre ID :', id);
  }
}
}