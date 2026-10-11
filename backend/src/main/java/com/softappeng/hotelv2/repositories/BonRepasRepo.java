package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.BonRepas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BonRepasRepo extends JpaRepository<BonRepas, Long> {

    Optional<BonRepas> findByCode(String code);

    List<BonRepas> findByStatut(String statut);

    List<BonRepas> findBySejourId(Long sejourId);

    List<BonRepas> findByDateRepas(LocalDate date);

    long countByDateRepasAndStatut(LocalDate date, String statut);

    List<BonRepas> findAllByOrderByDateRepasDescIdDesc();
}
