import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf, *ngFor, date pipe

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface AuditControl {
  id: number;
  controlName: string;
  description: string;
  count: number;
  severity: 'CRITICAL' | 'WARNING';
  isBlocking: boolean;
  actionLabel: string;
  code: 'NO_SHOW' | 'UNASSIGNED' | 'OPEN_FOLIO' | 'POS_OPEN';
}

export interface AuditStep {
  title: string;
  icon: string;
  status: 'DONE' | 'WARNING' | 'PENDING' | 'BLOCKED';
  statusLabel: string;
}
@Component({
  selector: 'app-nightaudit',
  standalone: true, // <--- Marqué comme Standalone
  templateUrl: './nightaudit.component.html',
  styleUrls: ['./nightaudit.component.scss'],
  imports: [MatCardModule,CommonModule,        // Résout *ngIf, *ngFor, date pipe
    MatCardModule,      // Résout mat-card, mat-card-header, mat-card-content, mat-card-title
    MatButtonModule,    // Résout mat-stroked-button, mat-flat-button
    MatTableModule,     // Résout mat-table, matColumnDef, mat-header-cell, mat-cell
    MatSnackBarModule]
})
export class NightauditComponent implements OnInit {

  pmsBusinessDate: Date = new Date();
  hasBlockingIssues: boolean = true;

  displayedColumns: string[] = ['type', 'description', 'blocking', 'action'];
  dataSource = new MatTableDataSource<AuditControl>([]);

  auditSteps: AuditStep[] = [
    { title: 'Arrivées & No-Shows', icon: 'fa-user-clock', status: 'WARNING', statusLabel: '2 En attente' },
    { title: 'Caisse & POS', icon: 'fa-cash-register', status: 'DONE', statusLabel: 'Caisses fermées' },
    { title: 'Posting Nuitées', icon: 'fa-bed', status: 'PENDING', statusLabel: 'Prêt (42 Ch.)' },
    { title: 'Changement de Date', icon: 'fa-calendar-check', status: 'BLOCKED', statusLabel: 'En attente' }
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadControls();
  }

  loadControls(): void {
    const mockControls: AuditControl[] = [
      {
        id: 1,
        controlName: 'Arrivées non effectuées (No-Shows potentiels)',
        description: '2 réservations prévues aujourd\'hui ne sont pas encore enregistrées en Check-In.',
        count: 2,
        severity: 'CRITICAL',
        isBlocking: true,
        actionLabel: 'Passer en No-Show',
        code: 'NO_SHOW'
      },
      {
        id: 2,
        controlName: 'Chambres non attribuées pour ce soir',
        description: 'Toutes les réservations de la journée ont une chambre assignée.',
        count: 0,
        severity: 'WARNING',
        isBlocking: false,
        actionLabel: 'Vérifier Allocation',
        code: 'UNASSIGNED'
      },
      {
        id: 3,
        controlName: 'Dépassement de crédit / Solde important',
        description: '1 chambre en séjour dépasse le plafond de crédit autorisé (Solde > 500€).',
        count: 1,
        severity: 'WARNING',
        isBlocking: false,
        actionLabel: 'Voir le compte',
        code: 'OPEN_FOLIO'
      }
    ];

    this.dataSource.data = mockControls.filter(c => c.count > 0);
    this.checkBlockingIssues();
  }

  checkBlockingIssues(): void {
    this.hasBlockingIssues = this.dataSource.data.some(c => c.isBlocking);
  }

  resolveControl(row: AuditControl): void {
    if (row.code === 'NO_SHOW') {
      // Traitement des No-Shows
      this.snackBar.open('Redirection vers la liste des arrivées en attente...', 'Fermer', { duration: 3000 });
    } else if (row.code === 'OPEN_FOLIO') {
      // Traitement des folios
      this.snackBar.open('Redirection vers le module Compte / Folio...', 'Fermer', { duration: 3000 });
    }
  }

  refreshControls(): void {
    this.loadControls();
    this.snackBar.open('Contrôles mis à jour avec succès.', 'OK', { duration: 2000 });
  }

  getNextBusinessDate(): Date {
    const nextDate = new Date(this.pmsBusinessDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  previewDailyReport(): void {
    // Génération/Impression du rapport PDF de la journée (Manager Report)
  }

  executeNightAudit(): void {
    if (this.hasBlockingIssues) return;

    // Lancement du script automatique backend (Posting, clôture caisses, incrementation date PMS)
    this.snackBar.open('Night Audit en cours d\'exécution... Veuillez patienter.', 'Info', { duration: 5000 });
  }

}
