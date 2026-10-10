package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Menu category (Entrées, Plats, Desserts, Boissons...).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorieMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private int ordre = 0;

    private String icon;
}
