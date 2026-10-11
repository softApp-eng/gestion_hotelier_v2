package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Gouvernante;
import com.softappeng.hotelv2.entities.Pavillon;
import com.softappeng.hotelv2.entities.TypeChambre;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.GouvernanteRepo;
import com.softappeng.hotelv2.repositories.PavillonRepo;
import com.softappeng.hotelv2.repositories.TypeChambreRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChambreService {

    private final ChambreRepo chambreRepo;
    private final TypeChambreRepo typeChambreRepo;
    private final PavillonRepo pavillonRepo;
    private final GouvernanteRepo gouvernanteRepo;

    // ---- Rooms ----
    public List<Chambre> findAll() {
        return chambreRepo.findAll();
    }

    public Chambre findById(Long id) {
        return chambreRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Chambre introuvable: " + id));
    }

    public Chambre save(Chambre chambre) {
        if (chambre.getTypeChambre() != null && chambre.getTypeChambre().getId() != null) {
            TypeChambre t = typeChambreRepo.findById(chambre.getTypeChambre().getId()).orElse(null);
            chambre.setTypeChambre(t);
        } else {
            chambre.setTypeChambre(null);
        }
        if (chambre.getPavillon() != null && chambre.getPavillon().getId() != null) {
            Pavillon p = pavillonRepo.findById(chambre.getPavillon().getId()).orElse(null);
            chambre.setPavillon(p);
        } else {
            chambre.setPavillon(null);
        }
        if (chambre.getGouvernante() != null && chambre.getGouvernante().getId() != null) {
            Gouvernante g = gouvernanteRepo.findById(chambre.getGouvernante().getId()).orElse(null);
            chambre.setGouvernante(g);
        } else {
            chambre.setGouvernante(null);
        }
        return chambreRepo.save(chambre);
    }

    public Chambre changeEtat(Long id, String etat) {
        Chambre c = findById(id);
        c.setEtat(etat);
        return chambreRepo.save(c);
    }

    public void delete(Long id) {
        chambreRepo.deleteById(id);
    }

    // ---- Room types ----
    public List<TypeChambre> findAllTypes() {
        return typeChambreRepo.findAll();
    }

    public TypeChambre saveType(TypeChambre type) {
        return typeChambreRepo.save(type);
    }

    public void deleteType(Long id) {
        typeChambreRepo.deleteById(id);
    }
}
