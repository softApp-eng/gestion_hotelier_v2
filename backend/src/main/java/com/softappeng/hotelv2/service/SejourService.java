package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Reservation;
import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.ReservationRepo;
import com.softappeng.hotelv2.repositories.SejourRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SejourService {

    private final SejourRepo sejourRepo;
    private final ChambreRepo chambreRepo;
    private final ReservationRepo reservationRepo;

    public List<Sejour> findAll() {
        return sejourRepo.findAll();
    }

    public List<Sejour> enCours() {
        return sejourRepo.findByStatut("EN_COURS");
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
        s.setDateCheckin(LocalDateTime.now());
        s.setStatut("EN_COURS");
        s.setMontant(r.getMontantPrevu());
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
            long nights = s.getDateCheckout() != null
                    ? ChronoUnit.DAYS.between(LocalDate.now(), s.getDateCheckout().toLocalDate())
                    : 1;
            if (s.getMontant() == 0) {
                s.setMontant(c.getPrix() * Math.max(nights, 1));
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
