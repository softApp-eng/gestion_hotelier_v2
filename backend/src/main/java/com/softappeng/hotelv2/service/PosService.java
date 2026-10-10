package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.dto.LigneRequest;
import com.softappeng.hotelv2.dto.PaiementRequest;
import com.softappeng.hotelv2.dto.VenteRequest;
import com.softappeng.hotelv2.entities.*;
import com.softappeng.hotelv2.repositories.*;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PosService {

    private final VenteRepo venteRepo;
    private final SessionCaisseRepo sessionRepo;
    private final ProduitRepo produitRepo;
    private final ClientRepo clientRepo;
    private final NumberService numberService;

    // ---------------- Cash register session ----------------

    public SessionCaisse currentSession() {
        return sessionRepo.findFirstByStatutOrderByDateOuvertureDesc("OUVERTE").orElse(null);
    }

    @Transactional
    public SessionCaisse openSession(double montantOuverture, String observation) {
        if (currentSession() != null) {
            throw new IllegalStateException("Une session de caisse est déjà ouverte");
        }
        SessionCaisse s = new SessionCaisse();
        s.setUtilisateur(SecurityUtils.currentUsername());
        s.setDateOuverture(LocalDateTime.now());
        s.setMontantOuverture(montantOuverture);
        s.setStatut("OUVERTE");
        s.setObservation(observation);
        return sessionRepo.save(s);
    }

    @Transactional
    public SessionCaisse closeSession(Long sessionId, double montantCompte, String observation) {
        SessionCaisse s = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session introuvable: " + sessionId));
        double totalVentes = venteRepo.sumBySession(s.getId());
        long nbVentes = venteRepo.findBySessionCaisseId(s.getId()).size();
        s.setDateFermeture(LocalDateTime.now());
        s.setTotalVentes(totalVentes);
        s.setNbVentes((int) nbVentes);
        s.setMontantCompte(montantCompte);
        // theoretical cash = opening + cash sales only
        double cashSales = venteRepo.findBySessionCaisseId(s.getId()).stream()
                .filter(v -> !"ANNULEE".equals(v.getStatut()))
                .flatMap(v -> v.getPaiements().stream())
                .filter(p -> "ESPECES".equalsIgnoreCase(p.getMode()))
                .mapToDouble(Paiement::getMontant)
                .sum();
        s.setMontantTheorique(s.getMontantOuverture() + cashSales);
        s.setEcart(montantCompte - s.getMontantTheorique());
        s.setStatut("FERMEE");
        if (observation != null) s.setObservation(observation);
        return sessionRepo.save(s);
    }

    public List<SessionCaisse> sessions() {
        return sessionRepo.findAll();
    }

    // ---------------- Sales ----------------

    public List<Vente> ventes() {
        return venteRepo.findAll();
    }

    public Vente findVente(Long id) {
        return venteRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Vente introuvable: " + id));
    }

    public List<Vente> ventesDuJour() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return venteRepo.findByDateVenteBetween(start, end);
    }

    /**
     * Registers a sale ticket: resolves products, computes totals, links the
     * current cash session and stores payments.
     */
    @Transactional
    public Vente recordVente(VenteRequest req) {
        Vente v = new Vente();
        v.setNumero(numberService.nextVente());
        v.setTypeVente(req.getTypeVente());
        v.setChambre(req.getChambre());
        v.setNote(req.getNote());
        v.setUtilisateur(SecurityUtils.currentUsername());
        v.setDateVente(LocalDateTime.now());
        v.setStatut("PAYEE");
        v.setSessionCaisse(currentSession());
        if (req.getClientId() != null) {
            v.setClient(clientRepo.findById(req.getClientId()).orElse(null));
        }

        double sousTotal = 0;
        for (LigneRequest lr : req.getLignes()) {
            Produit p = produitRepo.findById(lr.getProduitId())
                    .orElseThrow(() -> new IllegalArgumentException("Produit introuvable: " + lr.getProduitId()));
            LigneVente lv = new LigneVente();
            lv.setVente(v);
            lv.setProduit(p);
            lv.setLibelle(lr.getLibelle() != null ? lr.getLibelle() : p.getNom());
            lv.setQuantite(lr.getQuantite());
            double pu = lr.getPrixUnitaire() != null ? lr.getPrixUnitaire() : p.getPrix();
            lv.setPrixUnitaire(pu);
            lv.setMontant(pu * lr.getQuantite());
            sousTotal += lv.getMontant();
            v.getLignes().add(lv);
        }
        v.setSousTotal(sousTotal);
        v.setRemise(req.getRemise());
        double total = Math.max(sousTotal - req.getRemise(), 0);
        v.setTotal(total);

        // payments
        double paye = 0;
        StringBuilder modes = new StringBuilder();
        for (PaiementRequest pr : req.getPaiements()) {
            Paiement p = new Paiement();
            p.setVente(v);
            p.setMode(pr.getMode());
            p.setMontant(pr.getMontant());
            p.setReference(pr.getReference());
            v.getPaiements().add(p);
            paye += pr.getMontant();
            if (modes.length() > 0) modes.append(", ");
            modes.append(pr.getMode()).append(":").append(pr.getMontant());
        }
        if (req.getPaiements().isEmpty() && req.getMontantPaye() > 0) {
            Paiement p = new Paiement();
            p.setVente(v);
            p.setMode("ESPECES");
            p.setMontant(req.getMontantPaye());
            v.getPaiements().add(p);
            paye = req.getMontantPaye();
            modes.append("ESPECES:").append(req.getMontantPaye());
        }
        v.setMontantPaye(paye);
        v.setMonnaie(Math.max(paye - total, 0));
        v.setModesPaiement(modes.toString());

        Vente saved = venteRepo.save(v);
        // update running session totals
        SessionCaisse s = saved.getSessionCaisse();
        if (s != null) {
            s.setTotalVentes(s.getTotalVentes() + total);
            s.setNbVentes(s.getNbVentes() + 1);
            sessionRepo.save(s);
        }
        return saved;
    }

    @Transactional
    public Vente cancelVente(Long id) {
        Vente v = findVente(id);
        v.setStatut("ANNULEE");
        SessionCaisse s = v.getSessionCaisse();
        if (s != null) {
            s.setTotalVentes(Math.max(s.getTotalVentes() - v.getTotal(), 0));
            sessionRepo.save(s);
        }
        return venteRepo.save(v);
    }

    public double totalDuJour() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return venteRepo.sumTotalBetween(start, end);
    }

    public long nbVentesDuJour() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        return venteRepo.countBetween(start, end);
    }
}
