import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';
import { dateToIso, isoToDate } from 'src/app/shared/utils/date-utils';

@Component({
  selector: 'app-gestion-rapports',
  templateUrl: './gestion-rapports.component.html'
})
export class GestionRapportsComponent implements OnInit {

  /** Helpers de conversion ISO ↔ Date pour les sélecteurs Material. */
  readonly isoToDate = isoToDate;
  readonly dateToIso = dateToIso;

  from: string = new Date().toISOString().substring(0, 10);
  to: string = new Date().toISOString().substring(0, 10);
  rapport: any = null;
  dashboard: any = {};
  maxCa = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.dashboard().subscribe(d => {
      this.dashboard = d;
      this.maxCa = Math.max(1, ...(d.caSemaine || []).map((x: any) => x.total));
    });
    this.search();
  }

  search(): void {
    this.api.rapportVentes(this.from, this.to).subscribe(d => this.rapport = d);
  }

  barWidth(total: number): string { return Math.round((total / this.maxCa) * 100) + '%'; }

  exportCsv(): void {
    if (!this.rapport?.ventes?.length) { Swal.fire('Info', 'Aucune donnée à exporter.', 'info'); return; }
    let csv = 'Numero;Date;Type;Paiement;Total;Statut\n';
    this.rapport.ventes.forEach((v: any) => {
      csv += `${v.numero};${v.dateVente};${v.typeVente};${v.modesPaiement || ''};${v.total};${v.statut}\n`;
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ventes_${this.from}_${this.to}.csv`;
    a.click();
  }
}
