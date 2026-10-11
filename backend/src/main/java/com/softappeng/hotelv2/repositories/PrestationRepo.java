package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Prestation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PrestationRepo extends JpaRepository<Prestation, Long> {

    List<Prestation> findByCompteIdOrderByDateHeureAsc(Long compteId);

    boolean existsByCompteIdAndType(Long compteId, String type);

    List<Prestation> findByDateHeureBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.montant),0) FROM Prestation p WHERE p.compte.id = :compteId")
    double sumMontantByCompte(@Param("compteId") Long compteId);
}
