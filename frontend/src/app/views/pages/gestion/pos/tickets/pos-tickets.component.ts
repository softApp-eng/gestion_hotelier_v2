import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pos-tickets',
  templateUrl: './pos-tickets.component.html'
})
export class PosTicketsComponent implements OnInit {

  tickets: any[] = [];
  clients: any[] = [];
  showForm = false;
  form: any = { typeRepas: 'DEJEUNER', nbPersonnes: 1, client: {}, dateRepas: new Date().toISOString().substring(0, 10) };
  codeToCheck = '';
  filterDate = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.clients().subscribe(d => this.clients = d);
    this.load();
  }

  load(): void {
    this.api.tickets(this.filterDate || undefined).subscribe(d => this.tickets = d);
  }

  newTicket(): void {
    this.form = { typeRepas: 'DEJEUNER', nbPersonnes: 1, client: {}, dateRepas: new Date().toISOString().substring(0, 10) };
    this.showForm = true;
  }

  save(): void {
    this.api.createTicket(this.form).subscribe({
      next: (t) => {
        this.showForm = false;
        this.load();
        Swal.fire({ icon: 'success', title: 'Ticket ' + t.numero, html: 'Code : <b>' + t.code + '</b>', confirmButtonText: 'OK' });
      },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
    });
  }

  controler(): void {
    if (!this.codeToCheck) return;
    this.api.utiliserTicket(this.codeToCheck.toUpperCase()).subscribe({
      next: (t) => { Swal.fire({ icon: 'success', title: 'Ticket validé', text: t.numero + ' (' + t.beneficiaire + ')', timer: 2000 });
        this.codeToCheck = ''; this.load(); },
      error: (e) => Swal.fire({ icon: 'error', title: 'Ticket refusé', text: e.error?.message || 'Code invalide ou déjà utilisé' })
    });
  }

  valider(t: any): void {
    Swal.fire({ title: 'Valider ce ticket ?', text: t.numero, icon: 'question', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
      .then(r => { if (r.isConfirmed) this.api.utiliserTicket(t.code).subscribe(() => this.load()); });
  }

  annuler(t: any): void {
    Swal.fire({ title: 'Annuler le ticket ?', text: t.numero, icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
      .then(r => { if (r.isConfirmed) this.api.annulerTicket(t.id).subscribe(() => this.load()); });
  }

  imprimer(t: any): void {
    this.api.ticketPdf(t.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (!w) { const a = document.createElement('a'); a.href = url; a.download = t.numero + '.pdf'; a.click(); }
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      this.load();
    });
  }

  statutBadge(s: string): string {
    switch (s) {
      case 'VALIDE': return 'bg-success';
      case 'UTILISE': return 'bg-primary';
      case 'ANNULE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
