package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Actual stay created by a check-in.
 * statut: EN_COURS, TERMINE.
 * modePaiement: TPE, ESPECES, PRISE_EN_CHARGE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sejour extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "chambre_id")
    private Chambre chambre;

    @ManyToOne
    @JoinColumn(name = "pavillon_id")
    private Pavillon pavillon;

    @ManyToOne
    @JoinColumn(name = "categorie_client_id")
    private CategorieClient categorieClient;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCheckin;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCheckout;

    /** Planned departure date (used for planning / filters). */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDepartPrevue;

    private String statut = "EN_COURS";

    private double montant = 0;

    private double tarifNuitee;

    private String accompagnants;

    private String modePaiement = "ESPECES";

    @ManyToOne
    @JoinColumn(name = "organisme_id")
    private Organisme organisme;

    private String referencePec;

    private String observation;
}
