package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.*;
import com.softappeng.hotelv2.repositories.*;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Housekeeping / gouvernante: room state board, daily verification, technical
 * problems and the gouvernante planning (by floor & type, departures/stayovers/arrivals).
 */
@Service
@RequiredArgsConstructor
public class HousekeepingService {

    private final ChambreRepo chambreRepo;
    private final GouvernanteRepo gouvernanteRepo;
    private final ProblemeTechniqueRepo problemeRepo;
    private final PavillonRepo pavillonRepo;
    private final SejourRepo sejourRepo;
    private final ReservationRepo reservationRepo;

    // ------------------------------------------------- reading the board

    /** Room state board (ménage) with optional filters. */
    public List<Map<String, Object>> etatChambres(Long pavillonId, String etage,
                                                  Long typeChambreId, String etatMenage) {
        LocalDate d = LocalDate.now();
        Map<Long, String> statuts = statutsJour(d);
        Set<Long> problemesOuverts = problemesOuvertsParChambre();

        List<Map<String, Object>> out = new ArrayList<>();
        for (Chambre c : chambreRepo.findAllByOrderByNumeroAsc()) {
            if (pavillonId != null && (c.getPavillon() == null || !pavillonId.equals(c.getPavillon().getId()))) continue;
            if (etage != null && !etage.isBlank() && !etage.equals(c.getEtage())) continue;
            if (typeChambreId != null && (c.getTypeChambre() == null || !typeChambreId.equals(c.getTypeChambre().getId()))) continue;
            if (etatMenage != null && !etatMenage.isBlank() && !etatMenage.equals(c.getEtatMenage())) continue;
            out.add(dto(c, statuts.get(c.getId()), problemesOuverts.contains(c.getId())));
        }
        return out;
    }

    /** Gouvernante planning for a date: by floor, by room type + flat list. */
    public Map<String, Object> planningGouvernante(LocalDate date) {
        LocalDate d = date == null ? LocalDate.now() : date;
        Map<Long, String> statuts = statutsJour(d);
        Set<Long> problemesOuverts = problemesOuvertsParChambre();

        List<Map<String, Object>> chambres = chambreRepo.findAllByOrderByNumeroAsc().stream()
                .map(c -> dto(c, statuts.get(c.getId()), problemesOuverts.contains(c.getId())))
                .collect(Collectors.toList());

        // By floor
        Map<String, List<Map<String, Object>>> byEtage = new LinkedHashMap<>();
        for (Map<String, Object> r : chambres) {
            String et = r.get("etage") == null || String.valueOf(r.get("etage")).isBlank()
                    ? "Non défini" : String.valueOf(r.get("etage"));
            byEtage.computeIfAbsent(et, k -> new ArrayList<>()).add(r);
        }
        List<Map<String, Object>> parEtage = new ArrayList<>();
        byEtage.entrySet().stream().sorted(Map.Entry.comparingByKey()).forEach(e -> {
            Map<String, Object> g = new LinkedHashMap<>();
            g.put("etage", e.getKey());
            g.put("chambres", e.getValue());
            parEtage.add(g);
        });

        // By room type
        Map<String, List<Map<String, Object>>> byType = new LinkedHashMap<>();
        for (Map<String, Object> r : chambres) {
            String t = r.get("typeChambre") == null ? "Non défini" : String.valueOf(r.get("typeChambre"));
            byType.computeIfAbsent(t, k -> new ArrayList<>()).add(r);
        }
        List<Map<String, Object>> parType = new ArrayList<>();
        byType.forEach((k, v) -> {
            Map<String, Object> g = new LinkedHashMap<>();
            g.put("type", k);
            g.put("chambres", v);
            parType.add(g);
        });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", d.toString());
        result.put("chambres", chambres);
        result.put("parEtage", parEtage);
        result.put("parType", parType);
        result.put("nbDepart", chambres.stream().filter(r -> "DEPART".equals(r.get("statutJour"))).count());
        result.put("nbRecouche", chambres.stream().filter(r -> "RECOUCHE".equals(r.get("statutJour"))).count());
        result.put("nbArrivee", chambres.stream().filter(r -> "ARRIVEE".equals(r.get("statutJour"))).count());
        return result;
    }

    /**
     * Occupancy planning matrix: per pavilion, per floor, the rooms of the floor
     * (état ménage + situation du jour RECOUCHÉ / DÉPART / ARRIVÉE) — the printable
     * board that mirrors the paper "Planning d'occupation".
     */
    public Map<String, Object> planningOccupation(LocalDate date) {
        LocalDate d = date == null ? LocalDate.now() : date;
        Map<Long, String> statuts = statutsJour(d);
        Set<Long> problemesOuverts = problemesOuvertsParChambre();

        long[] cpt = new long[]{0, 0, 0, 0}; // total, depart, recouche, arrivee
        List<Map<String, Object>> pavillons = new ArrayList<>();

        for (Pavillon pav : pavillonRepo.findAll()) {
            List<Chambre> chambres = chambreRepo.findByPavillonId(pav.getId());

            Map<String, List<Chambre>> byEtage = new TreeMap<>(etageOrder());
            for (Chambre c : chambres) {
                String et = (c.getEtage() == null || c.getEtage().isBlank()) ? "0" : c.getEtage();
                byEtage.computeIfAbsent(et, k -> new ArrayList<>()).add(c);
            }

            List<Map<String, Object>> etages = new ArrayList<>();
            for (Map.Entry<String, List<Chambre>> e : byEtage.entrySet()) {
                List<Chambre> rooms = new ArrayList<>(e.getValue());
                rooms.sort(Comparator.comparing(Chambre::getNumero));
                List<Map<String, Object>> cells = new ArrayList<>();
                for (Chambre c : rooms) {
                    String statut = statuts.get(c.getId());
                    cells.add(dto(c, statut, problemesOuverts.contains(c.getId())));
                    cpt[0]++;
                    if ("DEPART".equals(statut)) cpt[1]++;
                    else if ("RECOUCHE".equals(statut)) cpt[2]++;
                    else if ("ARRIVEE".equals(statut)) cpt[3]++;
                }
                Map<String, Object> g = new LinkedHashMap<>();
                g.put("etage", e.getKey());
                g.put("chambres", cells);
                etages.add(g);
            }

            List<Map<String, Object>> responsables = new ArrayList<>();
            List<Map<String, Object>> femmes = new ArrayList<>();
            for (Gouvernante gv : gouvernanteRepo.findByPavillonIdOrderByNomAsc(pav.getId())) {
                Map<String, Object> gm = new LinkedHashMap<>();
                gm.put("id", gv.getId());
                gm.put("nom", gv.getNomComplet());
                gm.put("telephone", gv.getTelephone());
                if ("GOUVERNANTE".equals(gv.getRole())) responsables.add(gm);
                else femmes.add(gm);
            }

            Map<String, Object> p = new LinkedHashMap<>();
            p.put("pavillonId", pav.getId());
            p.put("code", pav.getCode());
            p.put("pavillon", pav.getNom());
            p.put("responsables", responsables);
            p.put("femmes", femmes);
            p.put("nbChambres", chambres.size());
            p.put("etages", etages);
            pavillons.add(p);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", d.toString());
        result.put("pavillons", pavillons);
        result.put("nbChambres", cpt[0]);
        result.put("nbDepart", cpt[1]);
        result.put("nbRecouche", cpt[2]);
        result.put("nbArrivee", cpt[3]);
        return result;
    }

    private static Comparator<String> etageOrder() {
        return (a, b) -> {
            try {
                return Integer.compare(Integer.parseInt(a), Integer.parseInt(b));
            } catch (NumberFormatException ex) {
                return a.compareTo(b);
            }
        };
    }

    // ------------------------------------------------- mutations

    @Transactional
    public Chambre changerEtatMenage(Long chambreId, String etatMenage, Long gouvernanteId, String observation) {
        Chambre c = chambreRepo.findById(chambreId)
                .orElseThrow(() -> new IllegalArgumentException("Chambre introuvable: " + chambreId));
        c.setEtatMenage(etatMenage);
        if (gouvernanteId != null) {
            c.setGouvernante(gouvernanteRepo.findById(gouvernanteId).orElse(null));
        }
        if (observation != null) c.setObservationMenage(observation);
        if ("CLEAN".equals(etatMenage)) {
            c.setDateVerification(LocalDateTime.now());
            c.setVerifiePar(SecurityUtils.currentUsername());
        }
        return chambreRepo.save(c);
    }

    @Transactional
    public Chambre affecterGouvernante(Long chambreId, Long gouvernanteId) {
        Chambre c = chambreRepo.findById(chambreId)
                .orElseThrow(() -> new IllegalArgumentException("Chambre introuvable: " + chambreId));
        c.setGouvernante(gouvernanteId == null ? null : gouvernanteRepo.findById(gouvernanteId).orElse(null));
        return chambreRepo.save(c);
    }

    // ------------------------------------------------- technical problems

    public List<ProblemeTechnique> problemes(String statut) {
        return (statut == null || statut.isBlank())
                ? problemeRepo.findAllByOrderByDateSignalementDesc()
                : problemeRepo.findByStatutOrderByDateSignalementDesc(statut);
    }

    @Transactional
    public ProblemeTechnique signalerProbleme(Long chambreId, String description, String priorite) {
        Chambre c = chambreRepo.findById(chambreId)
                .orElseThrow(() -> new IllegalArgumentException("Chambre introuvable: " + chambreId));
        ProblemeTechnique p = new ProblemeTechnique();
        p.setChambre(c);
        p.setDescription(description);
        p.setPriorite(priorite == null ? "MOYENNE" : priorite);
        p.setStatut("SIGNALE");
        p.setSignalePar(SecurityUtils.currentUsername());
        p.setDateSignalement(LocalDateTime.now());
        return problemeRepo.save(p);
    }

    @Transactional
    public ProblemeTechnique changerStatutProbleme(Long id, String statut, String resolution) {
        ProblemeTechnique p = problemeRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Problème introuvable: " + id));
        p.setStatut(statut);
        if (resolution != null) p.setResolution(resolution);
        if ("RESOLU".equals(statut)) {
            p.setResoluPar(SecurityUtils.currentUsername());
            p.setDateResolution(LocalDateTime.now());
        }
        return problemeRepo.save(p);
    }

    // ------------------------------------------------- helpers

    /** statutJour per room id for a date: DEPART, RECOUCHE or ARRIVEE. */
    private Map<Long, String> statutsJour(LocalDate d) {
        Map<Long, String> statuts = new LinkedHashMap<>();
        for (Sejour s : sejourRepo.findByStatut("EN_COURS")) {
            if (s.getChambre() == null) continue;
            boolean depart = s.getDateDepartPrevue() != null && s.getDateDepartPrevue().equals(d);
            statuts.put(s.getChambre().getId(), depart ? "DEPART" : "RECOUCHE");
        }
        for (Reservation r : reservationRepo.findByDateArrivee(d)) {
            if (r.getChambre() == null) continue;
            if ("ANNULEE".equals(r.getStatut()) || "TERMINEE".equals(r.getStatut())) continue;
            statuts.putIfAbsent(r.getChambre().getId(), "ARRIVEE");
        }
        return statuts;
    }

    private Set<Long> problemesOuvertsParChambre() {
        return problemeRepo.findAll().stream()
                .filter(p -> !"RESOLU".equals(p.getStatut()))
                .map(p -> p.getChambre() == null ? null : p.getChambre().getId())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Map<String, Object> dto(Chambre c, String statutJour, boolean problemeOuvert) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("numero", c.getNumero());
        m.put("etage", c.getEtage());
        m.put("typeChambreId", c.getTypeChambre() == null ? null : c.getTypeChambre().getId());
        m.put("typeChambre", c.getTypeChambre() == null ? null : c.getTypeChambre().getLibelle());
        m.put("pavillonId", c.getPavillon() == null ? null : c.getPavillon().getId());
        m.put("pavillon", c.getPavillon() == null ? null : c.getPavillon().getNom());
        m.put("etat", c.getEtat());
        m.put("etatMenage", c.getEtatMenage());
        m.put("bloque", c.isBloque());
        m.put("statutJour", statutJour);
        // Housekeeping only: we never expose the client identity here, only whether the room is busy.
        m.put("occupe", "OCCUPEE".equals(c.getEtat())
                || "RECOUCHE".equals(statutJour) || "DEPART".equals(statutJour));
        m.put("gouvernante", c.getGouvernante() == null ? null
                : (c.getGouvernante().getNom()
                    + (c.getGouvernante().getPrenom() != null ? " " + c.getGouvernante().getPrenom() : "")));
        m.put("gouvernanteId", c.getGouvernante() == null ? null : c.getGouvernante().getId());
        m.put("dateVerification", c.getDateVerification());
        m.put("verifiePar", c.getVerifiePar());
        m.put("observationMenage", c.getObservationMenage());
        m.put("problemeOuvert", problemeOuvert);
        return m;
    }
}
