package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A line on an invoice. categorie: HEBERGEMENT, SUBSISTANCE, DIVERS.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureLigne extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facture_id")
    @JsonIgnore
    private Facture facture;

    private String categorie;

    private String libelle;

    private int quantite = 1;

    private double prixUnitaire;

    private double montant;
}
