package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.ProblemeTechnique;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemeTechniqueRepo extends JpaRepository<ProblemeTechnique, Long> {

    List<ProblemeTechnique> findAllByOrderByDateSignalementDesc();

    List<ProblemeTechnique> findByStatutOrderByDateSignalementDesc(String statut);

    List<ProblemeTechnique> findByChambreIdOrderByDateSignalementDesc(Long chambreId);

    long countByStatut(String statut);
}
