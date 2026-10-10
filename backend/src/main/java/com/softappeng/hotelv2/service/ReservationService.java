package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.CategorieClient;
import com.softappeng.hotelv2.entities.Chambre;
import com.softappeng.hotelv2.entities.Client;
import com.softappeng.hotelv2.entities.Organisme;
import com.softappeng.hotelv2.entities.Reservation;
import com.softappeng.hotelv2.repositories.CategorieClientRepo;
import com.softappeng.hotelv2.repositories.ChambreRepo;
import com.softappeng.hotelv2.repositories.ClientRepo;
import com.softappeng.hotelv2.repositories.OrganismeRepo;
import com.softappeng.hotelv2.repositories.PavillonRepo;
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
    private final CategorieClientRepo categorieClientRepo;
    private final OrganismeRepo organismeRepo;
    private final TarifService tarifService;
    private final PavillonRepo pavillonRepo;

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

        // Room + availability
        Chambre chambre = null;
        if (r.getChambre() != null && r.getChambre().getId() != null) {
            Long chambreId = r.getChambre().getId();
            List<Reservation> overlaps = reservationRepo.findOverlapping(chambreId, r.getDateArrivee(), r.getDateDepart());
            boolean conflict = overlaps.stream()
                    .anyMatch(o -> r.getId() == null || !o.getId().equals(r.getId()));
            if (conflict) {
                throw new IllegalStateException("La chambre est déjà réservée sur cette période");
            }
            chambre = chambreRepo.findById(chambreId).orElse(null);
            r.setChambre(chambre);
        }

        // Client (and inherit its category when none provided)
        Client client = null;
        if (r.getClient() != null && r.getClient().getId() != null) {
            client = clientRepo.findById(r.getClient().getId()).orElse(null);
            r.setClient(client);
        }

        // Customer category
        if (r.getCategorieClient() != null && r.getCategorieClient().getId() != null) {
            r.setCategorieClient(categorieClientRepo.findById(r.getCategorieClient().getId()).orElse(null));
        } else if (client != null && client.getCategorieClient() != null) {
            r.setCategorieClient(client.getCategorieClient());
        }

        // Pavilion (from the room, or explicitly provided)
        if (chambre != null && chambre.getPavillon() != null) {
            r.setPavillon(chambre.getPavillon());
        } else if (r.getPavillon() != null && r.getPavillon().getId() != null) {
            r.setPavillon(pavillonRepo.findById(r.getPavillon().getId()).orElse(null));
        } else {
            r.setPavillon(null);
        }

        // Paying organisation for "prise en charge"
        if ("PRISE_EN_CHARGE".equals(r.getModePaiement())
                && r.getOrganisme() != null && r.getOrganisme().getId() != null) {
            Organisme o = organismeRepo.findById(r.getOrganisme().getId()).orElse(null);
            r.setOrganisme(o);
        } else {
            r.setOrganisme(null);
            r.setReferencePec(null);
        }

        // Nightly tariff from the grid (category x room type), fallback to room price
        if (chambre != null) {
            Long catId = r.getCategorieClient() != null ? r.getCategorieClient().getId() : null;
            Long typeId = chambre.getTypeChambre() != null ? chambre.getTypeChambre().getId() : null;
            Double prix = tarifService.findPrix(catId, typeId);
            double nuit = prix != null ? prix : chambre.getPrix();
            r.setTarifNuitee(nuit);
            long nights = Math.max(ChronoUnit.DAYS.between(r.getDateArrivee(), r.getDateDepart()), 1);
            r.setMontantPrevu(nuit * nights);
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
