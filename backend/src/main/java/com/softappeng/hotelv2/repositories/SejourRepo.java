package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Sejour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SejourRepo extends JpaRepository<Sejour, Long> {
    List<Sejour> findByStatut(String statut);
    List<Sejour> findByChambreIdAndStatut(Long chambreId, String statut);
    long countByStatut(String statut);

    /**
     * Flexible search used by the "Séjours" screen filters:
     * check-in date range, check-out date range, status and room number.
     */
    @Query("""
            SELECT s FROM Sejour s
            WHERE (:checkinFrom IS NULL OR s.dateCheckin >= :checkinFrom)
              AND (:checkinTo   IS NULL OR s.dateCheckin <= :checkinTo)
              AND (:checkoutFrom IS NULL OR s.dateCheckout >= :checkoutFrom)
              AND (:checkoutTo   IS NULL OR s.dateCheckout <= :checkoutTo)
              AND (:statut IS NULL OR s.statut = :statut)
              AND (:numero IS NULL OR s.chambre.numero = :numero)
            ORDER BY s.dateCheckin DESC
            """)
    List<Sejour> search(@Param("checkinFrom") LocalDateTime checkinFrom,
                        @Param("checkinTo") LocalDateTime checkinTo,
                        @Param("checkoutFrom") LocalDateTime checkoutFrom,
                        @Param("checkoutTo") LocalDateTime checkoutTo,
                        @Param("statut") String statut,
                        @Param("numero") String numero);

    /** Stays currently in-house or scheduled to cover the given date. */
    @Query("""
            SELECT s FROM Sejour s
            WHERE s.statut = 'EN_COURS'
              AND s.dateCheckin <= :end
              AND (s.dateCheckout IS NULL OR s.dateCheckout >= :start)
            """)
    List<Sejour> findOccupyingBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
