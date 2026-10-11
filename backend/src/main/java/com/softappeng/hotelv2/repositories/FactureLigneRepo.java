package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.FactureLigne;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FactureLigneRepo extends JpaRepository<FactureLigne, Long> {
    List<FactureLigne> findByFactureId(Long factureId);
}
