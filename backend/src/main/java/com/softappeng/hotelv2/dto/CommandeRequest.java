package com.softappeng.hotelv2.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CommandeRequest {
    private Long id;         // null => create
    private Long tableId;
    private String serveur;
    private String chambre;
    private String note;
    private List<LigneRequest> lignes = new ArrayList<>();
}
