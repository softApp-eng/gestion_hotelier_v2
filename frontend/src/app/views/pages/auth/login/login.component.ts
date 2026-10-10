import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/gestion/dashboard';
  }

  onLoggedin(e: Event): void {
    e.preventDefault();
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Veuillez saisir votre identifiant et votre mot de passe.';
      return;
    }
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: () => {
        this.loading = false;
        this.error = 'Identifiant ou mot de passe incorrect.';
      }
    });
  }

}
