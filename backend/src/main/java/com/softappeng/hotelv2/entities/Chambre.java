package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Physical room. {@code etat} is one of:
 * LIBRE, OCCUPEE, NETTOYAGE, HORS_SERVICE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    private String etage;

    @Column(nullable = false)
    private String etat = "LIBRE";

    private double prix;

    @ManyToOne
    @JoinColumn(name = "type_chambre_id")
    private TypeChambre typeChambre;
}
