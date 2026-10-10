import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface LigneFolio {
  id: number;
  dateOp: Date;
  libelle: string;
  reference?: string;
  departement: 'HEBERGEMENT' | 'RESTAURATION' | 'SPA' | 'TAXE' | 'REGLEMENT' | 'REMISE';
  debit: number;
  credit: number;
  agentInitiales: string;
}

export interface FolioClient {
  id: number;
  chambreNumero: string;
  clientNom: string;
  clientPrenom: string;
  numeroResa: string;
  societe?: string;
  codeTarif: string;
  dateArrivee: Date;
  dateDepart: Date;
  totalDebits: number;
  totalCredits: number;
  solde: number;
}
@Component({
  selector: 'app-compte',
  templateUrl: './compte.component.html',
  styleUrls: ['./compte.component.scss']
})
export class CompteComponent implements OnInit {

 displayedColumns: string[] = ['date', 'libelle', 'departement', 'debit', 'credit', 'agent'];
  dataSource = new MatTableDataSource<LigneFolio>([]);
  searchQuery: string = '';

  activeFolio: FolioClient | null = null;
  paiementForm!: FormGroup;
  dialogRef!: MatDialogRef<any>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('paiementDialog') paiementDialog!: TemplateRef<any>;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForms();
    this.loadActiveFolio();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  initForms(): void {
    this.paiementForm = this.fb.group({
      modePaiement: ['CB', Validators.required],
      montant: [0, [Validators.required, Validators.min(0.01)]],
      reference: ['']
    });
  }

  loadActiveFolio(): void {
    // Mock d'un compte client sélectionné (Ex: Chambre 302)
    this.activeFolio = {
      id: 1001,
      chambreNumero: '302',
      clientNom: 'MARTIN',
      clientPrenom: 'Sophie',
      numeroResa: 'RES-8829',
      societe: 'Tech Solutions Corp',
      codeTarif: 'BB-FLEX',
      dateArrivee: new Date(Date.now() - 86400000 * 2),
      dateDepart: new Date(Date.now() + 86400000),
      totalDebits: 380.00,
      totalCredits: 200.00,
      solde: 180.00
    };

    const mockLignes: LigneFolio[] = [
      { id: 1, dateOp: new Date(Date.now() - 86400000 * 2), libelle: 'Nuitée - Chambre Deluxe', departement: 'HEBERGEMENT', debit: 150.00, credit: 0, agentInitiales: 'SYS' },
      { id: 2, dateOp: new Date(Date.now() - 86400000 * 2), libelle: 'Taxe de Séjour (2 Pers)', departement: 'TAXE', debit: 5.00, credit: 0, agentInitiales: 'SYS' },
      { id: 3, dateOp: new Date(Date.now() - 86400000 * 2), libelle: 'Acompte CB à la réservation', reference: 'TPE-9901', departement: 'REGLEMENT', debit: 0, credit: 200.00, agentInitiales: 'REC' },
      { id: 4, dateOp: new Date(Date.now() - 86400000), libelle: 'Nuitée - Chambre Deluxe', departement: 'HEBERGEMENT', debit: 150.00, credit: 0, agentInitiales: 'SYS' },
      { id: 5, dateOp: new Date(Date.now() - 86400000), libelle: 'Taxe de Séjour (2 Pers)', departement: 'TAXE', debit: 5.00, credit: 0, agentInitiales: 'SYS' },
      { id: 6, dateOp: new Date(Date.now() - 40000000), libelle: 'Restaurant Room Service', reference: 'Ticket #402', departement: 'RESTAURATION', debit: 70.00, credit: 0, agentInitiales: 'RESTO' }
    ];

    this.dataSource.data = mockLignes;
  }

  applySearch(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
  }

  openPaiementModal(): void {
    if (!this.activeFolio) return;

    this.paiementForm.patchValue({
      montant: this.activeFolio.solde > 0 ? this.activeFolio.solde : 0
    });

    this.dialogRef = this.dialog.open(this.paiementDialog, { width: '500px' });
  }

  closeDialog(): void {
    if (this.dialogRef) this.dialogRef.close();
  }

  confirmPaiement(): void {
    if (this.paiementForm.valid && this.activeFolio) {
      const val = this.paiementForm.value;
      const nouvelleLigne: LigneFolio = {
        id: Date.now(),
        dateOp: new Date(),
        libelle: `Règlement ${val.modePaiement}`,
        reference: val.reference,
        departement: 'REGLEMENT',
        debit: 0,
        credit: val.montant,
        agentInitiales: 'REC'
      };

      this.dataSource.data = [nouvelleLigne, ...this.dataSource.data];
      this.activeFolio.totalCredits += val.montant;
      this.activeFolio.solde -= val.montant;

      this.closeDialog();
    }
  }

  openPrestationModal(): void { /* Ajouter conso directe */ }
  openAjustementModal(): void { /* Appliquer remise */ }
  imprimerProforma(): void { window.print(); }
  cloturerEtFacturer(): void { /* Génération PDF Facture définitive */ }

}
