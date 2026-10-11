import { MenuItem } from './menu.model';

/**
 * Hotel V2 navigation menu.
 * Links point to the new `gestion` feature module.
 */
export const MENU: MenuItem[] = [
  {
    label: 'Pilotage',
    isTitle: true
  },
  {
    label: 'Tableau de bord',
    icon: 'fa-solid fa-gauge-high',
    link: '/gestion/dashboard'
  },
  {
    label: 'Hôtellerie',
    isTitle: true
  },
  {
    label: 'Hôtel',
    icon: 'fa-solid fa-hotel',
    subItems: [
      { label: 'Chambres', link: '/gestion/chambres' },
      { label: 'Réservations', link: '/gestion/reservations' },
      { label: 'Check-in / Séjours', link: '/gestion/sejours' },
      { label: 'Clients', link: '/gestion/clients' }
    ]
  },
  {
    label: 'Planning',
    icon: 'fa-solid fa-calendar-days',
    subItems: [
      { label: 'Planning des chambres', link: '/gestion/planning' },
      { label: 'État journalier', link: '/gestion/etat-journalier' }
    ]
  },
  {
    label: 'Réception & Encaissement',
    icon: 'fa-solid fa-wallet',
    subItems: [
      { label: 'Comptes clients (folio)', link: '/gestion/comptes' },
      { label: 'Bons repas', link: '/gestion/bons-repas' },
      { label: 'Factures', link: '/gestion/factures' },
      { label: 'Night Audit', link: '/gestion/night-audit' }
    ]
  },
  {
    label: 'Restauration',
    isTitle: true
  },
  {
    label: 'Restaurant',
    icon: 'fa-solid fa-utensils',
    subItems: [
      { label: 'Plan de salle & Commandes', link: '/gestion/restaurant/tables' },
      { label: 'Commandes ouvertes', link: '/gestion/restaurant/commandes' },
      { label: 'Menu & Produits', link: '/gestion/restaurant/menu' }
    ]
  },
  {
    label: 'Point de vente',
    icon: 'fa-solid fa-cash-register',
    subItems: [
      { label: 'Caisse & Ventes', link: '/gestion/pos/caisse' },
      { label: 'Tickets repas', link: '/gestion/pos/tickets' }
    ]
  },
  {
    label: 'Configuration',
    isTitle: true
  },
  {
    label: 'Paramètres hôtel',
    icon: 'fa-solid fa-sliders',
    subItems: [
      { label: 'Pavillons', link: '/gestion/config/pavillons' },
      { label: 'Catégories clients', link: '/gestion/config/categories-clients' },
      { label: 'Grille tarifaire', link: '/gestion/config/tarifs' },
      { label: 'Organismes (PEC)', link: '/gestion/config/organismes' }
    ]
  },
  {
    label: 'Administration',
    isTitle: true
  },
  {
    label: 'Rapports',
    icon: 'fa-solid fa-chart-line',
    link: '/gestion/rapports'
  },
  {
    label: 'Utilisateurs',
    icon: 'fa-solid fa-users-gear',
    link: '/gestion/utilisateurs'
  }
];
