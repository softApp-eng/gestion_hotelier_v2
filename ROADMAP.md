# 🗺️ Feuille de route — Gestion Hôtel V2

> Légende : ✅ livré · 🚧 en cours · ⏳ planifié

## Phase 1 — MVP (Semaine 1-2) ✅
**Objectif : disposer d'une application testable couvrant le cœur métier.**

- ✅ Socle Spring Boot + sécurité JWT/rôles + données de démo (H2)
- ✅ Hôtel : chambres, clients, réservations, check-in/out
- ✅ Restaurant : menus, tables, commandes, encaissement
- ✅ POS : caisse (ouverture/clôture), ventes, multi-paiement, ticket imprimable
- ✅ Tickets repas : création, contrôle par code, PDF + QR, annulation
- ✅ Dashboard, rapports, export CSV, gestion des utilisateurs
- ✅ Frontend Angular intégré (navigation, auth, écrans métier)

## Phase 2 — Consolidation & UX (Semaine 3-4) ⏳
- ⏳ Tests end-to-end (Playwright/Cypress) sur les parcours caisse & restaurant
- ⏳ Allègement du frontend : purge des écrans de démo, bundle < 2 Mo
- ⏳ Thème sombre + personnalisation couleurs/logo par établissement
- ⏳ Multi-langue (FR/EN/AR) + RTL
- ⏳ Impression thermique 58/80 mm (templates)
- ⏳ Raccourcis clavier POS (F2 payer, F3 remise, etc.)

## Phase 3 — Robustesse exploitation (Semaine 5-6) ⏳
- ⏳ Mode hors-ligne caisse (file locale + synchronisation)
- ⏳ Journal d'audit (actions sensibles : annulations, remises, clôtures)
- ⏳ Sauvegardes automatiques PostgreSQL + supervision (healthchecks)
- ⏳ Permissions fines (au-delà des rôles)
- ⏳ Notifications (stock faible, incohérence de caisse)

## Phase 4 — Gestion avancée (Semaine 7-10) ⏳
- ⏳ Housekeeping (états de ménage, planning)
- ⏳ Tarification dynamique (saison, durée, promotions)
- ⏳ Facturation hôtel complète (factures, TVA, acomptes) + PDF
- ⏳ Gestion de stock & inventaire (approvisionnements, alertes)
- ⏳ Paiements en ligne (PSP) et terminaux de paiement
- ⏳ Réservations en ligne (portail client)

## Phase 5 — Intégrations & pilotage (Semaine 11+) ⏳
- ⏳ Connexion Channel Manager / OTAs (Booking, Expedia)
- ⏳ Comptabilité (export SAGE / PCG)
- ⏳ BI & rapports avancés (RevPAR, ADR, taux de remplissage par période)
- ⏳ Application mobile (PWA) pour le personnel
- ⏳ Multi-établissement (multi-tenant)

## Indicateurs de succès (KPI)
| Indicateur | Cible |
|---|---|
| Temps d'encaissement d'une vente POS | < 15 secondes |
| Temps de prise d'une commande restaurant | < 30 secondes |
| Création + impression d'un ticket repas | < 10 secondes |
| Taille du bundle frontend initial | < 2 Mo |
| Démarrage backend (profil démo) | < 15 secondes |
| Couverture tests backend | > 60 % (Phase 2) |
