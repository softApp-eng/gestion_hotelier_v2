import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TarifService } from 'src/app/core/services/tarif.service';

@Component({
  selector: 'app-tarif-chambre-form',
  templateUrl: './tarif-chambre-form.component.html',
  styleUrls: ['./tarif-chambre-form.component.scss']
})
export class TarifChambreFormComponent implements OnInit {
  tarifForm!: FormGroup;
  isEditMode = false;
  typesClient: any[] = [];
  typesChambre: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TarifChambreFormComponent>,
    private cdr: ChangeDetectorRef, // Injection du ChangeDetectorRef
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tarifService: TarifService  
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.tarif;
    
    // Assignation des listes
    this.typesClient = this.data?.typesClient || [];
    this.typesChambre = this.data?.typesChambre || [];
  console.log('Types Client:', this.typesClient);
  console.log('Types Chambre:', this.typesChambre);
    const tarif = this.data?.tarif;

    this.tarifForm = this.fb.group({
      id: [""],
      prix: [tarif?.prix || null, [Validators.required, Validators.min(0)]],
      titre: [tarif?.titre || null, [Validators.required, Validators.minLength(3)]],
      active: [tarif?.active ?? true],
      typeClient: [tarif?.typeClient ?? tarif?.typeClientId ?? null, [Validators.required]],
      typeChambre: [tarif?.typeChambre ?? tarif?.typeChambreId ?? null, [Validators.required]]
    });

    // Force la détection des changements pour rafraîchir le rendu du mat-select
    this.cdr.detectChanges();
  }

  // Méthode si vous chargez les listes depuis des Observables dans ce composant directement
  setLists(clients: any[], chambres: any[]): void {
    this.typesClient = clients;
    this.typesChambre = chambres;
    console.log('Types Client:', this.typesChambre);
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.tarifForm.valid) {
      const payload = { ...this.tarifForm.value };
      console.log('Payload before closing dialog:', payload);
      // if (!payload.id) {
      //   delete payload.id;
      // }
this.tarifService.createTarif(payload).subscribe({
  next: () => {
    this.dialogRef.close(true);
  },
  error: (err) => {
    console.error('Erreur lors de la création :', err);
  }
});
    }
  }
private createTarif(payload: any): void {
    //this.loading = true;
    this.tarifService.createTarif(payload).subscribe({
      next: () => {
       // this.loadTarifs();
       this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur lors de la création :', err);
       // this.loading = false;
      }
    });
  }
  onCancel(): void {
    this.dialogRef.close(null);
  }
}