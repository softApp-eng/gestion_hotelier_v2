import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
export interface Client {
  id?: number;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
}

export interface ReservationInHouse {
  id: number;
  numeroChambre: string;
  pavillonId: number;
  pavillonNom: string;
  typeClient: 'passage' | 'societe' | 'agence' | 'vip';
  modeReglement: 'espece' | 'carte_bancaire' | 'prise_en_charge';
  referencePec?: string;
  dateCheckIn: Date;
  dateCheckOut: Date;
  statut: 'DUE_OUT' | 'STAY_OVER' | 'ARRIVED_TODAY' | 'LATE_CHECKOUT';
  statutMenafe: 'CLEAN' | 'DIRTY' | 'IN_PROGRESS';
  clients: Client[];
  soldeDebiteur: number; // > 0 si le client doit de l'argent
  nbAdultes: number;
}
@Component({
  selector: 'app-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss']
})
export class ComposeComponent implements OnInit {
/// Colonnes à afficher dans la table
  displayedColumns: string[] = ['chambre', 'client', 'dates', 'statut', 'housekeeping', 'solde', 'actions'];
  
  // Data Source pour Angular Material Table
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Variables des filtres
  searchQuery: string = '';
  selectedPavillon: string = '';
  selectedStatus: string = '';
  selectedTypeClient: string = '';
  selectedPaymentMode: string = '';
  selectedHousekeeping: string = '';
  onlyHighBalance: boolean = false;
  showAdvancedFilters: boolean = false;

  pavillons = [
    { id: 1, nom: 'Pavillon Principal' },
    { id: 2, nom: 'Annexe Jardin' }
  ];

  ngOnInit(): void {
    // Exemple de données de démonstration
    const mockData = [
      {
        chambreNumero: '102',
        pavillonNom: 'Pavillon Principal',
        clientNom: 'ALAMI',
        clientPrenom: 'Youssef',
        isVip: true,
        cinOrPassport: 'AB123456',
        telephone: '+212 600000000',
        dateArrivee: new Date(),
        dateDepart: new Date(Date.now() + 86400000 * 3),
        statut: 'STAY_OVER',
        housekeeping: 'CLEAN',
        solde: 450.00
      },
      {
        chambreNumero: '204',
        pavillonNom: 'Annexe Jardin',
        clientNom: 'BENNANI',
        clientPrenom: 'Karim',
        isVip: false,
        cinOrPassport: 'CD789012',
        telephone: '+212 611111111',
        dateArrivee: new Date(Date.now() - 86400000 * 2),
        dateDepart: new Date(),
        statut: 'DUE_OUT',
        housekeeping: 'DIRTY',
        solde: 0.00
      }
    ];

    this.dataSource.data = mockData;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  applyFilters(): void {
    // Logique de filtrage personnalisée sur this.dataSource.filter
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedPavillon = '';
    this.selectedStatus = '';
    this.selectedTypeClient = '';
    this.selectedPaymentMode = '';
    this.selectedHousekeeping = '';
    this.onlyHighBalance = false;
    this.applyFilters();
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'DUE_OUT': 'Départ du jour',
      'STAY_OVER': 'En séjour',
      'ARRIVED_TODAY': "Arrivé d'aujourd'hui",
      'LATE_CHECKOUT': 'Late Check-out'
    };
    return labels[statut] || statut;
  }

  viewDetails(row: any) { /* ... */ }
  addPayment(row: any) { /* ... */ }
  checkout(row: any) { /* ... */ }
}
