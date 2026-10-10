package com.softappeng.hotelv2.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PaiementCommandeRequest {
    private double remise = 0;
    private double montantPaye = 0;
    private String typeVente = "RESTAURANT";
    private List<PaiementRequest> paiements = new ArrayList<>();
}
