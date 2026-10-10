package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.dto.CommandeRequest;
import com.softappeng.hotelv2.dto.LigneRequest;
import com.softappeng.hotelv2.dto.PaiementCommandeRequest;
import com.softappeng.hotelv2.dto.VenteRequest;
import com.softappeng.hotelv2.entities.*;
import com.softappeng.hotelv2.repositories.CommandeRepo;
import com.softappeng.hotelv2.repositories.ProduitRepo;
import com.softappeng.hotelv2.repositories.TableRestoRepo;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepo commandeRepo;
    private final TableRestoRepo tableRepo;
    private final ProduitRepo produitRepo;
    private final NumberService numberService;
    private final PosService posService;

    public List<Commande> findAll() {
        return commandeRepo.findAll();
    }

    public List<Commande> ouvertes() {
        return commandeRepo.findByStatutIn(List.of("OUVERTE", "SERVIE"));
    }

    public Commande findById(Long id) {
        return commandeRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Commande introuvable: " + id));
    }

    @Transactional
    public Commande save(CommandeRequest req) {
        Commande c;
        if (req.getId() != null) {
            c = findById(req.getId());
            if (!"OUVERTE".equals(c.getStatut()) && !"SERVIE".equals(c.getStatut())) {
                throw new IllegalStateException("Cette commande n'est plus modifiable");
            }
        } else {
            c = new Commande();
            c.setNumero(numberService.nextCommande());
            c.setDateCommande(LocalDateTime.now());
            c.setStatut("OUVERTE");
            c.setServeur(req.getServeur() != null ? req.getServeur() : SecurityUtils.currentUsername());
        }
        if (req.getTableId() != null) {
            TableResto t = tableRepo.findById(req.getTableId()).orElseThrow();
            c.setTable(t);
            t.setStatut("OCCUPEE");
            tableRepo.save(t);
        }
        if (req.getChambre() != null) c.setChambre(req.getChambre());
        if (req.getNote() != null) c.setNote(req.getNote());

        // Replace lines with the provided set
        c.getLignes().clear();
        for (LigneRequest lr : req.getLignes()) {
            c.getLignes().add(buildLine(c, lr));
        }
        recompute(c);
        return commandeRepo.save(c);
    }

    @Transactional
    public Commande addLine(Long commandeId, LigneRequest lr) {
        Commande c = findById(commandeId);
        c.getLignes().add(buildLine(c, lr));
        recompute(c);
        return commandeRepo.save(c);
    }

    @Transactional
    public Commande removeLine(Long commandeId, Long ligneId) {
        Commande c = findById(commandeId);
        c.getLignes().removeIf(l -> l.getId() != null && l.getId().equals(ligneId));
        recompute(c);
        return commandeRepo.save(c);
    }

    @Transactional
    public Commande changeStatut(Long id, String statut) {
        Commande c = findById(id);
        c.setStatut(statut);
        if ("PAYEE".equals(statut) || "ANNULEE".equals(statut)) {
            freeTable(c);
        }
        return commandeRepo.save(c);
    }

    /** Pay a restaurant order: creates a sale ticket and frees the table. */
    @Transactional
    public Commande payer(Long commandeId, PaiementCommandeRequest req) {
        Commande c = findById(commandeId);
        if ("PAYEE".equals(c.getStatut())) {
            throw new IllegalStateException("Cette commande est déjà payée");
        }
        VenteRequest vr = new VenteRequest();
        vr.setTypeVente(req.getTypeVente() != null ? req.getTypeVente() : "RESTAURANT");
        vr.setChambre(c.getChambre());
        vr.setRemise(req.getRemise());
        vr.setMontantPaye(req.getMontantPaye());
        vr.setPaiements(req.getPaiements());
        vr.setNote("Commande " + c.getNumero());
        c.getLignes().forEach(l -> {
            LigneRequest lr = new LigneRequest();
            lr.setProduitId(l.getProduit().getId());
            lr.setLibelle(l.getProduit().getNom());
            lr.setQuantite(l.getQuantite());
            lr.setPrixUnitaire(l.getPrixUnitaire());
            vr.getLignes().add(lr);
        });
        posService.recordVente(vr);
        c.setStatut("PAYEE");
        freeTable(c);
        return commandeRepo.save(c);
    }

    public void delete(Long id) {
        Commande c = findById(id);
        freeTable(c);
        commandeRepo.delete(c);
    }

    // ---------------- helpers ----------------

    private LigneCommande buildLine(Commande c, LigneRequest lr) {
        Produit p = produitRepo.findById(lr.getProduitId())
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable: " + lr.getProduitId()));
        LigneCommande l = new LigneCommande();
        l.setCommande(c);
        l.setProduit(p);
        l.setQuantite(lr.getQuantite());
        double pu = lr.getPrixUnitaire() != null ? lr.getPrixUnitaire() : p.getPrix();
        l.setPrixUnitaire(pu);
        l.setMontant(pu * lr.getQuantite());
        l.setNote(lr.getNote());
        return l;
    }

    private void recompute(Commande c) {
        double total = c.getLignes().stream().mapToDouble(LigneCommande::getMontant).sum();
        c.setTotal(total);
    }

    private void freeTable(Commande c) {
        if (c.getTable() != null) {
            TableResto t = c.getTable();
            t.setStatut("LIBRE");
            tableRepo.save(t);
        }
    }
}
