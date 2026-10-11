import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

/**
 * Configuration des chambres (écran « Paramètres hôtel »).
 * Permet de créer / modifier / supprimer les chambres et les types de chambre,
 * avec filtres par pavillon, type et état.
 */
@Component({
  selector: 'app-gestion-config-chambres',
  templateUrl: './gestion-config-chambres.component.html'
})
export class GestionConfigChambresComponent implements OnInit {

  chambres: any[] = [];
  types: any[] = [];
  pavillons: any[] = [];
  gouvernantes: any[] = [];
  loading = false;

  // ---- Filtres ----
  recherche = '';
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
  form: any = {};
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

  /** Chambres filtrées par pavillon, type, état et recherche sur le n°. */
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

  // ---- Chambres ----
  newRoom(): void {
    this.form = {
      etat: 'LIBRE',
      etatMenage: 'A_VERIFIER',
      bloque: false,
      typeChambre: { id: this.types[0] ? this.types[0].id : null },
      pavillon: { id: this.pavillonFiltre || (this.pavillons[0] ? this.pavillons[0].id : null) },
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
    if (t && !this.form.id) this.form.prix = t.prixBase;
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

  remove(c: any): void {
    Swal.fire({
      title: 'Supprimer ?', text: `Chambre ${c.numero}`, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.api.deleteChambre(c.id).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Chambre supprimée', timer: 1000, showConfirmButton: false }); this.load(); },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Suppression impossible', 'error')
        });
      }
    });
  }

  // ---- Types de chambre ----
  newType(): void { this.typeForm = { capacite: 2 }; }

  editType(t: any): void { this.typeForm = { ...t }; }

  saveType(): void {
    if (!this.typeForm.libelle) {
      Swal.fire('Libellé requis', 'Saisissez le libellé du type.', 'warning');
      return;
    }
    this.api.saveTypeChambre(this.typeForm).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.typeForm.id ? 'Type modifié' : 'Type ajouté', timer: 1200, showConfirmButton: false });
        this.typeForm = { capacite: 2 };
        this.loadTypes();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Enregistrement impossible', 'error')
    });
  }

  removeType(t: any): void {
    Swal.fire({
      title: 'Supprimer ce type ?', text: t.libelle, icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.api.deleteTypeChambre(t.id).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Type supprimé', timer: 1000, showConfirmButton: false }); this.loadTypes(); },
          error: () => Swal.fire('Erreur', 'Ce type est utilisé par une ou plusieurs chambres.', 'error')
        });
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
