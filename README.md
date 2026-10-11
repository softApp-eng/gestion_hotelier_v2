# 🏨 Gestion Hôtel V2 — Hôtel + Restaurant + POS + Tickets repas

Application de gestion hôtelière **légère, modulaire et flexible**, construite à partir du socle
`api_hotel_cmo` (Spring Boot + Angular). Cette V2 ajoute la **gestion de restaurant**, le
**point de vente (POS / caisse)** et la **création de tickets repas**, avec une authentification
réelle par rôles.

- **Backend** : Spring Boot 3.3 (Java 17), JPA/Hibernate, Spring Security + JWT
- **Base de données** : **H2 en mémoire** (profil `demo`, zéro installation) ou **PostgreSQL** (profil `prod`)
- **Frontend** : Angular 14 + template NobleUI (shell conservé, navigation refaite)
- **Tickets repas** : génération **PDF** avec **QR code** (OpenPDF + ZXing)

---

## 🚀 Démarrage rapide (mode démo, sans aucune installation de base de données)

### 1. Backend

```powershell
cd backend
mvn spring-boot:run
# ou :
mvn -DskipTests package
java -jar target/hotelv2-1.0.0.jar
```

Le backend démarre sur **http://localhost:9090** avec un jeu de données de démonstration
(chambres, clients, menus, tables, tickets…) et la console H2 sur
**http://localhost:9090/h2-console**
(JDBC URL : `jdbc:h2:mem:hotelv2`, user `sa`, sans mot de passe).

### 2. Frontend

```powershell
cd frontend
npm install
npm start
```

Ouvrez **http://localhost:4200**.

### 3. Comptes de démonstration

| Identifiant | Mot de passe | Rôle | Accès principal |
|---|---|---|---|
| `admin` | `admin` | ADMIN | Tout, y compris Utilisateurs |
| `manager` | `1234` | MANAGER | Rapports, configuration |
| `reception` | `1234` | RECEPTION | Hôtel (réservations, check-in/out) |
| `serveur` | `1234` | SERVEUR | Restaurant (commandes) |
| `caisse` | `1234` | CAISSIER | POS / caisse, tickets repas |

---

## 🧩 Modules fonctionnels

| Module | Description |
|---|---|
| **Tableau de bord** | CA du jour, ventes, taux d'occupation, commandes ouvertes, CA 7 jours, top produits |
| **Hôtel** | Chambres (CRUD + états + types + pavillon + blocage), Réservations enrichies (catégorie client, pavillon, mode de paiement TPE/Espèces/Prise en charge, accompagnants, tarif auto), Check-in/Check-out, Clients |
| **Restaurant** | Plan de salle interactif, prise de commande, encaissement, gestion menu/produits/catégories |
| **Point de vente (POS)** | Grille produits tactile, panier, remise, multi-paiement, ouverture/clôture de caisse, ticket imprimable |
| **Tickets repas** | Création (auto-numérotée + code unique), contrôle d'accès par code/scan, impression **PDF + QR**, annulation |
| **Rapports** | CA 7 jours, ventes par période, export **CSV** |
| **Utilisateurs & rôles** | Gestion des comptes (ADMIN), rôles RECEPTION / SERVEUR / CAISSIER / MANAGER / ADMIN |
| **Planning** | Planning **mensuel par pavillon** (Libre / Réservée / Occupée / Bloquée), **État journalier** des chambres, **impression** |
| **Configuration hôtel** | **Pavillons**, **Catégories de clients** (officier sup./sub., gendarmerie, civil, invité, délégation…), **Grille tarifaire** (catégorie × type de chambre), **Organismes** de prise en charge |

---

## 🏨 Module Hôtel — Étape 1 (socle)

| Fonction | Détail |
|---|---|
| **Pavillons** | 2 pavillons créés au départ (paramétrables) ; chaque chambre rattachée à un pavillon |
| **Catégories clients** | 7 catégories (OFF_SUP, OFF_SUB, GEND, GEND_GEN, CIVIL, INVITE, DELEGATION) |
| **Grille tarifaire** | Prix / nuitée = **catégorie client × type de chambre** (éditable en grille), appliqué automatiquement aux réservations |
| **Réservation** | Pavillon, chambre, catégorie client, dates, nb personnes, **accompagnants (officier + famille)**, **mode de paiement** (TPE / Espèces / **Prise en charge**), organisme payeur + référence PEC, tarif et montant calculés |
| **Chambres** | Filtre par pavillon + **blocage** (période + motif) |
| **Séjours** | Filtres : date check-in (du/au), date check-out (du/au), option (en cours / terminés), **n° de chambre** |
| **Planning des chambres** | Grille **mensuelle par pavillon** : Libre / Réservée / Occupée / Bloquée, **imprimable** |
| **État journalier** | État des chambres par pavillon (occupant, arrivée, départ prévu, paiement), taux d'occupation, **imprimable** |
| **Organismes (PEC)** | Armée, Gendarmerie, Délégation… rattachés aux réservations en prise en charge |

> **À venir (Étape 2)** : compte client (folio) + prestations, **bons repas** (déjeuner/dîner) imprimés et imputés au compte, **facturation** (globale + hébergement + subsistance en PEC ; globale en espèces), **Night audit** (clôture de caisse, rapport d'encaissement, taux d'occupation, main courante imprimables).

---

## 🧾 Module Hôtel — Étape 2 (compte client, facturation, night audit)

| Fonction | Détail |
|---|---|
| **Compte client (folio)** | Ouvert automatiquement au check-in ; **prestations** imputées (hébergement, repas, diverses) ; total recalculé ; clôture au check-out |
| **Bons repas** | Bon **déjeuner / dîner / petit-déjeuner** créé par la réception, **imprimé (HTML + PDF/QR)**, imputé automatiquement au compte client ; contrôle par code ; annulation |
| **Facturation** | Au check-out : **Espèces / TPE → 1 facture globale** ; **Prise en charge → 3 factures** (hébergement + subsistance + globale récapitulative). Impression **HTML + PDF**. Génération idempotente |
| **Night audit** | Aperçu du jour : **rapport d'encaissement** (par mode), **taux d'occupation**, arrivées/départs/en cours, **main courante** (journal des mouvements), **clôture** de journée. **Imprimable** |

> **À venir (Étape 4)** : gouvernante — à définir ensemble.

---

## 🧹 Module Hôtel — Étape 3 (housekeeping / gouvernante)

> **Règle de confidentialité :** l'interface gouvernante ne montre **jamais l'identité du client**.
> On n'affiche que l'**état de la chambre**, la **situation** (Départ / Recouché / Arrivée) et le
> simple booléen **chambre occupée / libre**.

**Structure réelle des pavillons :**

| Pavillon | Étages | Chambres / étage | Types de chambre |
|---|---|---|---|
| **Chellah** | 5 | 7 | Simple, Chambre double, Mini suite, Suite |
| **Oudayas** | 4 | 7 | Suite Junior, Suite Senior, Chambre de luxe |

| Fonction | Détail |
|---|---|
| **État des chambres** | Tableau **matriciel** : une ligne par **étage**, une colonne par **chambre** (numéro + type + état de ménage + situation). États : **Clean / À vérifier / Dirty / Bloquée**, séparés de la *disponibilité* (Libre / Occupée / Bloquée). Clic sur une chambre pour changer l'état. Filtres pavillon / type / étage / état. Impression |
| **Vérification quotidienne** | Onglet listant les chambres à nettoyer/vérifier du jour (départ, recouché, dirty) avec **affectation de la femme de chambre** puis validation (→ Clean). Colonne **Chambre occupée** (Occupée / Libre) — **pas de nom de client** |
| **Problèmes techniques** | Onglet de signalement/traitement des pannes : chambre, description, priorité (basse/moyenne/haute), statut (signalé → en cours → résolu) |
| **Planning gouvernante** | Tableau **matriciel** identique (étages × 7 chambres). Chaque chambre affiche **une seule situation** : **RECOUCHÉ** *ou* **DÉPART** *ou* **ARRIVÉE** (calculée automatiquement depuis séjours & réservations), en plus de l'état de ménage et du badge « occupée ». **Imprimable** |
| **Gouvernantes** | Liste paramétrable avec **rôle** : **GOUVERNANTE** (responsable de pavillon, 1 par pavillon) ou **FEMME_DE_CHAMBRE** (3 par pavillon). Nom, prénom, téléphone, pavillon, actif — dans Configuration |
| **Ajout de chambre** | **Modal d'insertion** professionnel : identification, état de ménage, gouvernante affectée, blocage (période + motif) |

---

## 🔌 API REST (extrait)

| Méthode | Endpoint | Rôle |
|---|---|---|
| POST | `/api/auth/login` | Authentification (JWT) |
| GET | `/api/reports/dashboard` | Données du tableau de bord |
| GET/POST/PUT | `/api/clients` | Clients |
| GET/POST/PUT/PATCH | `/api/chambres`, `/api/chambres/types` | Chambres & types |
| GET/POST/PUT | `/api/reservations` | Réservations |
| GET | `/api/sejours/recherche?checkinFrom=&checkinTo=&checkoutFrom=&checkoutTo=&statut=&numero=` | Recherche de séjours (filtres) |
| GET/POST/PUT | `/api/pavillons`, `/api/categories-clients`, `/api/organismes` | Configuration hôtel |
| GET/POST/DELETE | `/api/tarifs`, `/api/tarifs/prix` | Grille tarifaire |
| GET | `/api/planning?debut=&fin=&pavillonId=`, `/api/planning/etat-journalier`, `/api/planning/disponibles` | Planning & état journalier |
| POST | `/api/sejours/checkin/{id}`, `/api/sejours/{id}/checkout` | Check-in / Check-out |
| GET/POST | `/api/menu/categories`, `/api/menu/produits` | Menu |
| GET/POST | `/api/tables` | Tables |
| GET/POST | `/api/resto/commandes`, `/api/resto/commandes/{id}/payer` | Commandes restaurant |
| GET/POST | `/api/pos/session`, `/api/pos/session/open`, `/api/pos/ventes` | Caisse & ventes |
| GET/POST | `/api/tickets`, `/api/tickets/{code}/utiliser`, `/api/tickets/{id}/pdf` | Tickets repas |
| GET/POST | `/api/comptes`, `/api/comptes/sejour/{id}`, `/api/comptes/{id}/prestations`, `/api/comptes/{id}/cloturer` | Comptes clients (folio) |
| GET/POST | `/api/bons-repas`, `/api/bons-repas/utiliser/{code}`, `/api/bons-repas/{id}/pdf` | Bons repas |
| GET/POST | `/api/factures`, `/api/factures/sejour/{id}`, `/api/factures/{id}/pdf` | Factures |
| GET/POST | `/api/night-audit/apercu`, `/api/night-audit/cloturer`, `/api/night-audit/main-courante` | Night audit |
| GET/POST | `/api/gouvernantes` | Gouvernantes (rôle GOUVERNANTE / FEMME_DE_CHAMBRE) |
| GET/POST | `/api/housekeeping/etat-chambres`, `/api/housekeeping/{id}/etat-menage` | État des chambres |
| GET | `/api/housekeeping/planning-gouvernante` | Planning gouvernante (par étage/type, départ/recouché/arrivée) |
| GET | `/api/housekeeping/planning-occupation?date=` | Planning d'occupation **matriciel** (étages × chambres, situation unique, sans client) |
| GET/POST | `/api/housekeeping/problemes`, `/api/housekeeping/problemes/{id}/statut` | Problèmes techniques |
| GET | `/api/reports/ventes?from=&to=` | Rapport des ventes |

---

## 🐳 Déploiement Docker (PostgreSQL)

```powershell
docker compose up --build
```

- Backend : http://localhost:9090 (profil `prod`, PostgreSQL)
- Frontend : http://localhost:4200

---

## 🗂️ Structure du projet

```
03-hotel-v2/
├── backend/                     # Spring Boot (com.softappeng.hotelv2)
│   └── src/main/java/com/softappeng/hotelv2/
│       ├── entities/            # Domaine (Chambre, Reservation, Produit, Commande, Vente, TicketRepas…)
│       ├── repositories/        # Spring Data JPA
│       ├── service/             # Logique métier (PosService, CommandeService, TicketService…)
│       ├── controller/          # API REST
│       ├── security/            # JWT + rôles
│       ├── dto/                 # Objets de requête
│       └── config/              # DataSeeder (données de démo), CORS, Jackson
├── frontend/                    # Angular 14 + NobleUI
│   └── src/app/
│       ├── core/services/       # AuthService, ApiService
│       ├── core/interceptors/   # JwtInterceptor
│       ├── core/guard/          # AuthGuard
│       └── views/pages/gestion/ # Nouveaux écrans (dashboard, hôtel, resto, POS, tickets…)
├── docker-compose.yml
├── PLAN.md                      # Plan de travail
└── ROADMAP.md                   # Feuille de route
```

---

## 📚 Documentation

- [`PLAN.md`](./PLAN.md) — plan de travail détaillé
- [`ROADMAP.md`](./ROADMAP.md) — feuille de route par phases
