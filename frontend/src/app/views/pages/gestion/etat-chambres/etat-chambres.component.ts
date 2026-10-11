import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-etat-chambres',
  templateUrl: './etat-chambres.component.html'
})
export class EtatChambresComponent implements OnInit {

  chambres: any[] = [];
  gouvernantes: any[] = [];
  types: any[] = [];
  pavillons: any[] = [];
  filtres: any = {};

  tab = 'etat';

  etatsMenage = [
    { code: 'CLEAN', label: 'Clean', cls: 'success' },
    { code: 'A_VERIFIER', label: 'À vérifier', cls: 'warning' },
    { code: 'DIRTY', label: 'Dirty', cls: 'danger' },
    { code: 'BLOQUEE', label: 'Bloquée', cls: 'secondary' }
  ];

  problemes: any[] = [];
  problemeFilter = '';
  showProblemeForm = false;
  problemeForm: any = { priorite: 'MOYENNE' };

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.api.gouvernantes().subscribe(d => this.gouvernantes = d);
    this.api.typesChambre().subscribe(d => this.types = d);
    this.api.pavillons().subscribe(d => this.pavillons = d);
    this.load();
    this.loadProblemes();
  }

  load(): void {
    this.api.etatChambres(this.filtres).subscribe(d => this.chambres = d);
  }

  loadProblemes(): void {
    this.api.problemes(this.problemeFilter).subscribe(d => this.problemes = d);
  }

  // ---------- état de ménage ----------
  setEtat(c: any, etat: string): void {
    this.api.changerEtatMenage(c.id, etat, c.gouvernanteId).subscribe(() => { this.load(); this.loadProblemes(); });
  }

  affecter(c: any): void {
    this.api.affecterGouvernante(c.id, c.gouvernanteId).subscribe(() => this.load());
  }

  // ---------- vérification quotidienne ----------
  roomsAVerifier(): any[] {
    return this.chambres.filter(c => c.statutJour === 'DEPART' || c.statutJour === 'RECOUCHE'
      || c.etatMenage === 'DIRTY' || c.etatMenage === 'A_VERIFIER');
  }

  verifier(c: any): void {
    if (!c.gouvernanteId) {
      Swal.fire('Gouvernante requise', 'Sélectionnez la femme de chambre avant de vérifier.', 'warning');
      return;
    }
    this.api.changerEtatMenage(c.id, 'CLEAN', c.gouvernanteId, 'Vérification quotidienne').subscribe(() => {
      Swal.fire({ icon: 'success', title: 'Chambre ' + c.numero + ' vérifiée', timer: 1000, showConfirmButton: false });
      this.load();
    });
  }

  // ---------- problèmes techniques ----------
  nouveauProbleme(c?: any): void {
    this.problemeForm = { priorite: 'MOYENNE', chambreId: c ? c.id : (this.chambres[0] ? this.chambres[0].id : null) };
    this.showProblemeForm = true;
  }

  saveProbleme(): void {
    this.api.signalerProbleme(this.problemeForm).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Problème signalé', timer: 1000, showConfirmButton: false });
        this.showProblemeForm = false; this.loadProblemes(); this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Signalement impossible', 'error')
    });
  }

  resoudre(p: any): void {
    Swal.fire({ title: 'Résoudre le problème ?', input: 'text', inputLabel: 'Résolution', icon: 'question',
      showCancelButton: true, confirmButtonText: 'Résoudre', cancelButtonText: 'Annuler' }).then(r => {
      if (r.isConfirmed) this.api.changerStatutProbleme(p.id, 'RESOLU', r.value || '').subscribe(() => { this.loadProblemes(); this.load(); });
    });
  }

  prendreEnCharge(p: any): void {
    this.api.changerStatutProbleme(p.id, 'EN_COURS').subscribe(() => this.loadProblemes());
  }

  // ---------- affichage ----------
  etatInfo(code: string): any {
    return this.etatsMenage.find(e => e.code === code) || { label: code, cls: 'light' };
  }

  statutJourBadge(s: string): string {
    if (s === 'DEPART') return 'bg-danger';
    if (s === 'RECOUCHE') return 'bg-primary';
    if (s === 'ARRIVEE') return 'bg-success';
    return 'bg-light text-dark';
  }

  compte(code: string): number {
    return this.chambres.filter(c => c.etatMenage === code).length;
  }

  imprimer(): void {
    let html = '<div class="hdr"><div class="brand">HÔTEL V2 — État des chambres</div>'
      + '<div class="sub">' + new Date().toLocaleDateString() + '</div></div>';
    html += '<table><thead><tr><th class="lib">Chambre</th><th class="lib">Étage</th><th class="lib">Type</th>'
      + '<th class="lib">Pavillon</th><th class="lib">Ménage</th><th class="lib">Situation</th><th class="lib">Occupant</th>'
      + '<th class="lib">Gouvernante</th></tr></thead><tbody>';
    this.chambres.forEach((c: any) => {
      html += '<tr><td class="lib">' + c.numero + '</td><td class="lib">' + (c.etage || '') + '</td>'
        + '<td class="lib">' + (c.typeChambre || '') + '</td><td class="lib">' + (c.pavillon || '') + '</td>'
        + '<td class="lib">' + this.etatInfo(c.etatMenage).label + '</td><td class="lib">' + (c.statutJour || '—') + '</td>'
        + '<td class="lib">' + (c.occupant || '') + '</td><td class="lib">' + (c.gouvernante || '') + '</td></tr>';
    });
    html += '</tbody></table>';
    this.print.print('État des chambres', html);
  }
}
