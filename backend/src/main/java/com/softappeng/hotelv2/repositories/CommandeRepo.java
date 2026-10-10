package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Commande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandeRepo extends JpaRepository<Commande, Long> {
    List<Commande> findByStatut(String statut);
    List<Commande> findByTableIdAndStatut(Long tableId, String statut);
    List<Commande> findByStatutIn(List<String> statuts);
}
