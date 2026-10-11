package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Gouvernante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GouvernanteRepo extends JpaRepository<Gouvernante, Long> {

    List<Gouvernante> findAllByOrderByNomAsc();

    List<Gouvernante> findByActifTrueOrderByNomAsc();

    List<Gouvernante> findByPavillonIdOrderByNomAsc(Long pavillonId);
}
