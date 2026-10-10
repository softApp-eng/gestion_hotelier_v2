package com.softappeng.hotelv2.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class VenteRequest {
    private Long clientId;
    private String typeVente = "POS"; // POS, RESTAURANT, HOTEL
    private String chambre;
    private String note;
    private double remise = 0;
    private double montantPaye = 0;
    private List<LigneRequest> lignes = new ArrayList<>();
    private List<PaiementRequest> paiements = new ArrayList<>();
}
