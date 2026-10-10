package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Organisme;
import com.softappeng.hotelv2.repositories.OrganismeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganismeService {

    private final OrganismeRepo organismeRepo;

    public List<Organisme> findAll() {
        return organismeRepo.findAll();
    }

    public Organisme findById(Long id) {
        return organismeRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Organisme introuvable: " + id));
    }

    public Organisme save(Organisme o) {
        return organismeRepo.save(o);
    }

    public void delete(Long id) {
        organismeRepo.deleteById(id);
    }
}
