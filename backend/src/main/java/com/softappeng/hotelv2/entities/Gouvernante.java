package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Housekeeping staff member (femme de chambre / gouvernante).
 * Parametrable list managed from the Configuration screen.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Gouvernante extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String prenom;

    private String telephone;

    @ManyToOne
    @JoinColumn(name = "pavillon_id")
    private Pavillon pavillon;

    private boolean actif = true;

    private String observation;
}
