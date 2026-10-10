package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Nightly price for a given (customer category x room type).
 * This is the tariff grid used to compute reservation / stay amounts.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tarif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "categorie_client_id")
    private CategorieClient categorieClient;

    @ManyToOne
    @JoinColumn(name = "type_chambre_id")
    private TypeChambre typeChambre;

    private double prix;
}
