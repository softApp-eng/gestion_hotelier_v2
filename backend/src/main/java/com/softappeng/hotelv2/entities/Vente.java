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
 * A sale ticket at the point of sale.
 * typeVente: POS, RESTAURANT, HOTEL.
 * statut: PAYEE, ANNULEE, CREDIT.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vente extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numero;

    @ManyToOne
    @JoinColumn(name = "session_caisse_id")
    private SessionCaisse sessionCaisse;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private String utilisateur;

    private double sousTotal = 0;

    private double remise = 0;

    private double total = 0;

    private double montantPaye = 0;

    private double monnaie = 0;

    private String typeVente = "POS";

    private String statut = "PAYEE";

    private String chambre;

    private String note;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateVente;

    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneVente> lignes = new ArrayList<>();

    @OneToMany(mappedBy = "vente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Paiement> paiements = new ArrayList<>();

    // Comma separated "MODE:montant" summary for quick display
    private String modesPaiement;
}
