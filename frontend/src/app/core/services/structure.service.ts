import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private baseUrl =  'http://localhost:9090/';

  constructor(private http: HttpClient) {}

  getPavillons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/pavillons`);
  }

  getChambres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/chambres`);
  }

  getAvailableChambres(pavillonId: number, checkIn: string, checkOut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/chambres/disponibles`, {
      params: { pavillonId, checkIn, checkOut }
    });
  }

  // Récupère les types de chambres d'un pavillon
  getTypesChambreParPavillon(pavillonId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/pavillons/${pavillonId}/types-chambres`);
  }

  // Récupère les chambres libres selon Pavillon + Type + Dates
  getChambresDisponibles(pavillonId: number, typeChambreId: number, checkIn: string, checkOut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/chambres/disponibles`, {
      params: {
        pavillonId,
        typeChambreId,
        checkIn,
        checkOut
      }
    });
  }
}