package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Restaurant table.
 * statut: LIBRE, OCCUPEE, RESERVEE.
 */
@Entity
@Table(name = "table_resto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableResto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    private int capacite = 4;

    private String zone = "Salle";

    private String statut = "LIBRE";
}
