package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Invoice issued at checkout.
 * type: GLOBALE, HEBERGEMENT, SUBSISTANCE.
 *   - Especes / TPE  -> a single GLOBALE invoice
 *   - Prise en charge -> HEBERGEMENT + SUBSISTANCE + GLOBALE (recapitulative)
 * statut: EMISE, PAYEE, ANNULEE.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numero;

    @ManyToOne
    @JoinColumn(name = "sejour_id")
    private Sejour sejour;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private String type = "GLOBALE";

    private String modePaiement = "ESPECES";

    @ManyToOne
    @JoinColumn(name = "organisme_id")
    private Organisme organisme;

    private String referencePec;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateEmission;

    private double totalHebergement;

    private double totalSubsistance;

    private double totalGeneral;

    private String statut = "EMISE";

    private String utilisateur;

    private String observation;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FactureLigne> lignes = new ArrayList<>();
}
