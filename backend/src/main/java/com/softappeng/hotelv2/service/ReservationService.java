package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Client;
import com.softappeng.hotelv2.entities.Reservation;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.ClientRepo;
import com.softappeng.hotelv2.repositories.ReservationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepo reservationRepo;
    private final ChambreRepo chambreRepo;
    private final ClientRepo clientRepo;

    public List<Reservation> findAll() {
        return reservationRepo.findAll();
    }

    public List<Reservation> byStatut(String statut) {
        return reservationRepo.findByStatut(statut);
    }

    public List<Reservation> arrivalsToday() {
        return reservationRepo.findByDateArrivee(LocalDate.now());
    }

    public Reservation findById(Long id) {
        return reservationRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Réservation introuvable: " + id));
    }

    public Reservation save(Reservation r) {
        if (r.getDateArrivee() == null || r.getDateDepart() == null) {
            throw new IllegalArgumentException("Les dates d'arrivée et de départ sont obligatoires");
        }
        if (!r.getDateDepart().isAfter(r.getDateArrivee())) {
            throw new IllegalArgumentException("La date de départ doit être après la date d'arrivée");
        }
        if (r.getChambre() != null && r.getChambre().getId() != null) {
            Long chambreId = r.getChambre().getId();
            List<Reservation> overlaps = reservationRepo.findOverlapping(chambreId, r.getDateArrivee(), r.getDateDepart());
            boolean conflict = overlaps.stream().anyMatch(o -> !o.getId().equals(r.getId()));
            if (conflict) {
                throw new IllegalStateException("La chambre est déjà réservée sur cette période");
            }
            Chambre chambre = chambreRepo.findById(chambreId).orElse(null);
            r.setChambre(chambre);
            if (r.getMontantPrevu() == 0 && chambre != null) {
                long nights = ChronoUnit.DAYS.between(r.getDateArrivee(), r.getDateDepart());
                r.setMontantPrevu(chambre.getPrix() * Math.max(nights, 1));
            }
        }
        if (r.getClient() != null && r.getClient().getId() != null) {
            Client c = clientRepo.findById(r.getClient().getId()).orElse(null);
            r.setClient(c);
        }
        return reservationRepo.save(r);
    }

    public Reservation changeStatut(Long id, String statut) {
        Reservation r = findById(id);
        r.setStatut(statut);
        return reservationRepo.save(r);
    }

    public void delete(Long id) {
        reservationRepo.deleteById(id);
    }
}
