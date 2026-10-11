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
 * Guest folio (compte client) opened at check-in.
 * statut: OUVERT, CLOTURE.
 * Turndown: all consumptions (nights, meals, extras) are postings (Prestation)
 * attached to this account until the stay is invoiced at checkout.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompteClient extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numero;

    @OneToOne
    @JoinColumn(name = "sejour_id")
    private Sejour sejour;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateOuverture;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCloture;

    private String statut = "OUVERT";

    private double total = 0;

    private String observation;

    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Prestation> prestations = new ArrayList<>();
}
