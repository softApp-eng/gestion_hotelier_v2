package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Chambre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChambreRepo extends JpaRepository<Chambre, Long> {
    List<Chambre> findByNumero(String numero);
    Optional<Chambre> findByPavillonIdAndNumero(Long pavillonId, String numero);
    List<Chambre> findByEtat(String etat);
    List<Chambre> findByTypeChambreId(Long typeChambreId);
    List<Chambre> findByPavillonId(Long pavillonId);
    List<Chambre> findAllByOrderByNumeroAsc();
}
