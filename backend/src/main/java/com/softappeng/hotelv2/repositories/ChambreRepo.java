package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Chambre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChambreRepo extends JpaRepository<Chambre, Long> {
    Optional<Chambre> findByNumero(String numero);
    List<Chambre> findByEtat(String etat);
    List<Chambre> findByTypeChambreId(Long typeChambreId);
}
