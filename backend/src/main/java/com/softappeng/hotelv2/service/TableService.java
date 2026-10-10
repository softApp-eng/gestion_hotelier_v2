package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.TableResto;
import com.softappeng.hotelv2.repositories.TableRestoRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRestoRepo tableRepo;

    public List<TableResto> findAll() {
        return tableRepo.findAll();
    }

    public TableResto findById(Long id) {
        return tableRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Table introuvable: " + id));
    }

    public TableResto save(TableResto t) {
        return tableRepo.save(t);
    }

    public TableResto changeStatut(Long id, String statut) {
        TableResto t = findById(id);
        t.setStatut(statut);
        return tableRepo.save(t);
    }

    public void delete(Long id) {
        tableRepo.deleteById(id);
    }
}
