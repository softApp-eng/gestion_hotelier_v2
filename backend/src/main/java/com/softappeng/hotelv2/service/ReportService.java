package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Vente;
import com.softappeng.hotelv2.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final VenteRepo venteRepo;
    private final ChambreRepo chambreRepo;
    private final ReservationRepo reservationRepo;
    private final SejourRepo sejourRepo;
    private final CommandeRepo commandeRepo;
    private final TicketRepasRepo ticketRepo;

    /** Main dashboard aggregates. */
    public Map<String, Object> dashboard() {
        Map<String, Object> data = new LinkedHashMap<>();

        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);

        double caJour = venteRepo.sumTotalBetween(start, end);
        long ventesJour = venteRepo.countBetween(start, end);

        long totalChambres = chambreRepo.count();
        long occupees = chambreRepo.findByEtat("OCCUPEE").size();
        double tauxOccupation = totalChambres == 0 ? 0 : Math.round((occupees * 10000.0 / totalChambres)) / 100.0;

        data.put("caJour", caJour);
        data.put("ventesJour", ventesJour);
        data.put("totalChambres", totalChambres);
        data.put("chambresOccupees", occupees);
        data.put("tauxOccupation", tauxOccupation);
        data.put("arriveesJour", reservationRepo.findByDateArrivee(LocalDate.now()).size());
        data.put("sejoursEnCours", sejourRepo.countByStatut("EN_COURS"));
        data.put("commandesOuvertes", commandeRepo.findByStatutIn(List.of("OUVERTE", "SERVIE")).size());
        data.put("ticketsJour", ticketRepo.countByDateRepasAndStatut(LocalDate.now(), "VALIDE"));
        data.put("caSemaine", last7Days());
        data.put("topProduits", topProduits(start, end));
        data.put("repartition", repartitionChambres());
        return data;
    }

    /** Revenue for the last 7 days: [{date, total}]. */
    public List<Map<String, Object>> last7Days() {
        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            double total = venteRepo.sumTotalBetween(d.atStartOfDay(), d.atTime(LocalTime.MAX));
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", d.format(fmt));
            row.put("total", total);
            result.add(row);
        }
        return result;
    }

    /** Top 5 best selling products today. */
    public List<Map<String, Object>> topProduits(LocalDateTime start, LocalDateTime end) {
        List<Vente> ventes = venteRepo.findByDateVenteBetween(start, end);
        Map<String, Double> sums = new HashMap<>();
        for (Vente v : ventes) {
            if ("ANNULEE".equals(v.getStatut())) continue;
            v.getLignes().forEach(l -> sums.merge(
                    l.getProduit() != null ? l.getProduit().getNom() : l.getLibelle(),
                    (double) l.getQuantite(), Double::sum));
        }
        return sums.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("produit", e.getKey());
                    row.put("quantite", e.getValue());
                    return row;
                })
                .toList();
    }

    public List<Map<String, Object>> repartitionChambres() {
        Map<String, Long> byEtat = new LinkedHashMap<>();
        for (Chambre c : chambreRepo.findAll()) {
            byEtat.merge(c.getEtat(), 1L, Long::sum);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        byEtat.forEach((k, v) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("etat", k);
            row.put("nombre", v);
            result.add(row);
        });
        return result;
    }

    /** Sales report between two dates. */
    public Map<String, Object> ventesEntre(LocalDate from, LocalDate to) {
        List<Vente> ventes = venteRepo.findByDateVenteBetween(from.atStartOfDay(), to.atTime(LocalTime.MAX));
        double total = ventes.stream().filter(v -> !"ANNULEE".equals(v.getStatut())).mapToDouble(Vente::getTotal).sum();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("from", from);
        res.put("to", to);
        res.put("nombreVentes", ventes.stream().filter(v -> !"ANNULEE".equals(v.getStatut())).count());
        res.put("total", total);
        res.put("ventes", ventes);
        return res;
    }
}
