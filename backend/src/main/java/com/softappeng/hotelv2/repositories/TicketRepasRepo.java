package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.TicketRepas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TicketRepasRepo extends JpaRepository<TicketRepas, Long> {
    Optional<TicketRepas> findByCode(String code);
    List<TicketRepas> findByStatut(String statut);
    List<TicketRepas> findByDateRepas(LocalDate date);
    long countByDateRepasAndStatut(LocalDate date, String statut);
}
