import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { PrintService } from 'src/app/core/services/print.service';
import Swal from 'sweetalert2';
import { dateToIso, isoToDate } from 'src/app/shared/utils/date-utils';

@Component({
  selector: 'app-night-audit',
  templateUrl: './night-audit.component.html'
})
export class NightAuditComponent implements OnInit {

  /** Helpers de conversion ISO ↔ Date pour le sélecteur Material. */
  readonly isoToDate = isoToDate;
  readonly dateToIso = dateToIso;

  date: string;
  apercu: any = null;
  mainCourante: any[] = [];

  constructor(private api: ApiService, private print: PrintService) {}

  ngOnInit(): void {
    this.date = new Date().toISOString().substring(0, 10);
    this.load();
  }

  load(): void {
    this.api.nightAuditApercu(this.date).subscribe(d => this.apercu = d);
    this.api.mainCourante(this.date).subscribe(d => this.mainCourante = d);
  }

  modes(): string[] {
    return this.apercu ? Object.keys(this.apercu.encaissementParMode || {}) : [];
  }

  cloturer(): void {
    Swal.fire({
      title: 'Clôturer la journée ?',
      input: 'text',
      inputLabel: 'Observation (facultatif)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clôturer',
      cancelButtonText: 'Annuler'
    }).then(r => {
      if (r.isConfirmed) {
        this.api.cloturerNightAudit(this.date, r.value || '').subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Journée clôturée', timer: 1400, showConfirmButton: false }); this.load(); },
          error: (e) => Swal.fire('Erreur', e.error?.message || 'Clôture impossible', 'error')
        });
      }
    });
  }

  imprimer(): void {
    const a = this.apercu;
    if (!a) return;
    let html = '<div class="hdr"><div class="brand">HÔTEL V2 — Night Audit</div>'
      + '<div class="sub">Journée du ' + a.date + '</div></div>';
    html += '<h4>Rapport d\'encaissement</h4><table><tbody>'
      + '<tr><td class="lib">Total encaissé</td><td>' + (a.totalEncaisse || 0).toFixed(2) + ' DA</td></tr>'
      + '<tr><td class="lib">dont Espèces</td><td>' + (a.totalEspeces || 0).toFixed(2) + ' DA</td></tr>'
      + '<tr><td class="lib">dont Autres (TPE/PEC)</td><td>' + (a.totalAutres || 0).toFixed(2) + ' DA</td></tr>'
      + '<tr><td class="lib">Total hébergement</td><td>' + (a.totalHebergement || 0).toFixed(2) + ' DA</td></tr>'
      + '<tr><td class="lib">Total subsistance</td><td>' + (a.totalSubsistance || 0).toFixed(2) + ' DA</td></tr>'
      + '</tbody></table>';
    html += '<h4>Taux d\'occupation</h4><table><tbody>'
      + '<tr><td class="lib">Chambres occupées</td><td>' + a.chambresOccupees + ' / ' + a.totalChambres + '</td></tr>'
      + '<tr><td class="lib">Taux d\'occupation</td><td>' + (a.tauxOccupation || 0).toFixed(2) + ' %</td></tr>'
      + '<tr><td class="lib">Arrivées</td><td>' + a.nbArrivees + '</td></tr>'
      + '<tr><td class="lib">Départs</td><td>' + a.nbDeparts + '</td></tr>'
      + '<tr><td class="lib">Séjours en cours</td><td>' + a.nbEnCours + '</td></tr>'
      + '</tbody></table>';
    html += '<h4>Main courante</h4><table><thead><tr><th>Heure</th><th class="lib">Type</th><th class="lib">Libellé</th><th>Montant</th></tr></thead><tbody>';
    this.mainCourante.forEach((e: any) => {
      html += '<tr><td>' + e.heure + '</td><td class="lib">' + e.type + '</td><td class="lib">' + e.libelle
        + '</td><td>' + (e.montant || 0).toFixed(2) + '</td></tr>';
    });
    html += '</tbody></table>';
    this.print.print('Night audit ' + a.date, html);
  }
}
