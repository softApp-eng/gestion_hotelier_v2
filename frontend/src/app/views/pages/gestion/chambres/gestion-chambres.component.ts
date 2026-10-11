import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-chambres',
  templateUrl: './gestion-chambres.component.html'
})
export class GestionChambresComponent implements OnInit {

  chambres: any[] = [];
  types: any[] = [];
  pavillons: any[] = [];
  gouvernantes: any[] = [];
  loading = false;
  recherche = '';

  // ---- Filtres ----
  pavillonFiltre: number | null = null;
  typeFiltre: number | null = null;
  etatFiltre = '';

  etats = ['LIBRE', 'OCCUPEE', 'NETTOYAGE', 'HORS_SERVICE'];
  etatsMenage = [
    { code: 'CLEAN', label: 'Clean' },
    { code: 'A_VERIFIER', label: 'À vérifier' },
    { code: 'DIRTY', label: 'Dirty' },
    { code: 'BLOQUEE', label: 'Bloquée' }
  ];

  showForm = false;
  form: any = { etat: 'LIBRE', etatMenage: 'A_VERIFIER' };
  typeForm: any = { capacite: 2 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.loadTypes();
    this.api.pavillons().subscribe(d => this.pavillons = d);
    this.api.gouvernantes().subscribe(d => this.gouvernantes = d);
  }

  load(): void {
    this.loading = true;
    this.api.chambres().subscribe({
      next: (d) => { this.chambres = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadTypes(): void {
    this.api.typesChambre().subscribe({ next: (d) => this.types = d });
  }

  chambresFiltrees(): any[] {
    const q = this.recherche.trim().toLowerCase();
    return this.chambres.filter(c => {
      if (this.pavillonFiltre && c.pavillon?.id !== this.pavillonFiltre) return false;
      if (this.typeFiltre && c.typeChambre?.id !== this.typeFiltre) return false;
      if (this.etatFiltre && c.etat !== this.etatFiltre) return false;
      if (q && !(c.numero || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  resetFiltres(): void {
    this.recherche = '';
    this.pavillonFiltre = null;
    this.typeFiltre = null;
    this.etatFiltre = '';
  }

  newRoom(): void {
    this.form = {
      etat: 'LIBRE',
      etatMenage: 'A_VERIFIER',
      bloque: false,
      typeChambre: { id: this.types[0] ? this.types[0].id : null },
      pavillon: { id: this.pavillons[0] ? this.pavillons[0].id : null },
      gouvernante: { id: null }
    };
    this.showForm = true;
  }

  edit(c: any): void {
    this.form = {
      ...c,
      typeChambre: c.typeChambre ? { id: c.typeChambre.id } : { id: null },
      pavillon: c.pavillon ? { id: c.pavillon.id } : { id: null },
      gouvernante: c.gouvernante ? { id: c.gouvernante.id } : { id: null }
    };
    this.showForm = true;
  }

  onTypeChange(): void {
    const t = this.types.find((x: any) => x.id === this.form.typeChambre?.id);
    if (t) this.form.prix = t.prixBase;
  }

  save(): void {
    if (!this.form.numero) {
      Swal.fire('Numéro requis', 'Saisissez le numéro de la chambre.', 'warning');
      return;
    }
    this.api.saveChambre(this.form).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Chambre enregistrée', timer: 1200, showConfirmButton: false });
        this.showForm = false;
        this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  setEtat(c: any, etat: string): void {
    this.api.changeEtatChambre(c.id, etat).subscribe({ next: () => this.load() });
  }

  setEtatMenage(c: any, etat: string): void {
    this.api.changerEtatMenage(c.id, etat, c.gouvernante ? c.gouvernante.id : null).subscribe({ next: () => this.load() });
  }

  remove(c: any): void {
    Swal.fire({ title: 'Supprimer ?', text: `Chambre ${c.numero}`, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.deleteChambre(c.id).subscribe({ next: () => this.load() });
    });
  }

  saveType(): void {
    this.api.saveTypeChambre(this.typeForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Type ajouté', timer: 1200, showConfirmButton: false });
        this.typeForm = { capacite: 2 };
        this.loadTypes();
      }
    });
  }

  etatBadge(etat: string): string {
    switch (etat) {
      case 'LIBRE': return 'bg-success';
      case 'OCCUPEE': return 'bg-danger';
      case 'NETTOYAGE': return 'bg-warning text-dark';
      case 'HORS_SERVICE': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  menageBadge(etat: string): string {
    switch (etat) {
      case 'CLEAN': return 'bg-success';
      case 'A_VERIFIER': return 'bg-warning text-dark';
      case 'DIRTY': return 'bg-danger';
      case 'BLOQUEE': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
}
