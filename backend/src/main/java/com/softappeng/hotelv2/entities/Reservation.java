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
 * modePaiement: TPE, ESPECES, PRISE_EN_CHARGE.
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

    @ManyToOne
    @JoinColumn(name = "pavillon_id")
    private Pavillon pavillon;

    @ManyToOne
    @JoinColumn(name = "categorie_client_id")
    private CategorieClient categorieClient;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateArrivee;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDepart;

    private int nbPersonnes = 1;

    /** Accompanying persons (family of an officer, delegation members...). */
    private String accompagnants;

    /** TPE, ESPECES, PRISE_EN_CHARGE. */
    private String modePaiement = "ESPECES";

    @ManyToOne
    @JoinColumn(name = "organisme_id")
    private Organisme organisme;

    private String referencePec;

    /** Applied nightly tariff (from the tariff grid), when resolved. */
    private double tarifNuitee;

    private String statut = "CONFIRMEE";

    private double montantPrevu;

    private String observation;
}
