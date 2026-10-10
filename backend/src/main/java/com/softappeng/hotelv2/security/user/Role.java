package com.softappeng.hotelv2.security.user;

/**
 * Application roles. A role grants a set of business permissions.
 */
public enum Role {
    ADMIN,        // Full access
    MANAGER,      // Reports, configuration, discounts
    RECEPTION,    // Hotel front-desk (check-in / check-out / reservations)
    SERVEUR,      // Restaurant orders
    CAISSIER      // Point of sale / cash register
}
