import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'http://localhost:9090/api/reservations';

  constructor(private http: HttpClient) {}

  // Méthode principale pour créer une réservation
  createReservation(reservationData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reservationData);
  }

  // Alias pour compatibilité avec votre code existant
  createReservation2(payload: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/new`, payload);
}

  // Récupérer toutes les réservations
  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Récupérer une réservation par ID
  getReservationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour une réservation
  updateReservation(id: number, reservationData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, reservationData);
  }

  // Supprimer une réservation
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Check-in
  checkIn(reservationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/checkin`, {});
  }

  // Check-out
  checkOut(reservationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/checkout`, {});
  }

  // Annuler
  annuler(reservationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/annuler`, {});
  }

  // No-Show
  noShow(reservationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/noshow`, {});
  }

  // Confirmer
  confirmer(reservationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${reservationId}/confirmer`, {});
  }

  // Récupérer les réservations par statut
  getReservationsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${status}`);
  }

  // Récupérer les réservations actives (CHECK_IN)
  getActiveReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active`);
  }

  // Récupérer les check-ins du jour
  getTodayCheckIns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/today/checkin`);
  }

  // Récupérer les check-outs du jour
  getTodayCheckOuts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/today/checkout`);
  }

  // Récupérer les réservations pour une date
  getReservationsForDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/date/${date}`);
  }

  // Statistiques par statut
  countByStatut(status: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/count/${status}`);
  }
}