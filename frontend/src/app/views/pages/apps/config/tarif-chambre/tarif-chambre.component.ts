import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { TarifChambreListDto, TarifService } from 'src/app/core/services/tarif.service';
import { MatDialog } from '@angular/material/dialog';
import { TarifChambreFormComponent } from './tarif-chambre-form/tarif-chambre-form.component';
import { forkJoin } from 'rxjs';
import { TypeClientService } from 'src/app/core/services/type-client.service';
import { ChambreService } from 'src/app/core/services/chambre.service';

interface FilterValues {
  global: string;
  typeClientName: string;
  typeChambreName: string;
}

@Component({
  selector: 'app-tarif-chambre',
  templateUrl: './tarif-chambre.component.html',
  styleUrls: ['./tarif-chambre.component.scss']
})
export class TarifChambreComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'typeClientName', 'typeChambreName', 'prix', 'active', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = false;

  // Listes pour alimenter les sélecteurs de filtre
  typeClientsList: string[] = [];
  typeChambresList: string[] = [];

  // Structure de l'état des filtres
  filterValues: FilterValues = {
    global: '',
    typeClientName: '',
    typeChambreName: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tarifService: TarifService,
    private dialog: MatDialog,
    private typeClientService: TypeClientService,
    private typeChambreService: ChambreService  
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = this.createFilter();
    this.loadTarifs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTarifs(): void {
    this.loading = true;
    this.tarifService.getAllTarifs().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.extractFilterOptions(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tarifs :', error);
        this.loading = false;
      }
    });
  }

  /**
   * Extrait les valeurs uniques pour alimenter les menus déroulants
   */
  private extractFilterOptions(data: any[]): void {
    this.typeClientsList = [...new Set(data.map(item => item.typeClientName).filter(Boolean))];
    this.typeChambresList = [...new Set(data.map(item => item.typeChambreName).filter(Boolean))];
  }

  /**
   * Logique de filtrage combinée (Recherche globale + Filtres déroulants)
   */
  private createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchTerms: FilterValues = JSON.parse(filter);

      // Filtre global (recherche sur plusieurs champs)
      const globalMatch = !searchTerms.global || 
        (data.id && data.id.toString().toLowerCase().includes(searchTerms.global)) ||
        (data.typeClientName && data.typeClientName.toLowerCase().includes(searchTerms.global)) ||
        (data.typeChambreName && data.typeChambreName.toLowerCase().includes(searchTerms.global)) ||
        (data.prix && data.prix.toString().toLowerCase().includes(searchTerms.global));

      // Filtre par Type Client
      const clientMatch = !searchTerms.typeClientName || 
        data.typeClientName === searchTerms.typeClientName;

      // Filtre par Type Chambre
      const chambreMatch = !searchTerms.typeChambreName || 
        data.typeChambreName === searchTerms.typeChambreName;

      return globalMatch && clientMatch && chambreMatch;
    };
  }

  // Application de la recherche textuelle
  applySearchFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.global = filterValue.trim().toLowerCase();
    this.updateFilter();
  }

  // Application du filtre Type Client
  applyTypeClientFilter(value: string): void {
    this.filterValues.typeClientName = value === 'ALL' ? '' : value;
    this.updateFilter();
  }

  // Application du filtre Type Chambre
  applyTypeChambreFilter(value: string): void {
    this.filterValues.typeChambreName = value === 'ALL' ? '' : value;
    this.updateFilter();
  }

  // Déclenche le filtre et réinitialise la pagination
  private updateFilter(): void {
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Ouverture de la modale en mode Création
openAddDialog(tarifToEdit?: TarifChambreListDto): void {
  // On attend que les 2 listes soient récupérées avant d'ouvrir le dialogue
  forkJoin({
    typesClient: this.typeClientService.getAll(),
    typesChambre: this.typeChambreService.getTypeChambres()
  }).subscribe(({ typesClient, typesChambre }) => {
    
    const dialogRef = this.dialog.open(TarifChambreFormComponent, {
      width: '500px',
      data: {
        tarif: tarifToEdit,
        typesClient: typesClient,  // transmis directement au constructeur du dialogue
        typesChambre: typesChambre
      }
    });

   dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (tarifToEdit) {
          // Si on avait un tarif à éditer, on met à jour
          this.updateTarif(result);
         // this.loadTarifs()
        } else {
          // Sinon, on crée un nouveau tarif
         this.loadTarifs()
        }
      }
    }); 

  });
}


  private updateTarif(payload: any): void {
    this.loading = true;
    this.tarifService.updateTarif(payload.id, payload).subscribe({
      next: () => {
        this.loadTarifs();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour :', err);
        this.loading = false;
      }
    });
  }
  // Ouverture de la modale en mode Édition
  editTarifChambre(element: any): void {
    const dialogRef = this.dialog.open(TarifChambreFormComponent, {
      width: '500px',
      disableClose: true,
      data: {
        tarif: element,
        typesClient: this.typeClientsList,
        typesChambre: this.typeChambresList
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateTarif(result);
      }
    });
  }

 

  deleteTarifChambre(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce tarif ?')) {
      console.log('Suppression ID :', id);
    }
  }
}