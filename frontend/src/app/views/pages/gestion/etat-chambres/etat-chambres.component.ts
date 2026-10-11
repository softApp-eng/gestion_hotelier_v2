import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-etat-chambres',
  templateUrl: './etat-chambres.component.html',
  styles: [`
    .matrix-table th, .matrix-table td { text-align: center; vertical-align: middle; }
    .matrix-table thead th { background: #f1f3f5; font-size: .8rem; }
    .matrix-table .etage-cell { width: 56px; background: #f1f3f5; font-size: .8rem; white-space: nowrap; }
    .matrix-table .room-cell { cursor: pointer; min-width: 96px; padding: 4px 6px; }
    .matrix-table .room-cell .room-num { font-weight: 700; }
    .matrix-table .room-cell .room-type { font-size: .72rem; color: #6c757d; }
    .matrix-table .room-cell .room-badges { display: flex; gap: 3px; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 2px; }
    .matrix-table .room-cell .room-situation { display: inline-block; margin-top: 3px; font-size: .7rem; font-weight: 700; padding: 1px 6px; border-radius: 3px; }
    .matrix-table .room-cell.m-clean { background: #e8f6ec; }
    .matrix-table .room-cell.m-verif { background: #fff7e0; }
    .matrix-table .room-cell.m-dirty { background: #fdeaea; }
    .matrix-table .room-cell.m-block { background: #ececec; }
    .sit-recouche, .s-recouche { background: #dbeafe; color: #1e40af; }
    .sit-depart, .s-depart { background: #f8d7da; color: #842029; }
    .sit-arrivee, .s-arrivee { background: #d1e7dd; color: #0f5132; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 3px; vertical-align: middle; }
  `]
})
export class EtatChambresComponent implements OnInit {

  chambres: any[] = [];
  planning: any = { pavillons: [] };
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
    this.loadPlanning();
    this.loadProblemes();
  }

  load(): void {
    this.api.etatChambres(this.filtres).subscribe(d => this.chambres = d);
  }

  loadPlanning(): void {
    this.api.planningOccupation().subscribe(d => this.planning = d || { pavillons: [] });
  }

  loadProblemes(): void {
    this.api.problemes(this.problemeFilter).subscribe(d => this.problemes = d);
  }

  // ---------- état de ménage ----------
  setEtat(c: any, etat: string): void {
    this.api.changerEtatMenage(c.id, etat, c.gouvernanteId).subscribe(() => {
      this.load(); this.loadPlanning(); this.loadProblemes();
    });
  }

  /** Compact state/action picker for a room in the matrix. */
  ouvrirActions(c: any): void {
    Swal.fire({
      title: 'Chambre ' + c.numero + ' — ' + (c.typeChambre || ''),
      input: 'select',
      inputOptions: { CLEAN: 'Clean', A_VERIFIER: 'À vérifier', DIRTY: 'Dirty', BLOQUEE: 'Bloquée' },
      inputValue: c.etatMenage,
      showCancelButton: true,
      confirmButtonText: 'Appliquer',
      cancelButtonText: 'Fermer'
    }).then(r => { if (r.isConfirmed && r.value) this.setEtat(c, String(r.value)); });
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
      this.load(); this.loadPlanning();
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

  /** Impression de la liste des problèmes techniques. */
  imprimerProblemes(): void {
    const lib = (s: string): string => {
      if (s === 'SIGNALE') return 'Signalé';
      if (s === 'EN_COURS') return 'En cours';
      if (s === 'RESOLU') return 'Résolu';
      return s || '';
    };
    let html = '<div class="hdr"><div class="brand">PROBLÈMES TECHNIQUES</div>'
      + '<div class="sub">' + new Date().toLocaleDateString()
      + ' &nbsp;·&nbsp; Total : <b>' + this.problemes.length + '</b></div></div>';
    html += '<table><thead><tr>'
      + '<th>Chambre</th><th class="lib">Description</th><th>Priorité</th><th>Statut</th>'
      + '<th>Signalé par</th><th>Date</th><th class="lib">Résolution</th></tr></thead><tbody>';
    this.problemes.forEach((p: any) => {
      const d = p.dateSignalement ? new Date(p.dateSignalement) : null;
      html += '<tr>'
        + '<td><b>' + (p.chambre ? p.chambre.numero : '') + '</b></td>'
        + '<td class="lib">' + (p.description || '') + '</td>'
        + '<td>' + (p.priorite || '') + '</td>'
        + '<td>' + lib(p.statut) + '</td>'
        + '<td>' + (p.signalePar || '') + '</td>'
        + '<td>' + (d ? d.toLocaleString() : '') + '</td>'
        + '<td class="lib">' + (p.resolution || '') + '</td>'
        + '</tr>';
    });
    if (!this.problemes.length) {
      html += '<tr><td colspan="7">Aucun problème</td></tr>';
    }
    html += '</tbody></table>';
    this.print.print('Problèmes techniques', html, 'portrait');
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

  /** Pavillons shown in the matrix (respects the pavilion filter). */
  pavillonsAffiches(): any[] {
    const list = this.planning && this.planning.pavillons ? this.planning.pavillons : [];
    if (!this.filtres.pavillonId) return list;
    return list.filter((p: any) => p.pavillonId === this.filtres.pavillonId);
  }

  responsableNoms(pav: any): string {
    const r = (pav.responsables || []).map((g: any) => g.nom);
    return r.length ? r.join(', ') : '—';
  }

  femmesNoms(pav: any): string {
    return (pav.femmes || []).map((g: any) => g.nom).join(', ');
  }

  menageCls(code: string): string {
    if (code === 'CLEAN') return 'm-clean';
    if (code === 'A_VERIFIER') return 'm-verif';
    if (code === 'DIRTY') return 'm-dirty';
    if (code === 'BLOQUEE') return 'm-block';
    return '';
  }

  sitCls(code: string): string {
    if (code === 'DEPART') return 's-depart';
    if (code === 'RECOUCHE') return 's-recouche';
    if (code === 'ARRIVEE') return 's-arrivee';
    return '';
  }

  imprimer(): void {
    let html = '<div class="hdr"><div class="brand">PLANNING D\'OCCUPATION DES CHAMBRES</div>'
      + '<div class="sub">' + new Date().toLocaleDateString()
      + ' &nbsp;·&nbsp; Départ : <b>' + (this.planning.nbDepart || 0) + '</b>'
      + ' &nbsp;·&nbsp; Recouché : <b>' + (this.planning.nbRecouche || 0) + '</b>'
      + ' &nbsp;·&nbsp; Arrivée : <b>' + (this.planning.nbArrivee || 0) + '</b>'
      + ' &nbsp;·&nbsp; Chambres : <b>' + (this.planning.nbChambres || 0) + '</b></div></div>';

    this.pavillonsAffiches().forEach((pav: any) => {
      html += '<div class="pav-title">PAVILLON ' + (pav.pavillon || '').toUpperCase()
        + ' <span class="pav-g">Gouvernante : ' + this.responsableNoms(pav) + '</span></div>';
      html += this.matrixHtml(pav);
      if (pav.femmes && pav.femmes.length) {
        html += '<div class="pav-femmes">Femmes de chambre : ' + this.femmesNoms(pav) + '</div>';
      }
    });

    html += '<div class="legend"><span class="lg s-recouche">Recouché</span>'
      + '<span class="lg s-depart">Départ</span><span class="lg s-arrivee">Arrivée</span></div>';

    this.print.print('Planning d\'occupation', html, 'landscape');
  }

  private matrixHtml(pav: any): string {
    const cols = this.colonnes(pav).length;
    let h = '<table class="matrix"><thead><tr><th class="etage">Étage</th>'
      + '<th colspan="' + cols + '">Chambres — n° · situation</th></tr></thead><tbody>';
    (pav.etages || []).forEach((e: any) => {
      h += '<tr><th class="etage">Étage<br>' + e.etage + '</th>';
      (e.chambres || []).forEach((c: any) => {
        h += '<td class="room">'
          + '<div class="num">' + c.numero + '</div>'
          + (c.statutJour ? '<div class="sit-tag ' + this.sitCls(c.statutJour) + '">'
              + this.statutLabel(c.statutJour) + '</div>' : '')
          + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table>';
    return h;
  }

  statutLabel(s: string): string {
    if (s === 'DEPART') return 'DÉPART';
    if (s === 'RECOUCHE') return 'RECOUCHÉ';
    if (s === 'ARRIVEE') return 'ARRIVÉE';
    return '';
  }

  colonnes(pav: any): number[] {
    const etages = pav && pav.etages ? pav.etages : [];
    let n = 0;
    etages.forEach((e: any) => { if ((e.chambres || []).length > n) n = e.chambres.length; });
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(i);
    return out;
  }
}
