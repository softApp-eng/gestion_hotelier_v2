package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Meal ticket (bon de repas).
 * typeRepas: PETIT_DEJEUNER, DEJEUNER, DINER.
 * statut: VALIDE, UTILISE, ANNULE, EXPIRE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRepas extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numero;

    /** Unique verification code (also encoded in the QR code). */
    @Column(unique = true)
    private String code;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    /** Free text beneficiary when there is no linked customer. */
    private String beneficiaire;

    private String typeRepas = "DEJEUNER";

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateRepas;

    private int nbPersonnes = 1;

    private double montant = 0;

    private String statut = "VALIDE";

    private String observation;

    private String createdBy;

    private boolean imprime = false;

    private LocalDateTime dateUtilisation;
}
