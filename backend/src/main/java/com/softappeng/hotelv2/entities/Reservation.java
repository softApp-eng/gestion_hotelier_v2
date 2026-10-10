package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Room reservation.
 * statut: EN_ATTENTE, CONFIRMEE, EN_COURS, TERMINEE, ANNULEE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "chambre_id")
    private Chambre chambre;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateArrivee;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDepart;

    private int nbPersonnes = 1;

    private String statut = "CONFIRMEE";

    private double montantPrevu;

    private String observation;
}
