package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Pavillon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PavillonRepo extends JpaRepository<Pavillon, Long> {
    Optional<Pavillon> findByCode(String code);
    List<Pavillon> findByActifTrue();
}
