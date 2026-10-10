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
