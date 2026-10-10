package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Pavillon;
import com.softappeng.hotelv2.entities.Reservation;
import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.PavillonRepo;
import com.softappeng.hotelv2.repositories.ReservationRepo;
import com.softappeng.hotelv2.repositories.SejourRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * Room planning: per-pavilion monthly grid (free / reserved / occupied / blocked),
 * daily room state, and availability search.
 */
@Service
@RequiredArgsConstructor
public class PlanningService {

    private final ChambreRepo chambreRepo;
    private final PavillonRepo pavillonRepo;
    private final ReservationRepo reservationRepo;
    private final SejourRepo sejourRepo;

    /** Monthly planning: one row per room, one cell per day. */
    public Map<String, Object> planning(Long pavillonId, LocalDate debut, LocalDate fin) {
        List<Chambre> chambres = pavillonId != null
                ? chambreRepo.findByPavillonId(pavillonId)
                : chambreRepo.findAllByOrderByNumeroAsc();

        List<Reservation> reservations = reservationRepo
                .findByDateArriveeLessThanAndDateDepartGreaterThan(fin.plusDays(1), debut);
        List<Sejour> sejours = sejourRepo.findOccupyingBetween(
                debut.atStartOfDay(), fin.atTime(LocalTime.MAX));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("debut", debut.toString());
        result.put("fin", fin.toString());
        result.put("statuts", List.of("LIBRE", "RESERVEE", "OCCUPEE", "BLOQUEE"));
        if (pavillonId != null) {
            pavillonRepo.findById(pavillonId).ifPresent(p -> {
                result.put("pavillonId", p.getId());
                result.put("pavillonNom", p.getNom());
            });
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Chambre c : chambres) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("chambreId", c.getId());
            row.put("numero", c.getNumero());
            row.put("typeChambre", c.getTypeChambre() != null ? c.getTypeChambre().getLibelle() : null);
            row.put("etat", c.getEtat());
            row.put("pavillonId", c.getPavillon() != null ? c.getPavillon().getId() : null);
            row.put("pavillonNom", c.getPavillon() != null ? c.getPavillon().getNom() : null);

            List<Map<String, Object>> jours = new ArrayList<>();
            for (LocalDate d = debut; !d.isAfter(fin); d = d.plusDays(1)) {
                Map<String, Object> cell = new LinkedHashMap<>();
                cell.put("date", d.toString());
                String statut = "LIBRE";
                String libelle = null;

                if (estBloque(c, d)) {
                    statut = "BLOQUEE";
                    libelle = c.getMotifBlocage();
                } else {
                    Sejour s = sejourSurChambre(sejours, c.getId(), d);
                    if (s != null) {
                        statut = "OCCUPEE";
                        libelle = s.getClient() != null ? s.getClient().getNomComplet() : null;
                    } else {
                        Reservation r = reservationSurChambre(reservations, c.getId(), d);
                        if (r != null) {
                            statut = "RESERVEE";
                            libelle = r.getClient() != null ? r.getClient().getNomComplet() : null;
                        }
                    }
                }
                cell.put("statut", statut);
                cell.put("libelle", libelle);
                jours.add(cell);
            }
            row.put("jours", jours);
            rows.add(row);
        }
        result.put("chambres", rows);
        return result;
    }

    /** Daily state of rooms (printable): occupancy + in-house guest + planned departure. */
    public Map<String, Object> etatJournalier(LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        List<Chambre> chambres = chambreRepo.findAllByOrderByNumeroAsc();
        List<Sejour> sejours = sejourRepo.findOccupyingBetween(d.atStartOfDay(), d.atTime(LocalTime.MAX));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", d.toString());

        long libres = chambres.stream().filter(c -> "LIBRE".equals(c.getEtat())).count();
        long occupees = chambres.stream().filter(c -> "OCCUPEE".equals(c.getEtat())).count();
        long nettoyage = chambres.stream().filter(c -> "NETTOYAGE".equals(c.getEtat())).count();
        long horsService = chambres.stream().filter(c -> "HORS_SERVICE".equals(c.getEtat())).count();
        long bloquees = chambres.stream().filter(c -> estBloque(c, d)).count();
        long total = chambres.size();

        result.put("totalChambres", total);
        result.put("libres", libres);
        result.put("occupees", occupees);
        result.put("nettoyage", nettoyage);
        result.put("horsService", horsService);
        result.put("bloquees", bloquees);
        result.put("tauxOccupation", total == 0 ? 0.0 : Math.round((occupees * 10000.0 / total)) / 100.0);

        List<Map<String, Object>> groupes = new ArrayList<>();
        Map<Long, List<Chambre>> parPavillon = new LinkedHashMap<>();
        for (Chambre c : chambres) {
            Long pid = c.getPavillon() != null ? c.getPavillon().getId() : -1L;
            parPavillon.computeIfAbsent(pid, k -> new ArrayList<>()).add(c);
        }
        for (Map.Entry<Long, List<Chambre>> e : parPavillon.entrySet()) {
            Map<String, Object> groupe = new LinkedHashMap<>();
            Pavillon p = e.getKey() != -1L ? pavillonRepo.findById(e.getKey()).orElse(null) : null;
            groupe.put("pavillonId", e.getKey() == -1L ? null : e.getKey());
            groupe.put("pavillonNom", p != null ? p.getNom() : "Sans pavillon");
            List<Map<String, Object>> lignes = new ArrayList<>();
            for (Chambre c : e.getValue()) {
                Map<String, Object> ligne = new LinkedHashMap<>();
                ligne.put("numero", c.getNumero());
                ligne.put("typeChambre", c.getTypeChambre() != null ? c.getTypeChambre().getLibelle() : null);
                ligne.put("etat", c.getEtat());
                ligne.put("bloque", estBloque(c, d));
                Sejour s = sejourSurChambre(sejours, c.getId(), d);
                if (s != null) {
                    ligne.put("occupant", s.getClient() != null ? s.getClient().getNomComplet() : null);
                    ligne.put("dateArrivee", s.getDateCheckin() != null ? s.getDateCheckin().toLocalDate().toString() : null);
                    ligne.put("dateDepartPrevue",
                            s.getDateDepartPrevue() != null ? s.getDateDepartPrevue().toString() : null);
                    ligne.put("modePaiement", s.getModePaiement());
                }
                lignes.add(ligne);
            }
            groupe.put("chambres", lignes);
            groupes.add(groupe);
        }
        result.put("pavillons", groupes);
        return result;
    }

    /** Rooms available (not blocked, no active reservation overlap) over the given range. */
    public List<Chambre> disponibles(LocalDate debut, LocalDate fin, Long pavillonId, Long typeChambreId) {
        List<Chambre> base = pavillonId != null
                ? chambreRepo.findByPavillonId(pavillonId)
                : chambreRepo.findAllByOrderByNumeroAsc();
        List<Reservation> reservations = reservationRepo
                .findByDateArriveeLessThanAndDateDepartGreaterThan(fin.plusDays(1), debut);
        Set<Long> pris = new HashSet<>();
        for (Reservation r : reservations) {
            if (r.getChambre() != null
                    && ("CONFIRMEE".equals(r.getStatut()) || "EN_ATTENTE".equals(r.getStatut())
                        || "EN_COURS".equals(r.getStatut()))) {
                pris.add(r.getChambre().getId());
            }
        }
        List<Chambre> dispo = new ArrayList<>();
        for (Chambre c : base) {
            if (typeChambreId != null && (c.getTypeChambre() == null || !typeChambreId.equals(c.getTypeChambre().getId()))) {
                continue;
            }
            boolean blocked = estBloqueSurPeriode(c, debut, fin);
            if (!blocked && !pris.contains(c.getId())) {
                dispo.add(c);
            }
        }
        return dispo;
    }

    // ------------------------------------------------------------- helpers

    private boolean estBloque(Chambre c, LocalDate d) {
        if (!c.isBloque()) return false;
        if (c.getBlocageDebut() == null && c.getBlocageFin() == null) return true;
        boolean apresDebut = c.getBlocageDebut() == null || !d.isBefore(c.getBlocageDebut());
        boolean avantFin = c.getBlocageFin() == null || !d.isAfter(c.getBlocageFin());
        return apresDebut && avantFin;
    }

    private boolean estBloqueSurPeriode(Chambre c, LocalDate debut, LocalDate fin) {
        if (!c.isBloque()) return false;
        if (c.getBlocageDebut() == null && c.getBlocageFin() == null) return true;
        LocalDate bd = c.getBlocageDebut() != null ? c.getBlocageDebut() : LocalDate.MIN;
        LocalDate bf = c.getBlocageFin() != null ? c.getBlocageFin() : LocalDate.MAX;
        return !bd.isAfter(fin) && !bf.isBefore(debut);
    }

    private Sejour sejourSurChambre(List<Sejour> sejours, Long chambreId, LocalDate d) {
        for (Sejour s : sejours) {
            if (s.getChambre() == null || !chambreId.equals(s.getChambre().getId())) continue;
            if (!"EN_COURS".equals(s.getStatut())) continue;
            LocalDate ci = s.getDateCheckin() != null ? s.getDateCheckin().toLocalDate() : null;
            LocalDate co = s.getDateCheckout() != null ? s.getDateCheckout().toLocalDate() : null;
            if (ci != null && !ci.isAfter(d) && (co == null || !co.isBefore(d))) {
                return s;
            }
        }
        return null;
    }

    private Reservation reservationSurChambre(List<Reservation> reservations, Long chambreId, LocalDate d) {
        for (Reservation r : reservations) {
            if (r.getChambre() == null || !chambreId.equals(r.getChambre().getId())) continue;
            if (!"CONFIRMEE".equals(r.getStatut()) && !"EN_ATTENTE".equals(r.getStatut())
                    && !"EN_COURS".equals(r.getStatut())) continue;
            LocalDate da = r.getDateArrivee();
            LocalDate dd = r.getDateDepart();
            if (da != null && dd != null && !da.isAfter(d) && dd.isAfter(d)) {
                return r;
            }
        }
        return null;
    }
}
