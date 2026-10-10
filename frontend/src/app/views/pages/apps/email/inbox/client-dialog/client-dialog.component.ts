import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from 'src/app/core/services/client.service';

@Component({
  selector: 'app-client-dialog',
  templateUrl: './client-dialog.component.html',
  styleUrls: ['./client-dialog.component.scss']
})
export class ClientDialogComponent implements OnInit {

  searchTerm = '';

  newClientForm!: FormGroup;

  clientsList = [
    {
      id: 1,
      nom: 'Alami',
      prenom: 'Youssef',
      cin: 'AB123456',
      passport: '',
      telephone: '0661234567',
      grade: null,
      nationalite: null,
      degreParente: null
    },
    {
      id: 2,
      nom: 'Benjelloun',
      prenom: 'Sarra',
      cin: 'CD789012',
      passport: '',
      telephone: '0669876543',
      grade: null,
      nationalite: null,
      degreParente: null
    }
  ];

  filteredClients = [...this.clientsList];

  // Exemple : à remplacer par tes données API
  grades: any[] = [];
  nationalites: any[] = [];
  degresParente: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClientDialogComponent>,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
  this.getGrade();
   this.newClientForm = this.fb.group({

  nom: ['', Validators.required],

  prenom: ['', Validators.required],

  cin: [''],

  passport: [''],

  telephone: [''],

  adresse: [''],

  observation: [''],

  typeClientId: [
    this.data?.typeClient?.id ?? null,
    Validators.required
  ],

  gradeId: [null],

  nationaliteId: [null],

  degreParenteId: [null],

  is_active: ['true']
});


    this.updateValidators();
  
  }

  // =========================================================
  // TYPE CLIENT
  // =========================================================

  get typeClientCode(): string {
    return this.data?.typeClient?.code ?? '';
  }

  get isOfficier(): boolean {
    return this.typeClientCode === 'OFFICIER';
  }

  get isOfficierFamille(): boolean {
    return this.typeClientCode === 'OFFICIER_FAMILLE';
  }

  get isAyantDroit(): boolean {
    return this.typeClientCode === 'AYANT_DROIT';
  }

  get isCivilAutorise(): boolean {
    return this.typeClientCode === 'CIVIL_AUTORISE';
  }

  get isEtranger(): boolean {
    return this.typeClientCode === 'ETRANGER';
  }

  get isInvite(): boolean {
    return this.typeClientCode === 'INVITE';
  }

  get isGendarmerie(): boolean {
    return this.typeClientCode === 'GENDARMERIE';
  }

  // =========================================================
  // CHAMPS À AFFICHER
  // =========================================================

  get showCin(): boolean {
    return this.isGendarmerie;
  }

  get showPassport(): boolean {
    return this.isEtranger;
  }

  get showTelephone(): boolean { 
    return true;
  }

  get showGrade(): boolean {
    return this.isOfficier || this.isGendarmerie;
  }

  get showNationalite(): boolean {
    return this.isEtranger;
  }

  get showDegreParente(): boolean {
    return this.isOfficierFamille || this.isAyantDroit;
  }

  get showEmail(): boolean {
    return !this.isInvite;
  }

  get showAdresse(): boolean {
    return !this.isInvite;
  }

  get showSexe(): boolean {
    return true;
  }

  // =========================================================
  // VALIDATORS
  // =========================================================

 updateValidators(): void {
  const cin = this.newClientForm.get('cin');
  const passport = this.newClientForm.get('passport');
  const grade = this.newClientForm.get('gradeId');
  const nationalite = this.newClientForm.get('nationaliteId');    // <-- CORRIGÉ
  const degreParente = this.newClientForm.get('degreParenteId');  // <-- CORRIGÉ

  // Reset
  cin?.clearValidators();
  passport?.clearValidators();
  grade?.clearValidators();
  nationalite?.clearValidators();
  degreParente?.clearValidators();

  // Étranger => passeport obligatoire
  if (this.isEtranger) {
    passport?.setValidators([Validators.required]);
  }
  // Tous les autres => CIN obligatoire
  // else {
  //   cin?.setValidators([Validators.required]);
  // }

  // Officier / Gendarmerie => grade obligatoire
  if (this.showGrade) {
    grade?.setValidators([Validators.required]);
  }

  // Étranger => nationalité obligatoire
  if (this.showNationalite) {
    nationalite?.setValidators([Validators.required]);
  }

  // Famille / Ayant droit => degré de parenté obligatoire
  if (this.showDegreParente) {
    degreParente?.setValidators([Validators.required]);
  }

  cin?.updateValueAndValidity();
  passport?.updateValueAndValidity();
  grade?.updateValueAndValidity();
  nationalite?.updateValueAndValidity();
  degreParente?.updateValueAndValidity();
}

  // =========================================================
  // RECHERCHE CLIENT
  // =========================================================

  filterClients(): void {

    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredClients = [...this.clientsList];
      return;
    }

    this.filteredClients = this.clientsList.filter(client =>
      client.nom.toLowerCase().includes(term) ||
      client.prenom.toLowerCase().includes(term) ||
      client.cin?.toLowerCase().includes(term) ||
      client.passport?.toLowerCase().includes(term)
    );
  }

  // =========================================================
  // CLIENT EXISTANT
  // =========================================================

  onSelectExistingClient(event: any): void {

    const selectedClient = event.options[0]?.value;

    if (selectedClient) {
      this.dialogRef.close(selectedClient);
    }
  }

  // =========================================================
  // NOUVEAU CLIENT
  // =========================================================

saveNewClient(): void {
  // AFFICHE TOUTES LES ERREURS
  console.log('=== ÉTAT DU FORMULAIRE ===');
  console.log('Valide ?', this.newClientForm.valid);
  console.log('Valeurs :', this.newClientForm.value);
  
  // Parcourir tous les champs pour voir les erreurs
  Object.keys(this.newClientForm.controls).forEach(key => {
    const control = this.newClientForm.get(key);
    if (control?.invalid) {
      console.log(`❌ ${key} est invalide :`, {
        value: control.value,
        errors: control.errors
      });
    } else {
      console.log(`✅ ${key} est valide :`, control?.value);
    }
  });

 
  if (this.newClientForm.invalid) {

    this.newClientForm.markAllAsTouched();

    return;
  }

  const clientDto = this.newClientForm.value;

  console.log('Client à envoyer :', clientDto);

  this.clientService.save(clientDto).subscribe({

    next: (client) => {

      console.log('Client créé :', client);

      this.dialogRef.close(client);

    },

    error: (error) => {

      console.error(
        'Erreur création client :',
        error
      );

    }

  });
}

getGrade(){
  this.clientService.getGrades().subscribe({
    next: (grades) => {
      this.grades = grades;
      console.log('Grades récupérés :', this.grades);
        // Met à jour la validation après chargement des grades
      this.updateValidators();
    },
    error: (error) => {
      console.error('Erreur récupération des grades :', error);
    }
  });
}
}
