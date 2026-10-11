package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Weekly duty ("tour de la semaine") of a housekeeping staff member.
 * One row = one femme de chambre for one day: the floor she is assigned to,
 * or a rest day ({@code repos = true}).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourMenage extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The femme de chambre / gouvernante assigned. */
    @ManyToOne
    @JoinColumn(name = "gouvernante_id")
    private Gouvernante gouvernante;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    /** Pavillon (recopié depuis l'agent, conservé pour les rapports). */
    @ManyToOne
    @JoinColumn(name = "pavillon_id")
    private Pavillon pavillon;

    /** Assigned floor (e.g. "3"). Null when on rest. */
    private String etage;

    /** Rest / day off. */
    private boolean repos = false;

    private String note;
}
