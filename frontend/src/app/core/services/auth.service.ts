import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
  nom: string;
  prenom: string;
  role: string;
}

const TOKEN_KEY = 'h2_token';
const USER_KEY = 'h2_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.url}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res));
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): LoginResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as LoginResponse : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const u = this.getUser();
    return u ? u.role : null;
  }

  hasRole(...roles: string[]): boolean {
    const r = this.getRole();
    return r != null && roles.includes(r);
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
