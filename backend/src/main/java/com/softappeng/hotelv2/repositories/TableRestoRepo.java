package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.TableResto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TableRestoRepo extends JpaRepository<TableResto, Long> {
    Optional<TableResto> findByNumero(String numero);
}
