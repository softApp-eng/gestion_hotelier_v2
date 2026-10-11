package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.CompteClient;
import com.softappeng.hotelv2.entities.Prestation;
import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.repositories.CompteClientRepo;
import com.softappeng.hotelv2.repositories.PrestationRepo;
import com.softappeng.hotelv2.repositories.SejourRepo;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Guest folio (compte client) management: open on check-in, post consumptions
 * (meals, extras, room nights) and close at checkout.
 */
@Service
@RequiredArgsConstructor
public class CompteClientService {

    private final CompteClientRepo compteRepo;
    private final PrestationRepo prestationRepo;
    private final SejourRepo sejourRepo;
    private final NumberService numberService;

    public List<CompteClient> findAll() {
        return compteRepo.findAllByOrderByDateOuvertureDesc();
    }

    public List<CompteClient> ouverts() {
        return compteRepo.findByStatutOrderByDateOuvertureDesc("OUVERT");
    }

    public CompteClient findById(Long id) {
        return compteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Compte introuvable: " + id));
    }

    public CompteClient findBySejour(Long sejourId) {
        return compteRepo.findBySejourId(sejourId).orElse(null);
    }

    public List<Prestation> prestations(Long compteId) {
        return prestationRepo.findByCompteIdOrderByDateHeureAsc(compteId);
    }

    /** Open (or return) the folio attached to a stay. Idempotent. */
    @Transactional
    public CompteClient ouvrir(Sejour s) {
        if (s == null || s.getId() == null) return null;
        return compteRepo.findBySejourId(s.getId()).orElseGet(() -> {
            CompteClient c = new CompteClient();
            c.setNumero(numberService.nextCompte());
            c.setSejour(s);
            c.setClient(s.getClient());
            c.setDateOuverture(LocalDateTime.now());
            c.setStatut("OUVERT");
            return compteRepo.save(c);
        });
    }

    /** Post a line on the folio. */
    @Transactional
    public Prestation ajouterPrestation(Long compteId, Prestation p) {
        CompteClient c = findById(compteId);
        if ("CLOTURE".equals(c.getStatut())) {
            throw new IllegalStateException("Le compte est clôturé, aucune écriture possible");
        }
        p.setCompte(c);
        if (p.getType() == null) p.setType("DIVERS");
        if (p.getQuantite() <= 0) p.setQuantite(1);
        if (p.getPrixUnitaire() == 0 && p.getMontant() != 0) {
            p.setPrixUnitaire(p.getMontant() / p.getQuantite());
        }
        p.setMontant(p.getPrixUnitaire() * p.getQuantite());
        if (p.getDateHeure() == null) p.setDateHeure(LocalDateTime.now());
        p.setUtilisateur(SecurityUtils.currentUsername());
        prestationRepo.save(p);
        recalculer(c);
        return p;
    }

    /**
     * Post the accommodation line for a stay (once). Nights are computed from
     * check-in to checkout (or planned departure), minimum one night.
     */
    @Transactional
    public Prestation ajouterHebergement(Sejour s) {
        if (s == null || s.getId() == null) return null;
        CompteClient c = ouvrir(s);
        if (prestationRepo.existsByCompteIdAndType(c.getId(), "HEBERGEMENT")) {
            return null;
        }
        LocalDate debut = s.getDateCheckin() != null ? s.getDateCheckin().toLocalDate() : LocalDate.now();
        LocalDate fin = s.getDateCheckout() != null ? s.getDateCheckout().toLocalDate()
                : (s.getDateDepartPrevue() != null ? s.getDateDepartPrevue() : LocalDate.now());
        long nuits = Math.max(ChronoUnit.DAYS.between(debut, fin), 1);

        Prestation p = new Prestation();
        p.setType("HEBERGEMENT");
        p.setLibelle("Hébergement chambre " + (s.getChambre() != null ? s.getChambre().getNumero() : "-")
                + " — " + nuits + " nuit(s)");
        p.setQuantite((int) nuits);
        p.setPrixUnitaire(s.getTarifNuitee());
        p.setReference("HEB-" + s.getId());
        return ajouterPrestation(c.getId(), p);
    }

    @Transactional
    public CompteClient recalculer(CompteClient c) {
        c.setTotal(prestationRepo.sumMontantByCompte(c.getId()));
        return compteRepo.save(c);
    }

    @Transactional
    public CompteClient cloturer(Long id) {
        CompteClient c = findById(id);
        c.setStatut("CLOTURE");
        c.setDateCloture(LocalDateTime.now());
        recalculer(c);
        return compteRepo.save(c);
    }
}
