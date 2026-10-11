package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Technical problem reported for a room (plomberie, électricité, climatisation...).
 * priorite: BASSE, MOYENNE, HAUTE.
 * statut: SIGNALE, EN_COURS, RESOLU.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemeTechnique extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chambre_id")
    private Chambre chambre;

    private String description;

    private String priorite = "MOYENNE";

    private String statut = "SIGNALE";

    private String signalePar;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateSignalement;

    private String resoluPar;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateResolution;

    private String resolution;
}
