package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Physical room. {@code etat} is one of:
 * LIBRE, OCCUPEE, NETTOYAGE, HORS_SERVICE.
 * A room may be temporarily blocked (bloque=true) over a date range.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numero;

    private String etage;

    @Column(nullable = false)
    private String etat = "LIBRE";

    private double prix;

    @ManyToOne
    @JoinColumn(name = "type_chambre_id")
    private TypeChambre typeChambre;

    @ManyToOne
    @JoinColumn(name = "pavillon_id")
    private Pavillon pavillon;

    /** Room temporarily blocked (maintenance / reserved for a delegation...). */
    private boolean bloque = false;

    private String motifBlocage;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate blocageDebut;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate blocageFin;

    /**
     * Housekeeping state: CLEAN, A_VERIFIER, DIRTY, BLOQUEE.
     * Kept separate from {@code etat} (availability) used by the planning.
     */
    private String etatMenage = "A_VERIFIER";

    /** Housekeeper who cleaned / verified the room. */
    @ManyToOne
    @JoinColumn(name = "gouvernante_id")
    private Gouvernante gouvernante;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateVerification;

    private String verifiePar;

    private String observationMenage;
}
