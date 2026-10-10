package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepo extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStatut(String statut);

    List<Reservation> findByDateArrivee(LocalDate date);

    List<Reservation> findByDateArriveeBetween(LocalDate start, LocalDate end);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.chambre.id = :chambreId
              AND r.statut IN ('CONFIRMEE','EN_ATTENTE','EN_COURS')
              AND (:dateArrivee < r.dateDepart AND :dateDepart > r.dateArrivee)
            """)
    List<Reservation> findOverlapping(@Param("chambreId") Long chambreId,
                                      @Param("dateArrivee") LocalDate dateArrivee,
                                      @Param("dateDepart") LocalDate dateDepart);
}
