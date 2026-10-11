import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Pages
import { GestionDashboardComponent } from './dashboard/gestion-dashboard.component';
import { GestionChambresComponent } from './chambres/gestion-chambres.component';
import { GestionReservationsComponent } from './reservations/gestion-reservations.component';
import { GestionSejoursComponent } from './sejours/gestion-sejours.component';
import { GestionClientsComponent } from './clients/gestion-clients.component';
import { RestoTablesComponent } from './restaurant/tables/resto-tables.component';
import { RestoCommandesComponent } from './restaurant/commandes/resto-commandes.component';
import { RestoMenuComponent } from './restaurant/menu/resto-menu.component';
import { PosCaisseComponent } from './pos/caisse/pos-caisse.component';
import { PosTicketsComponent } from './pos/tickets/pos-tickets.component';
import { GestionRapportsComponent } from './rapports/gestion-rapports.component';
import { GestionUtilisateursComponent } from './utilisateurs/gestion-utilisateurs.component';
import { GestionPavillonsComponent } from './config/pavillons/gestion-pavillons.component';
import { GestionCategoriesClientsComponent } from './config/categories-clients/gestion-categories-clients.component';
import { GestionTarifsComponent } from './config/tarifs/gestion-tarifs.component';
import { GestionOrganismesComponent } from './config/organismes/gestion-organismes.component';
import { PlanningChambresComponent } from './planning/planning-chambres.component';
import { EtatJournalierComponent } from './etat-journalier/etat-journalier.component';
import { GestionComptesComponent } from './comptes/gestion-comptes.component';
import { GestionBonsRepasComponent } from './bons-repas/gestion-bons-repas.component';
import { GestionFacturesComponent } from './factures/gestion-factures.component';
import { NightAuditComponent } from './night-audit/night-audit.component';
import { EtatChambresComponent } from './etat-chambres/etat-chambres.component';
import { PlanningGouvernanteComponent } from './planning-gouvernante/planning-gouvernante.component';
import { GestionGouvernantesComponent } from './config/gouvernantes/gestion-gouvernantes.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: GestionDashboardComponent },
  { path: 'chambres', component: GestionChambresComponent },
  { path: 'reservations', component: GestionReservationsComponent },
  { path: 'sejours', component: GestionSejoursComponent },
  { path: 'clients', component: GestionClientsComponent },
  { path: 'planning', component: PlanningChambresComponent },
  { path: 'etat-journalier', component: EtatJournalierComponent },
  { path: 'comptes', component: GestionComptesComponent },
  { path: 'bons-repas', component: GestionBonsRepasComponent },
  { path: 'factures', component: GestionFacturesComponent },
  { path: 'night-audit', component: NightAuditComponent },
  { path: 'etat-chambres', component: EtatChambresComponent },
  { path: 'planning-gouvernante', component: PlanningGouvernanteComponent },
  { path: 'config/pavillons', component: GestionPavillonsComponent },
  { path: 'config/categories-clients', component: GestionCategoriesClientsComponent },
  { path: 'config/tarifs', component: GestionTarifsComponent },
  { path: 'config/organismes', component: GestionOrganismesComponent },
  { path: 'config/gouvernantes', component: GestionGouvernantesComponent },
  { path: 'restaurant/tables', component: RestoTablesComponent },
  { path: 'restaurant/commandes', component: RestoCommandesComponent },
  { path: 'restaurant/menu', component: RestoMenuComponent },
  { path: 'pos/caisse', component: PosCaisseComponent },
  { path: 'pos/tickets', component: PosTicketsComponent },
  { path: 'rapports', component: GestionRapportsComponent },
  { path: 'utilisateurs', component: GestionUtilisateursComponent }
];

@NgModule({
  declarations: [
    GestionDashboardComponent,
    GestionChambresComponent,
    GestionReservationsComponent,
    GestionSejoursComponent,
    GestionClientsComponent,
    GestionPavillonsComponent,
    GestionCategoriesClientsComponent,
    GestionTarifsComponent,
    GestionOrganismesComponent,
    PlanningChambresComponent,
    EtatJournalierComponent,
    GestionComptesComponent,
    GestionBonsRepasComponent,
    GestionFacturesComponent,
    NightAuditComponent,
    EtatChambresComponent,
    PlanningGouvernanteComponent,
    GestionGouvernantesComponent,
    RestoTablesComponent,
    RestoCommandesComponent,
    RestoMenuComponent,
    PosCaisseComponent,
    PosTicketsComponent,
    GestionRapportsComponent,
    GestionUtilisateursComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class GestionModule { }
