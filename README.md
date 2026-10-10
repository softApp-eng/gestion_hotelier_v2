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
| **Hôtel** | Chambres (CRUD + états + types), Réservations (anti double-réservation), Check-in/Check-out, Clients |
| **Restaurant** | Plan de salle interactif, prise de commande, encaissement, gestion menu/produits/catégories |
| **Point de vente (POS)** | Grille produits tactile, panier, remise, multi-paiement, ouverture/clôture de caisse, ticket imprimable |
| **Tickets repas** | Création (auto-numérotée + code unique), contrôle d'accès par code/scan, impression **PDF + QR**, annulation |
| **Rapports** | CA 7 jours, ventes par période, export **CSV** |
| **Utilisateurs & rôles** | Gestion des comptes (ADMIN), rôles RECEPTION / SERVEUR / CAISSIER / MANAGER / ADMIN |

---

## 🔌 API REST (extrait)

| Méthode | Endpoint | Rôle |
|---|---|---|
| POST | `/api/auth/login` | Authentification (JWT) |
| GET | `/api/reports/dashboard` | Données du tableau de bord |
| GET/POST/PUT | `/api/clients` | Clients |
| GET/POST/PUT/PATCH | `/api/chambres`, `/api/chambres/types` | Chambres & types |
| GET/POST/PUT | `/api/reservations` | Réservations |
| POST | `/api/sejours/checkin/{id}`, `/api/sejours/{id}/checkout` | Check-in / Check-out |
| GET/POST | `/api/menu/categories`, `/api/menu/produits` | Menu |
| GET/POST | `/api/tables` | Tables |
| GET/POST | `/api/resto/commandes`, `/api/resto/commandes/{id}/payer` | Commandes restaurant |
| GET/POST | `/api/pos/session`, `/api/pos/session/open`, `/api/pos/ventes` | Caisse & ventes |
| GET/POST | `/api/tickets`, `/api/tickets/{code}/utiliser`, `/api/tickets/{id}/pdf` | Tickets repas |
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
