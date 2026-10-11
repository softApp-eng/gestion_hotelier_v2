package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Gouvernante;
import com.softappeng.hotelv2.repositories.GouvernanteRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GouvernanteService {

    private final GouvernanteRepo gouvernanteRepo;

    public List<Gouvernante> findAll(boolean actifsSeulement) {
        return actifsSeulement ? gouvernanteRepo.findByActifTrueOrderByNomAsc()
                : gouvernanteRepo.findAllByOrderByNomAsc();
    }

    public List<Gouvernante> byPavillon(Long pavillonId) {
        return gouvernanteRepo.findByPavillonIdOrderByNomAsc(pavillonId);
    }

    public Gouvernante findById(Long id) {
        return gouvernanteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gouvernante introuvable: " + id));
    }

    public Gouvernante save(Gouvernante g) {
        return gouvernanteRepo.save(g);
    }

    public void delete(Long id) {
        gouvernanteRepo.deleteById(id);
    }
}
