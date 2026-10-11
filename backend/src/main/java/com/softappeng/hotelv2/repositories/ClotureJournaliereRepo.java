package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.ClotureJournaliere;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ClotureJournaliereRepo extends JpaRepository<ClotureJournaliere, Long> {

    Optional<ClotureJournaliere> findByDate(LocalDate date);

    Optional<ClotureJournaliere> findTopByOrderByDateDesc();
}
