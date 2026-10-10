package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.SessionCaisse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionCaisseRepo extends JpaRepository<SessionCaisse, Long> {
    Optional<SessionCaisse> findFirstByStatutOrderByDateOuvertureDesc(String statut);
}
