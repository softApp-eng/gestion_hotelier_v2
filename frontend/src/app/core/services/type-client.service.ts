  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
import { TypeClientReponseDto } from './models/TypeClientReponseDto';
  export interface TypeClientDto {
    code: string;
    libelle: string;
    description: string;
  }
  @Injectable({
    providedIn: 'root'
  })
  export class TypeClientService {

    private apiUrl = 'http://localhost:9090/api/type-clients';

    constructor(private http: HttpClient) {}

    create(dto: TypeClientDto): Observable<any> {
      return this.http.post<any>(this.apiUrl + "/new", dto);
    }
    
    getAll(): Observable<any> {
      return this.http.get<any>(this.apiUrl + "/all");
    }
// using status pour get all type client active
    getAllTypeClient(): Observable<TypeClientReponseDto[]> {
    return this.http.get<TypeClientReponseDto[]>(`${this.apiUrl}/all`);
  }
  }
