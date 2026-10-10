import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Single typed gateway to the Hotel V2 REST API.
 * Keeping all HTTP calls here keeps components thin and the app lightweight.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.url;

  constructor(private http: HttpClient) {}

  // ------------------------------------------------------------------ AUTH
  // (handled by AuthService)

  // ------------------------------------------------------------- DASHBOARD
  dashboard(): Observable<any> { return this.http.get(`${this.base}/reports/dashboard`); }
  caSemaine(): Observable<any> { return this.http.get(`${this.base}/reports/ca-semaine`); }
  rapportVentes(from: string, to: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get(`${this.base}/reports/ventes`, { params });
  }

  // --------------------------------------------------------------- CLIENTS
  clients(): Observable<any> { return this.http.get(`${this.base}/clients`); }
  clientsPage(q: string, page: number, size: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get(`${this.base}/clients/page`, { params });
  }
  saveClient(c: any): Observable<any> {
    return c.id ? this.http.put(`${this.base}/clients/${c.id}`, c) : this.http.post(`${this.base}/clients`, c);
  }
  deleteClient(id: number): Observable<any> { return this.http.delete(`${this.base}/clients/${id}`); }

  // -------------------------------------------------------------- CHAMBRES
  chambres(): Observable<any> { return this.http.get(`${this.base}/chambres`); }
  saveChambre(c: any): Observable<any> {
    return c.id ? this.http.put(`${this.base}/chambres/${c.id}`, c) : this.http.post(`${this.base}/chambres`, c);
  }
  changeEtatChambre(id: number, etat: string): Observable<any> {
    return this.http.patch(`${this.base}/chambres/${id}/etat?etat=${etat}`, {});
  }
  deleteChambre(id: number): Observable<any> { return this.http.delete(`${this.base}/chambres/${id}`); }
  typesChambre(): Observable<any> { return this.http.get(`${this.base}/chambres/types`); }
  saveTypeChambre(t: any): Observable<any> { return this.http.post(`${this.base}/chambres/types`, t); }

  // ---------------------------------------------------------- RESERVATIONS
  reservations(statut?: string): Observable<any> {
    const url = statut ? `${this.base}/reservations?statut=${statut}` : `${this.base}/reservations`;
    return this.http.get(url);
  }
  arrivees(): Observable<any> { return this.http.get(`${this.base}/reservations/arrivees`); }
  saveReservation(r: any): Observable<any> {
    return r.id ? this.http.put(`${this.base}/reservations/${r.id}`, r) : this.http.post(`${this.base}/reservations`, r);
  }
  changeStatutReservation(id: number, statut: string): Observable<any> {
    return this.http.patch(`${this.base}/reservations/${id}/statut?statut=${statut}`, {});
  }
  deleteReservation(id: number): Observable<any> { return this.http.delete(`${this.base}/reservations/${id}`); }

  // --------------------------------------------------------------- SEJOURS
  sejours(): Observable<any> { return this.http.get(`${this.base}/sejours`); }
  sejoursEnCours(): Observable<any> { return this.http.get(`${this.base}/sejours?statut=EN_COURS`); }
  checkinReservation(id: number): Observable<any> { return this.http.post(`${this.base}/sejours/checkin/${id}`, {}); }
  checkinDirect(s: any): Observable<any> { return this.http.post(`${this.base}/sejours/checkin-direct`, s); }
  checkout(id: number): Observable<any> { return this.http.post(`${this.base}/sejours/${id}/checkout`, {}); }

  // ----------------------------------------------------------------- MENU
  categories(): Observable<any> { return this.http.get(`${this.base}/menu/categories`); }
  saveCategorie(c: any): Observable<any> { return this.http.post(`${this.base}/menu/categories`, c); }
  deleteCategorie(id: number): Observable<any> { return this.http.delete(`${this.base}/menu/categories/${id}`); }

  produits(q?: string, categorieId?: number): Observable<any> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (categorieId) params = params.set('categorieId', categorieId);
    return this.http.get(`${this.base}/menu/produits`, { params });
  }
  saveProduit(p: any): Observable<any> {
    return p.id ? this.http.put(`${this.base}/menu/produits/${p.id}`, p) : this.http.post(`${this.base}/menu/produits`, p);
  }
  deleteProduit(id: number): Observable<any> { return this.http.delete(`${this.base}/menu/produits/${id}`); }

  // --------------------------------------------------------------- TABLES
  tables(): Observable<any> { return this.http.get(`${this.base}/tables`); }
  saveTable(t: any): Observable<any> {
    return t.id ? this.http.put(`${this.base}/tables/${t.id}`, t) : this.http.post(`${this.base}/tables`, t);
  }
  deleteTable(id: number): Observable<any> { return this.http.delete(`${this.base}/tables/${id}`); }

  // --------------------------------------------------------- COMMANDES
  commandes(): Observable<any> { return this.http.get(`${this.base}/resto/commandes`); }
  commandesOuvertes(): Observable<any> { return this.http.get(`${this.base}/resto/commandes/ouvertes`); }
  saveCommande(c: any): Observable<any> { return this.http.post(`${this.base}/resto/commandes`, c); }
  payerCommande(id: number, body: any): Observable<any> { return this.http.post(`${this.base}/resto/commandes/${id}/payer`, body); }
  deleteCommande(id: number): Observable<any> { return this.http.delete(`${this.base}/resto/commandes/${id}`); }

  // ------------------------------------------------------------------ POS
  sessionCaisse(): Observable<any> { return this.http.get(`${this.base}/pos/session`); }
  openCaisse(montantOuverture: number, observation?: string): Observable<any> {
    return this.http.post(`${this.base}/pos/session/open`, { montantOuverture, observation });
  }
  closeCaisse(id: number, montantCompte: number, observation?: string): Observable<any> {
    return this.http.post(`${this.base}/pos/session/${id}/close`, { montantCompte, observation });
  }
  sessions(): Observable<any> { return this.http.get(`${this.base}/pos/sessions`); }
  ventes(): Observable<any> { return this.http.get(`${this.base}/pos/ventes`); }
  ventesDuJour(): Observable<any> { return this.http.get(`${this.base}/pos/ventes/jour`); }
  createVente(v: any): Observable<any> { return this.http.post(`${this.base}/pos/ventes`, v); }
  annulerVente(id: number): Observable<any> { return this.http.post(`${this.base}/pos/ventes/${id}/annuler`, {}); }

  // -------------------------------------------------------------- TICKETS
  tickets(date?: string): Observable<any> {
    return this.http.get(date ? `${this.base}/tickets?date=${date}` : `${this.base}/tickets`);
  }
  createTicket(t: any): Observable<any> { return this.http.post(`${this.base}/tickets`, t); }
  utiliserTicket(code: string): Observable<any> { return this.http.post(`${this.base}/tickets/${code}/utiliser`, {}); }
  annulerTicket(id: number): Observable<any> { return this.http.post(`${this.base}/tickets/${id}/annuler`, {}); }
  ticketPdfUrl(id: number): string { return `${this.base}/tickets/${id}/pdf`; }
  ticketPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/tickets/${id}/pdf`, { responseType: 'blob' });
  }

  // ------------------------------------------------------------ UTILISATEURS
  users(): Observable<any> { return this.http.get(`${this.base}/users`); }
  saveUser(u: any): Observable<any> {
    return u.id ? this.http.put(`${this.base}/users/${u.id}`, u) : this.http.post(`${this.base}/users`, u);
  }
  deleteUser(id: number): Observable<any> { return this.http.delete(`${this.base}/users/${id}`); }
}
