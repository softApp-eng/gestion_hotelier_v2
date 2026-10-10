package com.softappeng.hotelv2.dto;

import lombok.Data;

/** A line sent by the restaurant order screen or the POS. */
@Data
public class LigneRequest {
    private Long produitId;
    private String libelle;
    private int quantite = 1;
    private Double prixUnitaire; // optional override
    private String note;
}
