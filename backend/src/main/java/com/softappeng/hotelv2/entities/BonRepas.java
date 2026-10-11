package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Guest meal voucher (bon repas) linked to a stay/folio.
 * Creating a bon automatically posts a BON_REPAS line on the guest account.
 * typeRepas: PETIT_DEJEUNER, DEJEUNER, DINER.
 * statut: VALIDE, UTILISE, ANNULE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BonRepas extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numero;

    /** Unique verification code (also encoded in the QR). */
    @Column(unique = true)
    private String code;

    @ManyToOne
    @JoinColumn(name = "compte_id")
    private CompteClient compte;

    @ManyToOne
    @JoinColumn(name = "sejour_id")
    private Sejour sejour;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private String beneficiaire;

    private String typeRepas = "DEJEUNER";

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateRepas;

    private int nbPersonnes = 1;

    private double montant = 0;

    private String statut = "VALIDE";

    private String observation;

    private String createdBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateUtilisation;
}
