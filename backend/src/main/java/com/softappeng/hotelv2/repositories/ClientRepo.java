package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClientRepo extends JpaRepository<Client, Long> {

    List<Client> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(String nom, String prenom);

    @Query("""
            SELECT c FROM Client c
            WHERE (:q IS NULL OR LOWER(c.nom) LIKE LOWER(CONCAT('%', :q, '%'))
                            OR LOWER(c.prenom) LIKE LOWER(CONCAT('%', :q, '%'))
                            OR c.telephone LIKE CONCAT('%', :q, '%')
                            OR c.cin LIKE CONCAT('%', :q, '%'))
            """)
    Page<Client> search(@Param("q") String q, Pageable pageable);

    long countByBlacklistTrue();
}
