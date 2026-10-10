import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-dashboard',
  templateUrl: './gestion-dashboard.component.html'
})
export class GestionDashboardComponent implements OnInit {

  data: any = {};
  loading = true;
  maxCa = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.dashboard().subscribe({
      next: (d) => {
        this.data = d;
        const totals = (d.caSemaine || []).map((x: any) => x.total);
        this.maxCa = Math.max(1, ...totals);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger le tableau de bord.', 'error');
      }
    });
  }

  barWidth(total: number): string {
    return Math.round((total / this.maxCa) * 100) + '%';
  }
}
