import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-bons-repas',
  templateUrl: './gestion-bons-repas.component.html'
})
export class GestionBonsRepasComponent implements OnInit {

  bons: any[] = [];
  sejoursEnCours: any[] = [];
  showForm = false;
  form: any = { typeRepas: 'DEJEUNER', nbPersonnes: 1 };
  typesRepas = ['PETIT_DEJEUNER', 'DEJEUNER', 'DINER'];
  code = '';

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.load();
    this.api.sejours().subscribe(d => this.sejoursEnCours = (d || []).filter((s: any) => s.statut === 'EN_COURS'));
  }

  load(): void {
    this.api.bonsRepas().subscribe(d => this.bons = d);
  }

  nouveau(): void {
    this.form = { typeRepas: 'DEJEUNER', nbPersonnes: 1, sejourId: this.sejoursEnCours.length ? this.sejoursEnCours[0].id : null };
    this.showForm = true;
  }

  save(): void {
    const payload: any = {
      typeRepas: this.form.typeRepas,
      nbPersonnes: this.form.nbPersonnes,
      observation: this.form.observation
    };
    if (this.form.sejourId) payload.sejour = { id: this.form.sejourId };
    this.api.createBonRepas(payload).subscribe({
      next: (b: any) => {
        Swal.fire({ icon: 'success', title: 'Bon ' + b.numero + ' créé', text: 'Imputé au compte client', timer: 1400, showConfirmButton: false });
        this.showForm = false; this.load();
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Création impossible', 'error')
    });
  }

  controler(): void {
    if (!this.code) return;
    this.api.utiliserBon(this.code.trim()).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Bon validé', timer: 1200, showConfirmButton: false }); this.code = ''; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Code invalide', 'error')
    });
  }

  annuler(b: any): void {
    Swal.fire({ title: 'Annuler le bon ' + b.numero + ' ?', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Oui', cancelButtonText: 'Non' }).then(r => {
      if (r.isConfirmed) this.api.annulerBon(b.id).subscribe(() => this.load());
    });
  }

  pdf(b: any): void {
    this.api.bonPdf(b.id).subscribe(blob => this.print.openBlob(blob));
  }

  imprimer(b: any): void {
    let html = '<div class="hdr"><div class="brand">BON REPAS</div>'
      + '<div class="sub">Hôtel V2</div></div>';
    html += '<p><b>N° :</b> ' + b.numero + '<br><b>Type :</b> ' + b.typeRepas
      + '<br><b>Date :</b> ' + (b.dateRepas || '') + '<br><b>Bénéficiaire :</b> ' + (b.beneficiaire || '-')
      + '<br><b>Personnes :</b> ' + b.nbPersonnes + '<br><b>Montant :</b> ' + (b.montant || 0).toFixed(2) + ' DA'
      + '<br><b>Code :</b> ' + b.code + '</p>';
    this.print.print('Bon repas ' + b.numero, html);
  }

  label(t: string): string {
    if (t === 'PETIT_DEJEUNER') return 'Petit-déjeuner';
    if (t === 'DEJEUNER') return 'Déjeuner';
    if (t === 'DINER') return 'Dîner';
    return t;
  }
}
