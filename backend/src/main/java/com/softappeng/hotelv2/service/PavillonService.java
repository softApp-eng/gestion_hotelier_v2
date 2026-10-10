package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Pavillon;
import com.softappeng.hotelv2.repositories.PavillonRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PavillonService {

    private final PavillonRepo pavillonRepo;

    public List<Pavillon> findAll() {
        return pavillonRepo.findAll();
    }

    public Pavillon findById(Long id) {
        return pavillonRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Pavillon introuvable: " + id));
    }

    public Pavillon save(Pavillon p) {
        return pavillonRepo.save(p);
    }

    public void delete(Long id) {
        pavillonRepo.deleteById(id);
    }
}
