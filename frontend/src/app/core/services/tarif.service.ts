import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface TarifChambreListDto {
  id?: number;
  prix: number;
  active: boolean;
  typeClient: number;      // ID du TypeClient
  typeClientName?: string; // Nom/Libellé renvoyé par le backend
  typeChambre: number;     // ID du TypeChambre
  typeChambreName?: string;// Nom/Libellé renvoyé par le backend
}
@Injectable({
  providedIn: 'root'
})
export class TarifService {
  private apiUrl = 'http://localhost:9090/api';

  constructor(private http: HttpClient) { }

  getTarifs(typeClientId: number, typeChambreId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/tarifs/price`,
      {
        params: {
          typeClientId: typeClientId.toString(),
          typeChambreId: typeChambreId.toString()
        }
      }
    );
  }

  getAllTarifs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tarifs/allTarif`);
  }

  createTarif(tarif: TarifChambreListDto): Observable<TarifChambreListDto> {
    return this.http.post<TarifChambreListDto>(this.apiUrl + "/tarifs", tarif);
  }

  updateTarif(id: number, tarif: TarifChambreListDto): Observable<TarifChambreListDto> {
    return this.http.put<TarifChambreListDto>(`${this.apiUrl}/${id}`, tarif);
  }
}