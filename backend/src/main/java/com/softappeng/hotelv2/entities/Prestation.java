package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A posting on a guest folio.
 * type: HEBERGEMENT, RESTAURANT, BON_REPAS, DIVERS.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prestation extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "compte_id")
    @JsonIgnore
    private CompteClient compte;

    /** HEBERGEMENT, RESTAURANT, BON_REPAS, DIVERS. */
    private String type;

    private String libelle;

    private int quantite = 1;

    private double prixUnitaire;

    private double montant;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateHeure;

    private String reference;

    private String utilisateur;
}
