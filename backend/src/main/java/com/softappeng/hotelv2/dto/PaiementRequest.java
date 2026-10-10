package com.softappeng.hotelv2.dto;

import lombok.Data;

@Data
public class PaiementRequest {
    private String mode = "ESPECES";
    private double montant;
    private String reference;
}
