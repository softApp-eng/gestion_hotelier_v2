import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';
import { dateToIso, isoToDate } from 'src/app/shared/utils/date-utils';

@Component({
  selector: 'app-gestion-reservations',
  templateUrl: './gestion-reservations.component.html'
})
export class GestionReservationsComponent implements OnInit {

  /** Helpers de conversion ISO ↔ Date pour les sélecteurs Material. */
  readonly isoToDate = isoToDate;
  readonly dateToIso = dateToIso;

  reservations: any[] = [];
  arrivees: any[] = [];
  clients: any[] = [];
  chambres: any[] = [];
  pavillons: any[] = [];
  categories: any[] = [];
  organismes: any[] = [];
  pavillonFiltre: number | null = null;
  modesPaiement = ['ESPECES', 'TPE', 'PRISE_EN_CHARGE'];
  loading = false;
  showForm = false;
  form: any = { nbPersonnes: 1, statut: 'CONFIRMEE', modePaiement: 'ESPECES' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.clients().subscribe(d => this.clients = d);
    this.api.chambres().subscribe(d => this.chambres = d.filter((c: any) => c.etat !== 'HORS_SERVICE'));
    this.api.pavillons().subscribe(d => this.pavillons = d);
    this.api.categoriesClients().subscribe(d => this.categories = d);
    this.api.organismes().subscribe(d => this.organismes = d);
  }

  load(): void {
    this.loading = true;
    this.api.reservations().subscribe(d => { this.reservations = d; this.loading = false; });
    this.api.arrivees().subscribe(d => this.arrivees = d);
  }

  chambresFiltrees(): any[] {
    if (!this.pavillonFiltre) return this.chambres;
    return this.chambres.filter((c: any) => c.pavillon && c.pavillon.id === this.pavillonFiltre);
  }

  newRes(): void {
    this.pavillonFiltre = null;
    this.form = {
      nbPersonnes: 1, statut: 'CONFIRMEE', modePaiement: 'ESPECES',
      client: { id: this.clients[0]?.id },
      categorieClient: { id: this.categories[0]?.id },
      chambre: { id: this.chambres[0]?.id },
      organisme: { id: null }
    };
    this.showForm = true;
    this.calculTarif();
  }

  edit(r: any): void {
    this.pavillonFiltre = null;
    this.form = {
      ...r,
      client: { id: r.client?.id },
      chambre: { id: r.chambre?.id },
      categorieClient: r.categorieClient ? { id: r.categorieClient.id } : null,
      organisme: r.organisme ? { id: r.organisme.id } : { id: null }
    };
    if (!this.form.modePaiement) this.form.modePaiement = 'ESPECES';
    this.showForm = true;
  }

  isPec(): boolean {
    return this.form.modePaiement === 'PRISE_EN_CHARGE';
  }

  onChambreOrCategorieChange(): void {
    this.calculTarif();
  }

  calculTarif(): void {
    const catId = this.form.categorieClient?.id;
    const chambre = this.chambres.find((c: any) => c.id === this.form.chambre?.id);
    const typeId = chambre?.typeChambre?.id;
    if (!catId || !typeId) return;
    this.api.tarifPrix(catId, typeId).subscribe(p => {
      this.form.tarifNuitee = p;
      this.recalcMontant();
    });
  }

  recalcMontant(): void {
    const t = this.form.tarifNuitee;
    if (t) this.form.montantPrevu = t * Math.max(this.nbNuits(), 1);
  }

  nbNuits(): number {
    if (!this.form.dateArrivee || !this.form.dateDepart) return 0;
    const d1 = new Date(this.form.dateArrivee).getTime();
    const d2 = new Date(this.form.dateDepart).getTime();
    return Math.max(Math.round((d2 - d1) / 86400000), 0);
  }

  save(): void {
    this.api.saveReservation(this.form).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Réservation enregistrée', timer: 1200, showConfirmButton: false });
        this.showForm = false; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Conflit ou données invalides', 'error')
    });
  }

  checkin(r: any): void {
    Swal.fire({ title: 'Check-in', text: `Confirmer l'arrivée de ${r.client?.nom} (chambre ${r.chambre?.numero}) ?`,
      icon: 'question', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Annuler' }).then(res => {
      if (res.isConfirmed) {
        this.api.checkinReservation(r.id).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Check-in effectué', timer: 1200, showConfirmButton: false }); this.load(); },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Check-in impossible', 'error')
        });
      }
    });
  }

  statutBadge(s: string): string {
    switch (s) {
      case 'CONFIRMEE': return 'bg-primary';
      case 'EN_COURS': return 'bg-success';
      case 'TERMINEE': return 'bg-secondary';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-warning';
    }
  }

  modeBadge(m: string): string {
    switch (m) {
      case 'TPE': return 'bg-info text-dark';
      case 'PRISE_EN_CHARGE': return 'bg-warning text-dark';
      case 'ESPECES': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  remove(r: any): void {
    Swal.fire({ title: 'Supprimer la réservation ?', text: `Client ${r.client?.nom}, chambre ${r.chambre?.numero || '-'}`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' }).then(res => {
      if (res.isConfirmed) this.api.deleteReservation(r.id).subscribe(() => this.load());
    });
  }
}
