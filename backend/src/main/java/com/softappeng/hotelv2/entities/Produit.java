package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Sellable item used both by the restaurant and the point of sale.
 * type: MENU, BOISSON, SUPPLEMENT, SERVICE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produit extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String description;

    @Column(nullable = false)
    private double prix;

    private double coutRevient = 0;

    private String type = "MENU";

    private boolean disponible = true;

    private String imageUrl;

    private String code;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private CategorieMenu categorie;
}
