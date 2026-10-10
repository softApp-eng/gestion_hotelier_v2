package com.softappeng.hotelv2.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Customer category used for pricing (tariff grid).
 * Examples: officier supérieur, officier subalterne, gendarmerie,
 * gendarmerie générale, client civil, invité autorisé, délégation.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorieClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String libelle;

    private int ordre = 0;
}
