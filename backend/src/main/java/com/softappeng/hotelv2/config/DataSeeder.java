package com.softappeng.hotelv2.config;

import com.softappeng.hotelv2.entities.*;
import com.softappeng.hotelv2.repositories.*;
import com.softappeng.hotelv2.security.user.Role;
import com.softappeng.hotelv2.security.user.User;
import com.softappeng.hotelv2.security.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds demo data on first start (H2 demo profile).
 * Idempotent: skips if users already exist.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final TypeChambreRepo typeChambreRepo;
    private final ChambreRepo chambreRepo;
    private final ClientRepo clientRepo;
    private final CategorieMenuRepo categorieRepo;
    private final ProduitRepo produitRepo;
    private final TableRestoRepo tableRepo;
    private final TicketRepasRepo ticketRepo;
    private final ReservationRepo reservationRepo;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) {
            return;
        }
        seedUsers();
        seedRooms();
        seedClients();
        seedMenu();
        seedTables();
        seedTickets();
        seedReservations();
    }

    private void seedUsers() {
        userRepo.save(User.builder().username("admin").nom("Admin").prenom("Système")
                .password(passwordEncoder.encode("admin")).role(Role.ADMIN).actif(true).build());
        userRepo.save(User.builder().username("reception").nom("Benali").prenom("Amine")
                .password(passwordEncoder.encode("1234")).role(Role.RECEPTION).actif(true).build());
        userRepo.save(User.builder().username("serveur").nom("Kaci").prenom("Yacine")
                .password(passwordEncoder.encode("1234")).role(Role.SERVEUR).actif(true).build());
        userRepo.save(User.builder().username("caisse").nom("Mansouri").prenom("Lina")
                .password(passwordEncoder.encode("1234")).role(Role.CAISSIER).actif(true).build());
        userRepo.save(User.builder().username("manager").nom("Haddad").prenom("Sofiane")
                .password(passwordEncoder.encode("1234")).role(Role.MANAGER).actif(true).build());
    }

    private void seedRooms() {
        TypeChambre simple = typeChambreRepo.save(new TypeChambre(null, "Simple", "Chambre 1 lit", 1, 4500));
        TypeChambre doubleRoom = typeChambreRepo.save(new TypeChambre(null, "Double", "Chambre 2 lits", 2, 7000));
        TypeChambre suite = typeChambreRepo.save(new TypeChambre(null, "Suite", "Suite avec salon", 4, 15000));

        int numero = 101;
        for (int etage = 1; etage <= 3; etage++) {
            for (int i = 1; i <= 6; i++) {
                TypeChambre t = i <= 2 ? simple : (i <= 4 ? doubleRoom : suite);
                Chambre c = new Chambre();
                c.setNumero(String.valueOf(numero));
                c.setEtage(String.valueOf(etage));
                c.setTypeChambre(t);
                c.setPrix(t.getPrixBase());
                c.setEtat("LIBRE");
                chambreRepo.save(c);
                numero++;
            }
            numero = (etage + 1) * 100 + 1;
        }
        // a couple of rooms already busy / cleaning
        chambreRepo.findByNumero("101").ifPresent(c -> { c.setEtat("OCCUPEE"); chambreRepo.save(c); });
        chambreRepo.findByNumero("102").ifPresent(c -> { c.setEtat("NETTOYAGE"); chambreRepo.save(c); });
    }

    private void seedClients() {
        clientRepo.save(newClient("Benali", "Karim", "0550102030", "MILITAIRE", "123456789", true));
        clientRepo.save(newClient("Durand", "Claire", "0661112233", "ETRANGER", "P998877", false));
        clientRepo.save(newClient("Cherif", "Nadia", "0772223344", "STANDARD", "987654321", false));
        clientRepo.save(newClient("Mebarki", "Okba", "0555555555", "SOCIETE", "44112233", false));
    }

    private Client newClient(String nom, String prenom, String tel, String type, String cin, boolean vip) {
        Client c = new Client();
        c.setNom(nom);
        c.setPrenom(prenom);
        c.setTelephone(tel);
        c.setTypeClient(type);
        c.setCin(cin);
        c.setVip(vip);
        c.setEmail(nom.toLowerCase() + "@example.com");
        return c;
    }

    private void seedMenu() {
        CategorieMenu entrees = categorieRepo.save(new CategorieMenu(null, "Entrées", 1, "fa-solid fa-leaf"));
        CategorieMenu plats = categorieRepo.save(new CategorieMenu(null, "Plats", 2, "fa-solid fa-utensils"));
        CategorieMenu desserts = categorieRepo.save(new CategorieMenu(null, "Desserts", 3, "fa-solid fa-ice-cream"));
        CategorieMenu boissons = categorieRepo.save(new CategorieMenu(null, "Boissons", 4, "fa-solid fa-mug-hot"));

        produit("Salade César", entrees, 700, "MENU");
        produit("Harira", entrees, 300, "MENU");
        produit("Couscous Royal", plats, 1500, "MENU");
        produit("Poulet Grillé", plats, 1200, "MENU");
        produit("Pizza Margherita", plats, 1000, "MENU");
        produit("Tajine Poulet", plats, 1300, "MENU");
        produit("Crème Caramel", desserts, 350, "MENU");
        produit("Tiramisu", desserts, 400, "MENU");
        produit("Eau minérale 50cl", boissons, 100, "BOISSON");
        produit("Coca-Cola 33cl", boissons, 150, "BOISSON");
        produit("Café", boissons, 100, "BOISSON");
        produit("Jus d'orange", boissons, 250, "BOISSON");
        produit("Thé à la menthe", boissons, 120, "BOISSON");
    }

    private void produit(String nom, CategorieMenu cat, double prix, String type) {
        Produit p = new Produit();
        p.setNom(nom);
        p.setCategorie(cat);
        p.setPrix(prix);
        p.setType(type);
        p.setDisponible(true);
        p.setCoutRevient(prix * 0.4);
        produitRepo.save(p);
    }

    private void seedTables() {
        for (int i = 1; i <= 12; i++) {
            TableResto t = new TableResto();
            t.setNumero("T" + String.format("%02d", i));
            t.setCapacite(i % 3 == 0 ? 6 : 4);
            t.setZone(i <= 8 ? "Salle" : "Terrasse");
            t.setStatut("LIBRE");
            tableRepo.save(t);
        }
    }

    private void seedTickets() {
        for (int i = 0; i < 3; i++) {
            TicketRepas t = new TicketRepas();
            t.setNumero("TR-" + LocalDate.now() + "-" + String.format("%04d", i + 1));
            t.setCode("DEMO" + (1000 + i));
            t.setBeneficiaire("Client démo " + (i + 1));
            t.setTypeRepas(i == 0 ? "PETIT_DEJEUNER" : (i == 1 ? "DEJEUNER" : "DINER"));
            t.setDateRepas(LocalDate.now());
            t.setNbPersonnes(1);
            t.setMontant(i == 0 ? 300 : (i == 1 ? 800 : 900));
            t.setStatut(i == 2 ? "UTILISE" : "VALIDE");
            t.setCreatedBy("admin");
            ticketRepo.save(t);
        }
    }

    private void seedReservations() {
        List<Chambre> chambres = chambreRepo.findAll();
        List<Client> clients = clientRepo.findAll();
        if (chambres.isEmpty() || clients.isEmpty()) return;
        Reservation r = new Reservation();
        r.setClient(clients.get(0));
        r.setChambre(chambres.get(3));
        r.setDateArrivee(LocalDate.now());
        r.setDateDepart(LocalDate.now().plusDays(2));
        r.setNbPersonnes(2);
        r.setMontantPrevu(chambres.get(3).getPrix() * 2);
        r.setStatut("CONFIRMEE");
        reservationRepo.save(r);

        Reservation r2 = new Reservation();
        r2.setClient(clients.get(1));
        r2.setChambre(chambres.get(4));
        r2.setDateArrivee(LocalDate.now().plusDays(3));
        r2.setDateDepart(LocalDate.now().plusDays(6));
        r2.setNbPersonnes(1);
        r2.setMontantPrevu(chambres.get(4).getPrix() * 3);
        r2.setStatut("CONFIRMEE");
        reservationRepo.save(r2);
    }
}
