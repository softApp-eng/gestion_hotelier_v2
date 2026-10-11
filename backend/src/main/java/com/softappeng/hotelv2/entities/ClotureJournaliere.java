package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Night audit: daily closing snapshot (caisse + occupancy + turnover).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClotureJournaliere extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCloture;

    private double totalEncaisse;

    private double totalEspeces;

    private double totalAutres;

    private double totalHebergement;

    private double totalRestauration;

    private int nbArrivees;

    private int nbDeparts;

    private int nbEnCours;

    private int totalChambres;

    private int chambresOccupees;

    private double tauxOccupation;

    private String statut = "CLOTUREE";

    private String utilisateur;

    private String observation;
}
