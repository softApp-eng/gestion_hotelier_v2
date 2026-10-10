import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { id } from '@swimlane/ngx-datatable';
import { ChambreService } from 'src/app/core/services/chambre.service';

@Component({
  selector: 'app-add-chambre-dialog',
  templateUrl: './add-chambre-dialog.component.html',
  styleUrls: ['./add-chambre-dialog.component.scss']
})
export class AddChambreDialogComponent implements OnInit {
typeChambreForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private chambreService: ChambreService,
    public dialogRef: MatDialogRef<AddChambreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.typeChambreForm = this.fb.group({
      id: [null],
      code: ['', [Validators.required]],
      libelle: ['', [Validators.required]],
      capacite: [1, [Validators.required, Validators.min(1)]],
      description: [''],
      active: [true]
    });
  }

  // Force la saisie du code en majuscules
  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.typeChambreForm.get('code')?.setValue(input.value, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.typeChambreForm.valid) {
      this.isSubmitting = true;
      
      // Envoie des données correspondant à l'entité Java TypeChambre
      this.chambreService.saveNewTypeChambre(this.typeChambreForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur lors de la sauvegarde:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
