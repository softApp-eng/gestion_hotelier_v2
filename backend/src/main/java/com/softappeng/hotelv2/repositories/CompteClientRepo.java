package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.CompteClient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompteClientRepo extends JpaRepository<CompteClient, Long> {

    Optional<CompteClient> findBySejourId(Long sejourId);

    Optional<CompteClient> findByNumero(String numero);

    List<CompteClient> findByStatutOrderByDateOuvertureDesc(String statut);

    List<CompteClient> findAllByOrderByDateOuvertureDesc();
}
