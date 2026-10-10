package com.softappeng.hotelv2.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Hotel / restaurant customer. {@code typeClient} is a free label
 * (MILITAIRE, ETRANGER, STANDARD, SOCIETE...).
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Client extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String prenom;
    private String email;
    private String telephone;
    private String nationalite;

    @Column(unique = true)
    private String cin;

    private String passeport;
    private String adresse;

    private String typeClient = "STANDARD";

    private boolean blacklist = false;

    private boolean vip = false;

    private String observation;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    @ManyToOne
    @JoinColumn(name = "categorie_client_id")
    private CategorieClient categorieClient;

    public String getNomComplet() {
        return (nom == null ? "" : nom) + " " + (prenom == null ? "" : prenom);
    }
}
