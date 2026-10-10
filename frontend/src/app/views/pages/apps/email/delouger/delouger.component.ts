import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
export interface InHouseGuest {
  id: number;
  chambreNumero: string;
  pavillonNom: string;
  clientNom: string;
  clientPrenom: string;
  numeroResa: string;
  categorieActuelle: string;
  dateArrivee: Date;
  dateDepart: Date;
  solde: number;
}
@Component({
  selector: 'app-delouger',
  templateUrl: './delouger.component.html',
  styleUrls: ['./delouger.component.scss']
})
export class DelougerComponent implements OnInit {

 displayedColumns: string[] = ['chambreActuelle', 'client', 'dates', 'statutSecurit', 'actions'];
  dataSource = new MatTableDataSource<InHouseGuest>([]);
  searchQuery: string = '';

  delougerForm!: FormGroup;
  selectedReservation: InHouseGuest | null = null;
  dialogRef!: MatDialogRef<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('delougerDialog') delougerDialog!: TemplateRef<any>;

  chambresDisponibles = [
    { id: 201, numero: '201', categorie: 'Deluxe Mer', pavillon: 'Pavillon Principal' },
    { id: 205, numero: '205', categorie: 'Suite Junior', pavillon: 'Pavillon Principal' },
    { id: 104, numero: '104', categorie: 'Standard Jardin', pavillon: 'Annexe' }
  ];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initForm(): void {
    this.delougerForm = this.fb.group({
      motif: ['', Validators.required],
      nouvelleChambreId: ['', Validators.required],
      fraisAjustement: [0],
      notifyGouvernance: [true],
      recodeKeyCards: [true],
      remarques: ['']
    });
  }

  loadData(): void {
    const mockGuests: InHouseGuest[] = [
      {
        id: 1,
        chambreNumero: '102',
        pavillonNom: 'Pavillon Principal',
        clientNom: 'EL MANSOURI',
        clientPrenom: 'Hassan',
        numeroResa: 'RS-9920',
        categorieActuelle: 'Standard Room',
        dateArrivee: new Date(),
        dateDepart: new Date(Date.now() + 86400000 * 3),
        solde: 0
      },
      {
        id: 2,
        chambreNumero: '304',
        pavillonNom: 'Annexe Jardin',
        clientNom: 'DUPONT',
        clientPrenom: 'Claire',
        numeroResa: 'RS-9925',
        categorieActuelle: 'Superior Room',
        dateArrivee: new Date(Date.now() - 86400000),
        dateDepart: new Date(Date.now() + 86400000 * 2),
        solde: 120.00
      }
    ];

    this.dataSource.data = mockGuests;
  }

  applySearch(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
  }

  openDelougerModal(row: InHouseGuest): void {
    this.selectedReservation = row;
    this.delougerForm.reset({
      motif: 'MAINTENANCE',
      fraisAjustement: 0,
      notifyGouvernance: true,
      recodeKeyCards: true
    });

    this.dialogRef = this.dialog.open(this.delougerDialog, {
      width: '600px',
      disableClose: true
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  confirmDelouger(): void {
    if (this.delougerForm.valid && this.selectedReservation) {
      const formData = {
        reservationId: this.selectedReservation.id,
        ancienneChambre: this.selectedReservation.chambreNumero,
        ...this.delougerForm.value
      };

      console.log('Délogement confirmé :', formData);
      // TODO: Appeler votre API Backend pour exécuter le délogement dans la BDD
      
      this.closeDialog();
    }
  }

}
