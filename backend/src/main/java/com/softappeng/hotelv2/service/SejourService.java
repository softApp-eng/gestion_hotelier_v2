package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Client;
import com.softappeng.hotelv2.entities.Reservation;
import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.ClientRepo;
import com.softappeng.hotelv2.repositories.ReservationRepo;
import com.softappeng.hotelv2.repositories.SejourRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SejourService {

    private final SejourRepo sejourRepo;
    private final ChambreRepo chambreRepo;
    private final ReservationRepo reservationRepo;
    private final ClientRepo clientRepo;
    private final TarifService tarifService;

    public List<Sejour> findAll() {
        return sejourRepo.findAll();
    }

    public List<Sejour> byStatut(String statut) {
        return sejourRepo.findByStatut(statut);
    }

    public List<Sejour> enCours() {
        return sejourRepo.findByStatut("EN_COURS");
    }

    /** Filtered search: check-in range, check-out range, status, room number. */
    public List<Sejour> recherche(LocalDate checkinFrom, LocalDate checkinTo,
                                  LocalDate checkoutFrom, LocalDate checkoutTo,
                                  String statut, String numero) {
        return sejourRepo.search(
                checkinFrom != null ? checkinFrom.atStartOfDay() : null,
                checkinTo != null ? checkinTo.atTime(LocalTime.MAX) : null,
                checkoutFrom != null ? checkoutFrom.atStartOfDay() : null,
                checkoutTo != null ? checkoutTo.atTime(LocalTime.MAX) : null,
                (statut == null || statut.isBlank()) ? null : statut,
                (numero == null || numero.isBlank()) ? null : numero);
    }

    public Sejour findById(Long id) {
        return sejourRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Séjour introuvable: " + id));
    }

    /** Check-in from an existing reservation. */
    @Transactional
    public Sejour checkinFromReservation(Long reservationId) {
        Reservation r = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable: " + reservationId));
        if ("EN_COURS".equals(r.getStatut())) {
            throw new IllegalStateException("Cette réservation est déjà en cours");
        }
        Sejour s = new Sejour();
        s.setReservation(r);
        s.setClient(r.getClient());
        s.setChambre(r.getChambre());
        s.setPavillon(r.getPavillon() != null ? r.getPavillon()
                : (r.getChambre() != null ? r.getChambre().getPavillon() : null));
        s.setCategorieClient(r.getCategorieClient());
        s.setDateCheckin(LocalDateTime.now());
        s.setDateDepartPrevue(r.getDateDepart());
        s.setStatut("EN_COURS");
        s.setMontant(r.getMontantPrevu());
        s.setTarifNuitee(r.getTarifNuitee());
        s.setAccompagnants(r.getAccompagnants());
        s.setModePaiement(r.getModePaiement());
        s.setOrganisme(r.getOrganisme());
        s.setReferencePec(r.getReferencePec());
        r.setStatut("EN_COURS");
        reservationRepo.save(r);
        if (r.getChambre() != null) {
            Chambre c = r.getChambre();
            c.setEtat("OCCUPEE");
            chambreRepo.save(c);
        }
        return sejourRepo.save(s);
    }

    /** Direct walk-in check-in without a prior reservation. */
    @Transactional
    public Sejour checkinDirect(Sejour s) {
        if (s.getChambre() != null && s.getChambre().getId() != null) {
            Chambre c = chambreRepo.findById(s.getChambre().getId()).orElseThrow();
            s.setChambre(c);
            s.setPavillon(c.getPavillon());
            if (s.getCategorieClient() == null && s.getClient() != null
                    && s.getClient().getId() != null) {
                Client cl = clientRepo.findById(s.getClient().getId()).orElse(null);
                s.setClient(cl);
                if (cl != null) {
                    s.setCategorieClient(cl.getCategorieClient());
                }
            }
            Long catId = s.getCategorieClient() != null ? s.getCategorieClient().getId() : null;
            Long typeId = c.getTypeChambre() != null ? c.getTypeChambre().getId() : null;
            Double prix = tarifService.findPrix(catId, typeId);
            double nuit = prix != null ? prix : c.getPrix();
            s.setTarifNuitee(nuit);
            long nights = s.getDateDepartPrevue() != null
                    ? ChronoUnit.DAYS.between(LocalDate.now(), s.getDateDepartPrevue())
                    : (s.getDateCheckout() != null
                        ? ChronoUnit.DAYS.between(LocalDate.now(), s.getDateCheckout().toLocalDate())
                        : 1);
            if (s.getMontant() == 0) {
                s.setMontant(nuit * Math.max(nights, 1));
            }
            c.setEtat("OCCUPEE");
            chambreRepo.save(c);
        }
        s.setDateCheckin(LocalDateTime.now());
        s.setStatut("EN_COURS");
        return sejourRepo.save(s);
    }

    /** Check-out: free the room and finalize the stay. */
    @Transactional
    public Sejour checkout(Long id) {
        Sejour s = findById(id);
        s.setDateCheckout(LocalDateTime.now());
        s.setStatut("TERMINE");
        if (s.getChambre() != null) {
            Chambre c = s.getChambre();
            c.setEtat("NETTOYAGE");
            chambreRepo.save(c);
        }
        return sejourRepo.save(s);
    }

    public void delete(Long id) {
        sejourRepo.deleteById(id);
    }

    public long countEnCours() {
        return sejourRepo.countByStatut("EN_COURS");
    }
}
