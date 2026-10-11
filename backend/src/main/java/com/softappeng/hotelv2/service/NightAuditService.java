package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.*;
import com.softappeng.hotelv2.repositories.*;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Night audit: daily closing (caisse), occupancy rate, cash report and
 * the day's log (main courante). All printable from the frontend.
 */
@Service
@RequiredArgsConstructor
public class NightAuditService {

    private final VenteRepo venteRepo;
    private final FactureRepo factureRepo;
    private final SejourRepo sejourRepo;
    private final ChambreRepo chambreRepo;
    private final BonRepasRepo bonRepasRepo;
    private final PrestationRepo prestationRepo;
    private final TicketRepasRepo ticketRepo;
    private final ClotureJournaliereRepo clotureRepo;

    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");

    /** Full snapshot for a day (without persisting). */
    public Map<String, Object> apercu(LocalDate date) {
        LocalDate d = date == null ? LocalDate.now() : date;
        LocalDateTime start = d.atStartOfDay();
        LocalDateTime end = d.atTime(LocalTime.MAX);

        List<Vente> ventes = venteRepo.findByDateVenteBetween(start, end);
        List<Facture> factures = factureRepo.findByDateEmissionBetween(start, end);

        double totalVentes = 0, totalEspeces = 0, totalAutres = 0;
        Map<String, Double> parMode = new LinkedHashMap<>();
        for (Vente v : ventes) {
            if ("ANNULEE".equals(v.getStatut())) continue;
            totalVentes += v.getTotal();
            for (Paiement p : v.getPaiements()) {
                parMode.merge(p.getMode(), p.getMontant(), Double::sum);
                if ("ESPECES".equals(p.getMode())) totalEspeces += p.getMontant();
                else totalAutres += p.getMontant();
            }
        }

        double tHeb = factures.stream().filter(f -> "HEBERGEMENT".equals(f.getType()))
                .mapToDouble(Facture::getTotalGeneral).sum();
        double tSubs = factures.stream().filter(f -> "SUBSISTANCE".equals(f.getType()))
                .mapToDouble(Facture::getTotalGeneral).sum();
        double tGlobale = factures.stream().filter(f -> "GLOBALE".equals(f.getType()))
                .mapToDouble(Facture::getTotalGeneral).sum();

        long totalChambres = chambreRepo.count();
        long occupees = chambreRepo.findByEtat("OCCUPEE").size();
        double taux = totalChambres == 0 ? 0
                : Math.round((occupees * 10000.0 / totalChambres)) / 100.0;

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("date", d.toString());
        m.put("totalVentes", totalVentes);
        m.put("totalEspeces", totalEspeces);
        m.put("totalAutres", totalAutres);
        m.put("totalEncaisse", totalVentes);
        m.put("encaissementParMode", parMode);
        m.put("totalHebergement", tHeb);
        m.put("totalSubsistance", tSubs);
        m.put("totalFactureGlobale", tGlobale);
        m.put("nbFactures", factures.size());
        m.put("nbArrivees", sejourRepo.findByDateCheckinBetween(start, end).size());
        m.put("nbDeparts", sejourRepo.findByDateCheckoutBetween(start, end).size());
        m.put("nbEnCours", sejourRepo.countByStatut("EN_COURS"));
        m.put("totalChambres", totalChambres);
        m.put("chambresOccupees", occupees);
        m.put("tauxOccupation", taux);
        m.put("bonsRepasJour", bonRepasRepo.findByDateRepas(d).size());
        m.put("ticketsRepasJour", ticketRepo.findByDateRepas(d).size());
        m.put("dejaCloturee", clotureRepo.findByDate(d).isPresent());
        clotureRepo.findByDate(d).ifPresent(c -> m.put("cloture", c));
        return m;
    }

    /** Main courante: chronological log of the day's events. */
    public List<Map<String, Object>> mainCourante(LocalDate date) {
        LocalDate d = date == null ? LocalDate.now() : date;
        LocalDateTime start = d.atStartOfDay();
        LocalDateTime end = d.atTime(LocalTime.MAX);

        List<Map<String, Object>> events = new ArrayList<>();

        for (Sejour s : sejourRepo.findByDateCheckinBetween(start, end)) {
            events.add(event(s.getDateCheckin(), "ARRIVEE",
                    "Arrivée " + nom(s.getClient()) + " — chambre "
                            + (s.getChambre() != null ? s.getChambre().getNumero() : "-"), s.getMontant()));
        }
        for (Sejour s : sejourRepo.findByDateCheckoutBetween(start, end)) {
            events.add(event(s.getDateCheckout(), "DEPART",
                    "Départ " + nom(s.getClient()) + " — chambre "
                            + (s.getChambre() != null ? s.getChambre().getNumero() : "-"), s.getMontant()));
        }
        for (Prestation p : prestationRepo.findByDateHeureBetween(start, end)) {
            events.add(event(p.getDateHeure(), "PRESTATION",
                    p.getType() + " : " + p.getLibelle(), p.getMontant()));
        }
        for (Vente v : venteRepo.findByDateVenteBetween(start, end)) {
            if ("ANNULEE".equals(v.getStatut())) continue;
            events.add(event(v.getDateVente(), "VENTE",
                    "Vente " + v.getNumero() + " (" + v.getTypeVente() + ")", v.getTotal()));
        }
        for (BonRepas b : bonRepasRepo.findByDateRepas(d)) {
            events.add(event(b.getCreatedAt(), "BON_REPAS",
                    "Bon " + b.getTypeRepas() + " — " + b.getBeneficiaire(), b.getMontant()));
        }

        events.sort(Comparator.comparing(e -> {
            Object h = e.get("heure");
            return h == null ? "" : h.toString();
        }));
        return events;
    }

    /** Close the day (night audit). */
    @Transactional
    public ClotureJournaliere cloturer(LocalDate date, String observation) {
        LocalDate d = date == null ? LocalDate.now() : date;
        Map<String, Object> a = apercu(d);

        ClotureJournaliere c = clotureRepo.findByDate(d).orElseGet(ClotureJournaliere::new);
        c.setDate(d);
        c.setDateCloture(LocalDateTime.now());
        c.setTotalEncaisse(num(a, "totalEncaisse"));
        c.setTotalEspeces(num(a, "totalEspeces"));
        c.setTotalAutres(num(a, "totalAutres"));
        c.setTotalHebergement(num(a, "totalHebergement"));
        c.setTotalRestauration(num(a, "totalSubsistance"));
        c.setNbArrivees((int) num(a, "nbArrivees"));
        c.setNbDeparts((int) num(a, "nbDeparts"));
        c.setNbEnCours((int) num(a, "nbEnCours"));
        c.setTotalChambres((int) num(a, "totalChambres"));
        c.setChambresOccupees((int) num(a, "chambresOccupees"));
        c.setTauxOccupation(num(a, "tauxOccupation"));
        c.setUtilisateur(SecurityUtils.currentUsername());
        c.setObservation(observation);
        c.setStatut("CLOTUREE");
        return clotureRepo.save(c);
    }

    public Optional<ClotureJournaliere> derniere() {
        return clotureRepo.findTopByOrderByDateDesc();
    }

    private Map<String, Object> event(LocalDateTime ts, String type, String libelle, double montant) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("heure", ts == null ? "" : ts.format(HM));
        e.put("type", type);
        e.put("libelle", libelle);
        e.put("montant", montant);
        return e;
    }

    private String nom(Client c) {
        return c == null ? "-" : c.getNomComplet();
    }

    private double num(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v == null ? 0 : ((Number) v).doubleValue();
    }
}
