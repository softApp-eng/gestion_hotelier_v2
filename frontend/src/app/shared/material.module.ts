import { NgModule } from '@angular/core';

// Angular Material — briques de formulaires (apparence « outline »).
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

/**
 * Regroupe les modules Angular Material utilisés pour les champs de formulaire
 * et les exporte, afin d'être importé une seule fois par module fonctionnel.
 */
const MODULES = [
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatButtonModule,
  MatIconModule,
  MatAutocompleteModule
];

@NgModule({
  imports: MODULES,
  exports: MODULES
})
export class MaterialModule {}
