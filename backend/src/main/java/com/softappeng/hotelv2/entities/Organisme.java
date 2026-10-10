package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Paying organisation for "prise en charge" (PEC) stays:
 * Armée, Gendarmerie, Délégation...
 * type is one of: ARMEE, GENDARMERIE, DELEGATION, AUTRE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organisme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String type = "AUTRE";

    private String telephone;

    private String adresse;

    private boolean actif = true;
}
