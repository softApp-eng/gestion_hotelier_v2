package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Organisme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganismeRepo extends JpaRepository<Organisme, Long> {
    List<Organisme> findByActifTrue();
}
