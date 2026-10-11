package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.TourMenage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TourMenageRepo extends JpaRepository<TourMenage, Long> {

    List<TourMenage> findByDateBetween(LocalDate debut, LocalDate fin);

    List<TourMenage> findByGouvernanteIdAndDateBetween(Long gouvernanteId, LocalDate debut, LocalDate fin);

    Optional<TourMenage> findByGouvernanteIdAndDate(Long gouvernanteId, LocalDate date);
}
