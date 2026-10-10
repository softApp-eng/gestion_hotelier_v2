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

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: GestionDashboardComponent },
  { path: 'chambres', component: GestionChambresComponent },
  { path: 'reservations', component: GestionReservationsComponent },
  { path: 'sejours', component: GestionSejoursComponent },
  { path: 'clients', component: GestionClientsComponent },
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
