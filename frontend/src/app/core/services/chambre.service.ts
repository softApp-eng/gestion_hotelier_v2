import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChambreDisponibleDto } from './models/chambreDisponibleDto';

@Injectable({
  providedIn: 'root'
})
export class ChambreService {



  private apiUrl = 'http://localhost:9090/api/chambres';
  private apiUrlTypeChambre = 'http://localhost:9090/api/type-chambres';
  constructor(private httpClient: HttpClient) { }

  getChambresDisponibles(
  typeChambreId: number,
  dateArrivee: string,
  dateDepart: string
): Observable<ChambreDisponibleDto[]> {

  let params = new HttpParams()
    .set('typeChambreId', typeChambreId)
    .set('dateArrivee', dateArrivee)
    .set('dateDepart', dateDepart);

  return this.httpClient.get<ChambreDisponibleDto[]>(
    `${this.apiUrl}/disponibles`,
    { params }
  );
}


getAllChambres(): Observable<any[]> {
  return this.httpClient.get<any[]>(this.apiUrl); }


  saveNewTypeChambre(data: any): Observable<any> {
  return this.httpClient.post<any>(this.apiUrlTypeChambre+"/new", data);
}

getTypeChambres(): Observable<any[]> {
  return this.httpClient.get<any[]>(this.apiUrlTypeChambre+"/list"); 
}
}



