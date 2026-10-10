import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-utilisateurs',
  templateUrl: './gestion-utilisateurs.component.html'
})
export class GestionUtilisateursComponent implements OnInit {

  users: any[] = [];
  roles = ['ADMIN', 'MANAGER', 'RECEPTION', 'SERVEUR', 'CAISSIER'];
  showForm = false;
  form: any = { role: 'RECEPTION', actif: true };

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) this.load();
  }

  load(): void {
    this.api.users().subscribe({ next: d => this.users = d, error: () => Swal.fire('Accès refusé', 'Réservé à l\'administrateur.', 'error') });
  }

  newUser(): void {
    this.form = { role: 'RECEPTION', actif: true };
    this.showForm = true;
  }

  edit(u: any): void {
    this.form = { ...u, password: '' };
    this.showForm = true;
  }

  save(): void {
    this.api.saveUser(this.form).subscribe({
      next: () => { Swal.fire({ icon: 'success', title: 'Utilisateur enregistré', timer: 1000, showConfirmButton: false });
        this.showForm = false; this.load(); },
      error: (e) => Swal.fire('Erreur', e.error?.message || 'Erreur', 'error')
    });
  }

  remove(u: any): void {
    Swal.fire({ title: 'Supprimer ?', text: u.username, icon: 'warning', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non' })
      .then(r => { if (r.isConfirmed) this.api.deleteUser(u.id).subscribe(() => this.load()); });
  }
}
