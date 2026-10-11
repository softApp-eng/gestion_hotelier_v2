package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Gouvernante;
import com.softappeng.hotelv2.entities.TourMenage;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.GouvernanteRepo;
import com.softappeng.hotelv2.repositories.TourMenageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Weekly duty roster ("tour de la semaine") of the housekeeping staff.
 * A default rotation is computed for the days that have no saved entry
 * (each femme alternates floors; Sunday is a rest day), and the user
 * can override any cell.
 */
@Service
@RequiredArgsConstructor
public class TourMenageService {

    private final TourMenageRepo repo;
    private final GouvernanteRepo gouvernanteRepo;
    private final ChambreRepo chambreRepo;

    public Map<String, Object> semaine(LocalDate anyDay) {
        LocalDate debut = (anyDay == null ? LocalDate.now() : anyDay).with(DayOfWeek.MONDAY);
        LocalDate fin = debut.plusDays(6);

        List<Gouvernante> femmes = gouvernanteRepo.findByRoleAndActifTrueOrderByNomAsc("FEMME_DE_CHAMBRE");
        List<TourMenage> stored = repo.findByDateBetween(debut, fin);
        Map<String, TourMenage> parCle = new HashMap<>();
        for (TourMenage t : stored) {
            if (t.getGouvernante() != null && t.getDate() != null) {
                parCle.put(t.getGouvernante().getId() + ":" + t.getDate(), t);
            }
        }

        List<Map<String, Object>> jours = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            jours.add(jour(debut.plusDays(i)));
        }

        List<Map<String, Object>> femmesDto = new ArrayList<>();
        List<Map<String, Object>> affectations = new ArrayList<>();
        for (Gouvernante f : femmes) {
            int nbEtages = nbEtages(f);
            Map<String, Object> fd = new LinkedHashMap<>();
            fd.put("id", f.getId());
            fd.put("nom", f.getNom());
            fd.put("prenom", f.getPrenom());
            fd.put("nomComplet", f.getNomComplet());
            fd.put("pavillon", f.getPavillon() != null ? f.getPavillon().getNom() : null);
            fd.put("pavillonId", f.getPavillon() != null ? f.getPavillon().getId() : null);
            fd.put("nbEtages", nbEtages);
            femmesDto.add(fd);

            for (int i = 0; i < 7; i++) {
                LocalDate d = debut.plusDays(i);
                TourMenage t = parCle.get(f.getId() + ":" + d);
                Map<String, Object> a = new LinkedHashMap<>();
                a.put("gouvernanteId", f.getId());
                a.put("date", d.toString());
                if (t != null) {
                    a.put("etage", t.getEtage());
                    a.put("repos", t.isRepos());
                    a.put("note", t.getNote());
                } else {
                    boolean repos = d.getDayOfWeek() == DayOfWeek.SUNDAY;
                    a.put("repos", repos);
                    a.put("etage", repos ? null : String.valueOf(((f.getId().intValue() + i) % nbEtages) + 1));
                }
                affectations.add(a);
            }
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("debut", debut.toString());
        out.put("fin", fin.toString());
        out.put("jours", jours);
        out.put("femmes", femmesDto);
        out.put("affectations", affectations);
        return out;
    }

    public TourMenage enregistrer(Long gouvernanteId, LocalDate date, String etage, Boolean repos, String note) {
        if (gouvernanteId == null) {
            throw new IllegalArgumentException("Femme de chambre requise");
        }
        if (date == null) {
            throw new IllegalArgumentException("Date requise");
        }
        Gouvernante f = gouvernanteRepo.findById(gouvernanteId)
                .orElseThrow(() -> new IllegalArgumentException("Agent introuvable: " + gouvernanteId));
        TourMenage t = repo.findByGouvernanteIdAndDate(gouvernanteId, date).orElseGet(TourMenage::new);
        boolean r = Boolean.TRUE.equals(repos);
        t.setGouvernante(f);
        t.setDate(date);
        t.setPavillon(f.getPavillon());
        t.setRepos(r);
        t.setEtage(r ? null : etage);
        t.setNote(note);
        return repo.save(t);
    }

    /** Highest floor number found among the staff member's pavilion rooms. */
    private int nbEtages(Gouvernante f) {
        if (f.getPavillon() == null) {
            return 5;
        }
        List<Chambre> chambres = chambreRepo.findByPavillonId(f.getPavillon().getId());
        int max = 0;
        for (Chambre c : chambres) {
            try {
                max = Math.max(max, Integer.parseInt(c.getEtage()));
            } catch (NumberFormatException ignored) {
                // non-numeric floor labels are ignored
            }
        }
        return max > 0 ? max : 5;
    }

    private Map<String, Object> jour(LocalDate d) {
        Map<String, Object> j = new LinkedHashMap<>();
        j.put("date", d.toString());
        j.put("jour", switch (d.getDayOfWeek()) {
            case MONDAY -> "Lundi";
            case TUESDAY -> "Mardi";
            case WEDNESDAY -> "Mercredi";
            case THURSDAY -> "Jeudi";
            case FRIDAY -> "Vendredi";
            case SATURDAY -> "Samedi";
            case SUNDAY -> "Dimanche";
        });
        return j;
    }
}
