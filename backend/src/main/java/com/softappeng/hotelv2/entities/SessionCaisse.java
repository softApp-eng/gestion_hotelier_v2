package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Cash register session (ouverture / clôture de caisse).
 * statut: OUVERTE, FERMEE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionCaisse extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String utilisateur;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateOuverture;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateFermeture;

    private double montantOuverture = 0;

    /** Theoretical cash amount (opening + cash sales). */
    private double montantTheorique = 0;

    /** Amount physically counted at closing. */
    private double montantCompte = 0;

    private double ecart = 0;

    private double totalVentes = 0;

    private int nbVentes = 0;

    private String statut = "OUVERTE";

    private String observation;
}
