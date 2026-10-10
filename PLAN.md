# 📋 Plan de travail — Gestion Hôtel V2

## 1. Contexte & objectif

Reprendre le socle existant (`api_hotel_cmo` : Spring Boot + Angular 14/NobleUI) pour produire un
**MVP** de gestion hôtelière **léger et flexible**, en y ajoutant :
- la **gestion de restaurant** (menus, tables, commandes) ;
- le **point de vente (POS) + caisse** ;
- la **création de tickets repas** (avec impression PDF/QR) ;
- l'**authentification réelle par rôles**.

Le nouveau projet vit dans `03-hotel-v2/` et **ne modifie pas** le projet d'origine.

## 2. Décisions d'architecture

| Sujet | Choix | Justification |
|---|---|---|
| Style backend | **Monolithe modulaire** (Spring Boot 3.3, Java 17) | Simple à développer/déployer, faible empreinte, découpage clair par domaine |
| Base de données | **H2 mémoire** (profil `demo`) + **PostgreSQL** (profil `prod`) | Test immédiat sans installation ; montée en charge en prod |
| Frontend | **Angular 14 + NobleUI** (shell conservé) | Réutilisation des compétences/du template ; navigation recentrée |
| Auth | **JWT stateless** + rôles (ADMIN/MANAGER/RECEPTION/SERVEUR/CAISSIER) | Sécurité simple et adaptée aux terminaux (caisse, réception, serveur) |
| Tickets | **PDF (OpenPDF) + QR (ZXing)** | Impression thermique/A4 + contrôle d'accès par scan |
| Numérotation | Séquentielle `PREFIXE-AAAAMMJJ-NNNN` | Traçabilité des ventes/tickets |

## 3. Découpage en lots (fonctionnel)

### Lot 0 — Cadrage & socle
- [x] Analyse du projet existant
- [x] Création de l'arborescence `03-hotel-v2/`
- [x] Choix techniques validés
- [x] Backend Spring Boot propre (package `com.softappeng.hotelv2`)

### Lot 1 — Sécurité & socle applicatif
- [x] Entité `User` + rôles
- [x] JWT (génération/vérification) + filtre
- [x] `SecurityConfiguration` (endpoints protégés par rôle)
- [x] `DataSeeder` (données de démo)
- [x] CORS + Jackson + config H2/PostgreSQL

### Lot 2 — Module Hôtel
- [x] Chambres + Types de chambre (CRUD, états : LIBRE/OCCUPEE/NETTOYAGE/HORS_SERVICE)
- [x] Clients (CRUD, recherche, VIP, blacklist)
- [x] Réservations (contrôle de chevauchement, montant auto)
- [x] Check-in (depuis réservation ou direct) / Check-out (libération chambre)

### Lot 3 — Module Restaurant
- [x] Catégories de menu + Produits (CRUD)
- [x] Tables (plan de salle, statuts)
- [x] Commandes (ouverture, lignes, totaux, encaissement, annulation)

### Lot 4 — Point de vente & Caisse
- [x] Session de caisse (ouverture / clôture, écart théorique/compté)
- [x] Ventes (lignes, remise, multi-paiement, monnaie, annulation)
- [x] Ticket de caisse imprimable (navigateur)

### Lot 5 — Tickets repas
- [x] Création (numéro + code unique, montant auto par type)
- [x] Contrôle d'accès par code (validation → `UTILISE`)
- [x] Impression **PDF + QR code**
- [x] Annulation

### Lot 6 — Reporting & administration
- [x] Tableau de bord (CA jour, occupation, commandes, top produits, CA 7 jours)
- [x] Rapport de ventes par période + export CSV
- [x] Gestion des utilisateurs (ADMIN)

### Lot 7 — Frontend Angular
- [x] AuthService + JwtInterceptor + AuthGuard
- [x] Écran de connexion réel
- [x] Module `gestion` (dashboard, hôtel, restaurant, POS, tickets, rapports, utilisateurs)
- [x] Menu de navigation hôtelier recentré
- [x] Déconnexion + affichage de l'utilisateur connecté

### Lot 8 — Livraison & tests
- [x] Jeu de données de démonstration
- [x] Compilation backend + tests des endpoints (flux métier validés)
- [ ] Build frontend + test E2E manuel
- [x] Documentation (README, PLAN, ROADMAP)
- [x] Docker (compose + profils)

## 4. Recommandations « flexibilité, UI/UX, légèreté »

1. **Séparer le noyau et les options** : activer/désactiver Restaurant, POS, Tickets par profil ou *feature flag* selon l'établissement.
2. **UI tactile d'abord** (serveurs/caissiers) : grands boutons, peu de clics, raccourcis clavier pour la caisse.
3. **Thème et langue centralisés** : variables CSS + `ngx-translate` (FR/EN/AR) et sens RTL pour l'arabe.
4. **Alléger progressivement le frontend** : remplacer les écrans de démo NobleUI par les écrans métier, purger les dépendances UI non utilisées (objectif < 2 Mo de bundle initial).
5. **Impressions paramétrables** : largeurs 58/80 mm et A4 ; moteur de template pour les tickets.
6. **Découplage caisse** : API idempotentes + mode « hors-ligne » (file d'attente locale) pour les coupures réseau.
7. **Observabilité** : journal d'audit (qui a encaissé/annulé), exports comptables.
8. **Droits fins** : passer de rôles grossiers à des permissions (`pos.encaisser`, `resto.annuler`…).

## 5. Risques & parades

| Risque | Impact | Parade |
|---|---|---|
| Node 24 vs Angular 14 | Build frontend | `--legacy-peer-deps`, `NODE_OPTIONS=--openssl-legacy-provider`, ou monter Node 18 (nvm) |
| Double réservation | Conflit chambre | Requête de chevauchement + messages d'erreur explicites |
| Écart de caisse | Fidélité comptable | Montant théorique vs compté + écart enregistré |
| Réseau instable (caisse) | Ventes perdues | File locale + rejeu (à planifier, voir roadmap) |
