import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url } from 'inspector';
import { environment } from 'src/environments/environment';
export interface ClientRequestDto {

  nom: string;
  prenom: string;

  email?: string;
  telephone?: string;

  date_naissance?: string;
  sexe?: string;

  cin?: string;
  passport?: string;
  adresse?: string;
  observation?: string;

  typeClientId: number;

  gradeId?: number;
  nationaliteId?: number;
  degreParenteId?: number;

  is_active?: string;
}
@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private url = environment.url;
  private apiUrl = `${this.url}/clients`;

  constructor(
    private http: HttpClient
  ) {}

  save(client: ClientRequestDto): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/new`,
      client
    );
  }

  getGrades(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/grade`);
  }

}
