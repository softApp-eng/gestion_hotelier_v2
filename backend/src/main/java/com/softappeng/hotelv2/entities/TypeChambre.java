package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Room category (Simple, Double, Suite...).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeChambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle;

    private String description;

    private int capacite = 2;

    private double prixBase;
}
