package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.CategorieMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategorieMenuRepo extends JpaRepository<CategorieMenu, Long> {
    List<CategorieMenu> findAllByOrderByOrdreAsc();
}
