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

  /** Advanced stay search used by the Séjours filters. */
  sejoursRecherche(f: { checkinFrom?: string; checkinTo?: string; checkoutFrom?: string; checkoutTo?: string; statut?: string; numero?: string }): Observable<any> {
    let params = new HttpParams();
    if (f.checkinFrom) params = params.set('checkinFrom', f.checkinFrom);
    if (f.checkinTo) params = params.set('checkinTo', f.checkinTo);
    if (f.checkoutFrom) params = params.set('checkoutFrom', f.checkoutFrom);
    if (f.checkoutTo) params = params.set('checkoutTo', f.checkoutTo);
    if (f.statut) params = params.set('statut', f.statut);
    if (f.numero) params = params.set('numero', f.numero);
    return this.http.get(`${this.base}/sejours/recherche`, { params });
  }

  // ------------------------------------------------- REPORTING (existing)
  // (placed after stays for readability)

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

  // ---------------------------------------------------- CONFIG: PAVILLONS
  pavillons(): Observable<any> { return this.http.get(`${this.base}/pavillons`); }
  savePavillon(p: any): Observable<any> {
    return p.id ? this.http.put(`${this.base}/pavillons/${p.id}`, p) : this.http.post(`${this.base}/pavillons`, p);
  }
  deletePavillon(id: number): Observable<any> { return this.http.delete(`${this.base}/pavillons/${id}`); }

  // --------------------------------------------- CONFIG: CATEGORIES CLIENTS
  categoriesClients(): Observable<any> { return this.http.get(`${this.base}/categories-clients`); }
  saveCategorieClient(c: any): Observable<any> {
    return c.id ? this.http.put(`${this.base}/categories-clients/${c.id}`, c)
                : this.http.post(`${this.base}/categories-clients`, c);
  }
  deleteCategorieClient(id: number): Observable<any> { return this.http.delete(`${this.base}/categories-clients/${id}`); }

  // ------------------------------------------------------- CONFIG: TARIFS
  tarifs(): Observable<any> { return this.http.get(`${this.base}/tarifs`); }
  saveTarif(t: any): Observable<any> { return this.http.post(`${this.base}/tarifs`, t); }
  deleteTarif(id: number): Observable<any> { return this.http.delete(`${this.base}/tarifs/${id}`); }
  tarifPrix(categorieClientId: number, typeChambreId: number): Observable<any> {
    const params = new HttpParams().set('categorieClientId', categorieClientId).set('typeChambreId', typeChambreId);
    return this.http.get(`${this.base}/tarifs/prix`, { params });
  }

  // --------------------------------------------------- CONFIG: ORGANISMES
  organismes(): Observable<any> { return this.http.get(`${this.base}/organismes`); }
  saveOrganisme(o: any): Observable<any> {
    return o.id ? this.http.put(`${this.base}/organismes/${o.id}`, o) : this.http.post(`${this.base}/organismes`, o);
  }
  deleteOrganisme(id: number): Observable<any> { return this.http.delete(`${this.base}/organismes/${id}`); }

  // ------------------------------------------------------------- PLANNING
  planning(debut: string, fin: string, pavillonId?: number): Observable<any> {
    let params = new HttpParams().set('debut', debut).set('fin', fin);
    if (pavillonId) params = params.set('pavillonId', pavillonId);
    return this.http.get(`${this.base}/planning`, { params });
  }
  etatJournalier(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.base}/planning/etat-journalier`, { params });
  }
  chambresDisponibles(debut: string, fin: string, pavillonId?: number, typeChambreId?: number): Observable<any> {
    let params = new HttpParams().set('debut', debut).set('fin', fin);
    if (pavillonId) params = params.set('pavillonId', pavillonId);
    if (typeChambreId) params = params.set('typeChambreId', typeChambreId);
    return this.http.get(`${this.base}/planning/disponibles`, { params });
  }

  // --------------------------------------------------- COMPTES CLIENTS (folio)
  comptes(statut?: string): Observable<any> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get(`${this.base}/comptes`, { params });
  }
  compteBySejour(sejourId: number): Observable<any> { return this.http.get(`${this.base}/comptes/sejour/${sejourId}`); }
  comptePrestations(id: number): Observable<any> { return this.http.get(`${this.base}/comptes/${id}/prestations`); }
  ajouterPrestation(id: number, p: any): Observable<any> { return this.http.post(`${this.base}/comptes/${id}/prestations`, p); }
  ajouterHebergement(id: number): Observable<any> { return this.http.post(`${this.base}/comptes/${id}/hebergement`, {}); }
  cloturerCompte(id: number): Observable<any> { return this.http.post(`${this.base}/comptes/${id}/cloturer`, {}); }

  // --------------------------------------------------------------- BONS REPAS
  bonsRepas(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.base}/bons-repas`, { params });
  }
  createBonRepas(b: any): Observable<any> { return this.http.post(`${this.base}/bons-repas`, b); }
  utiliserBon(code: string): Observable<any> { return this.http.post(`${this.base}/bons-repas/utiliser/${code}`, {}); }
  annulerBon(id: number): Observable<any> { return this.http.post(`${this.base}/bons-repas/${id}/annuler`, {}); }
  bonPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/bons-repas/${id}/pdf`, { responseType: 'blob' });
  }

  // ---------------------------------------------------------------- FACTURES
  factures(): Observable<any> { return this.http.get(`${this.base}/factures`); }
  factureById(id: number): Observable<any> { return this.http.get(`${this.base}/factures/${id}`); }
  facturesBySejour(sejourId: number): Observable<any> { return this.http.get(`${this.base}/factures/sejour/${sejourId}`); }
  genererFactures(sejourId: number): Observable<any> { return this.http.post(`${this.base}/factures/sejour/${sejourId}`, {}); }
  facturePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/factures/${id}/pdf`, { responseType: 'blob' });
  }

  // -------------------------------------------------------------- NIGHT AUDIT
  nightAuditApercu(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.base}/night-audit/apercu`, { params });
  }
  cloturerNightAudit(date?: string, observation?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (observation) params = params.set('observation', observation);
    return this.http.post(`${this.base}/night-audit/cloturer`, {}, { params });
  }
  mainCourante(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.base}/night-audit/main-courante`, { params });
  }
  derniereCloture(): Observable<any> { return this.http.get(`${this.base}/night-audit/derniere`); }

  // ------------------------------------------------------------- GOUVERNANTES
  gouvernantes(actifs?: boolean, pavillonId?: number): Observable<any> {
    let params = new HttpParams();
    if (actifs) params = params.set('actifs', 'true');
    if (pavillonId) params = params.set('pavillonId', pavillonId);
    return this.http.get(`${this.base}/gouvernantes`, { params });
  }
  saveGouvernante(g: any): Observable<any> { return this.http.post(`${this.base}/gouvernantes`, g); }
  deleteGouvernante(id: number): Observable<any> { return this.http.delete(`${this.base}/gouvernantes/${id}`); }

  // -------------------------------------------------------- HOUSEKEEPING
  etatChambres(filtres?: { pavillonId?: number; etage?: string; typeChambreId?: number; etatMenage?: string }): Observable<any> {
    let params = new HttpParams();
    if (filtres) {
      if (filtres.pavillonId) params = params.set('pavillonId', filtres.pavillonId);
      if (filtres.etage) params = params.set('etage', filtres.etage);
      if (filtres.typeChambreId) params = params.set('typeChambreId', filtres.typeChambreId);
      if (filtres.etatMenage) params = params.set('etatMenage', filtres.etatMenage);
    }
    return this.http.get(`${this.base}/housekeeping/etat-chambres`, { params });
  }
  changerEtatMenage(chambreId: number, etatMenage: string, gouvernanteId?: number, observation?: string): Observable<any> {
    let params = new HttpParams().set('etatMenage', etatMenage);
    if (gouvernanteId) params = params.set('gouvernanteId', gouvernanteId);
    if (observation) params = params.set('observation', observation);
    return this.http.post(`${this.base}/housekeeping/${chambreId}/etat-menage`, {}, { params });
  }
  affecterGouvernante(chambreId: number, gouvernanteId?: number): Observable<any> {
    let params = new HttpParams();
    if (gouvernanteId) params = params.set('gouvernanteId', gouvernanteId);
    return this.http.post(`${this.base}/housekeeping/${chambreId}/gouvernante`, {}, { params });
  }
  problemes(statut?: string): Observable<any> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get(`${this.base}/housekeeping/problemes`, { params });
  }
  signalerProbleme(body: any): Observable<any> { return this.http.post(`${this.base}/housekeeping/problemes`, body); }
  changerStatutProbleme(id: number, statut: string, resolution?: string): Observable<any> {
    let params = new HttpParams().set('statut', statut);
    if (resolution) params = params.set('resolution', resolution);
    return this.http.post(`${this.base}/housekeeping/problemes/${id}/statut`, {}, { params });
  }
  planningGouvernante(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.base}/housekeeping/planning-gouvernante`, { params });
  }
  planningOccupation(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.base}/housekeeping/planning-occupation`, { params });
  }

  // ---------- Tour de la semaine (roulement des femmes de chambre) ----------
  tourMenageSemaine(debut?: string): Observable<any> {
    let params = new HttpParams();
    if (debut) params = params.set('debut', debut);
    return this.http.get(`${this.base}/tour-menage`, { params });
  }

  saveTourMenage(a: any): Observable<any> {
    return this.http.post(`${this.base}/tour-menage`, a);
  }

  /** Permanence du jour (une seule femme de chambre « reste en retard », tout l'hôtel). */
  savePermanence(date: string, gouvernanteId: number | null): Observable<any> {
    return this.http.post(`${this.base}/tour-menage/permanence`, { date, gouvernanteId });
  }
}
