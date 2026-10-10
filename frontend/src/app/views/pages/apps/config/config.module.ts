import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './config.component';
import { TypeClientConfigComponent } from './type-client-config/type-client-config.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListTypeClientComponent } from './list-type-client/list-type-client.component';
import { TarifChambreComponent } from './tarif-chambre/tarif-chambre.component';
import { AddTarifChambreComponent } from './add-tarif-chambre/add-tarif-chambre.component';
import { ListChambreComponent } from './list-chambre/list-chambre.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddChambreDialogComponent } from './list-chambre/add-chambre-dialog/add-chambre-dialog.component';
import { TarifChambreFormComponent } from './tarif-chambre/tarif-chambre-form/tarif-chambre-form.component';
// Pour l'option 1 (<mat-chip>)
import { MatChipsModule } from '@angular/material/chips';

// Pour l'option 2 (matBadge)
import { MatBadgeModule } from '@angular/material/badge';

// Ajouter MatSelectModule dans l'array imports: []
const routes: Routes = [
  {
    path: '',
    component: ConfigComponent,
    children: [
      {
        path: '',
        redirectTo: 'typeclients',
        pathMatch: 'full'
      },
      {
        path: 'typeclients',
        component: ListTypeClientComponent
      },
     {
        path: 'addtypeclients',
        component: TypeClientConfigComponent
      },
      {
        path: 'typechambres',
        component: ListChambreComponent
      },
      {
        path: 'tarifchambres',
        component: TarifChambreComponent
      },
    ]
  }
]

@NgModule({
  declarations: [
    ListTypeClientComponent,
    TarifChambreComponent,
    AddTarifChambreComponent,
    ListChambreComponent,
    AddChambreDialogComponent,
    TarifChambreFormComponent
  ],
  imports: [
    
    CommonModule,
        RouterModule.forChild(routes),
        FormsModule,ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSelectModule,
        MatDialogModule,
        MatCheckboxModule,
        MatChipsModule, // Pour l'option 1 (<mat-chip>)
        MatBadgeModule // Pour l'option 2 (matBadge)
  ]
})
export class ConfigModule { }
