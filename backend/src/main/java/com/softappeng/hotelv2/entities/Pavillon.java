package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Physical pavilion / building that groups rooms.
 * Configurable (create/rename from the UI).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pavillon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String nom;

    private String description;

    private boolean actif = true;
}
