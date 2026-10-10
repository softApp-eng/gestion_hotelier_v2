package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VenteRepo extends JpaRepository<Vente, Long> {
    List<Vente> findBySessionCaisseId(Long sessionCaisseId);
    List<Vente> findByDateVenteBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(v.total),0) FROM Vente v WHERE v.dateVente BETWEEN :start AND :end AND v.statut <> 'ANNULEE'")
    double sumTotalBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(v) FROM Vente v WHERE v.dateVente BETWEEN :start AND :end AND v.statut <> 'ANNULEE'")
    long countBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(v.total),0) FROM Vente v WHERE v.sessionCaisse.id = :sessionId AND v.statut <> 'ANNULEE'")
    double sumBySession(@Param("sessionId") Long sessionId);
}
