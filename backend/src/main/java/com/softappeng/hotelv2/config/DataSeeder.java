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
    private final PavillonRepo pavillonRepo;
    private final CategorieClientRepo categorieClientRepo;
    private final TarifRepo tarifRepo;
    private final OrganismeRepo organismeRepo;
    private final SejourRepo sejourRepo;
    private final CompteClientRepo compteClientRepo;
    private final PrestationRepo prestationRepo;
    private final BonRepasRepo bonRepasRepo;
    private final GouvernanteRepo gouvernanteRepo;
    private final ProblemeTechniqueRepo problemeRepo;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) {
            return;
        }
        seedUsers();
        seedPavillons();
        seedCategoriesClients();
        seedOrganismes();
        seedRooms();
        seedClients();
        seedMenu();
        seedTables();
        seedTickets();
        seedTarifs();
        seedReservations();
        seedSejours();
        seedHousekeeping();
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
        Pavillon chellah = pavillonRepo.findByCode("CHELLAH").orElse(null);
        Pavillon oudayas = pavillonRepo.findByCode("OUDAYAS").orElse(null);

        TypeChambre simple = typeChambreRepo.save(new TypeChambre(null, "Simple", "Chambre 1 lit", 1, 4500));
        TypeChambre doubleRoom = typeChambreRepo.save(new TypeChambre(null, "Double", "Chambre 2 lits", 2, 7000));
        TypeChambre miniSuite = typeChambreRepo.save(new TypeChambre(null, "Mini Suite", "Mini suite (chambre + coin salon)", 2, 11000));
        TypeChambre suite = typeChambreRepo.save(new TypeChambre(null, "Suite", "Suite avec salon", 4, 15000));
        TypeChambre junior = typeChambreRepo.save(new TypeChambre(null, "Suite Junior", "Suite junior", 3, 12000));
        TypeChambre senior = typeChambreRepo.save(new TypeChambre(null, "Suite Senior", "Suite senior", 4, 18000));
        TypeChambre luxe = typeChambreRepo.save(new TypeChambre(null, "Chambre de luxe", "Chambre de luxe", 2, 20000));

        // Pavillon Chellah — 5 étages x 7 chambres (Simple / Double / Suite / Mini Suite)
        seedPavillonRooms(chellah, 5, new TypeChambre[]{ miniSuite, simple, doubleRoom, doubleRoom, suite, suite, simple });
        // Pavillon Oudayas — 4 étages x 7 chambres (Suite Junior / Suite Senior / Chambre de luxe)
        seedPavillonRooms(oudayas, 4, new TypeChambre[]{ junior, senior, luxe, junior, senior, luxe, luxe });

        // a couple of rooms already busy / cleaning / blocked
        Chambre c101 = room("CHELLAH", "101");
        if (c101 != null) { c101.setEtat("OCCUPEE"); chambreRepo.save(c101); }
        Chambre c102 = room("CHELLAH", "102");
        if (c102 != null) { c102.setEtat("NETTOYAGE"); chambreRepo.save(c102); }
        Chambre c301 = room("CHELLAH", "301");
        if (c301 != null) {
            c301.setBloque(true);
            c301.setMotifBlocage("Maintenance technique");
            c301.setBlocageDebut(LocalDate.now());
            c301.setBlocageFin(LocalDate.now().plusDays(5));
            chambreRepo.save(c301);
        }
    }

    /** Creates one room per pattern entry, on every floor of a pavilion. */
    private void seedPavillonRooms(Pavillon pav, int etages, TypeChambre[] pattern) {
        for (int etage = 1; etage <= etages; etage++) {
            for (int i = 0; i < pattern.length; i++) {
                Chambre c = new Chambre();
                c.setNumero(String.valueOf(etage * 100 + (i + 1)));
                c.setEtage(String.valueOf(etage));
                c.setTypeChambre(pattern[i]);
                c.setPrix(pattern[i].getPrixBase());
                c.setEtat("LIBRE");
                c.setPavillon(pav);
                chambreRepo.save(c);
            }
        }
    }

    private Chambre room(String pavillonCode, String numero) {
        Pavillon p = pavillonRepo.findByCode(pavillonCode).orElse(null);
        if (p == null) return null;
        return chambreRepo.findByPavillonIdAndNumero(p.getId(), numero).orElse(null);
    }

    private void seedClients() {
        CategorieClient offSup = categorieClientRepo.findByCode("OFF_SUP").orElse(null);
        CategorieClient civil = categorieClientRepo.findByCode("CIVIL").orElse(null);
        CategorieClient delegation = categorieClientRepo.findByCode("DELEGATION").orElse(null);
        CategorieClient gend = categorieClientRepo.findByCode("GEND").orElse(null);

        clientRepo.save(newClient("Benali", "Karim", "0550102030", "MILITAIRE", "123456789", true, offSup));
        clientRepo.save(newClient("Durand", "Claire", "0661112233", "ETRANGER", "P998877", false, civil));
        clientRepo.save(newClient("Cherif", "Nadia", "0772223344", "STANDARD", "987654321", false, civil));
        clientRepo.save(newClient("Mebarki", "Okba", "0555555555", "SOCIETE", "44112233", false, delegation));
        clientRepo.save(newClient("Saadi", "Hakim", "0667778899", "MILITAIRE", "556677889", false, gend));
    }

    private Client newClient(String nom, String prenom, String tel, String type, String cin, boolean vip,
                             CategorieClient categorie) {
        Client c = new Client();
        c.setNom(nom);
        c.setPrenom(prenom);
        c.setTelephone(tel);
        c.setTypeClient(type);
        c.setCin(cin);
        c.setVip(vip);
        c.setCategorieClient(categorie);
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

        Chambre c1 = room("CHELLAH", "104");
        if (c1 == null) c1 = chambres.get(0);
        Reservation r = new Reservation();
        r.setClient(clients.get(0));
        r.setChambre(c1);
        r.setPavillon(c1.getPavillon());
        r.setCategorieClient(clients.get(0).getCategorieClient());
        r.setDateArrivee(LocalDate.now());
        r.setDateDepart(LocalDate.now().plusDays(2));
        r.setNbPersonnes(2);
        r.setAccompagnants("Épouse + 1 enfant");
        r.setModePaiement("PRISE_EN_CHARGE");
        r.setOrganisme(organismeRepo.findAll().stream().findFirst().orElse(null));
        r.setReferencePec("PEC-2026-001");
        double t1 = tarifPour(r.getCategorieClient(), c1);
        r.setTarifNuitee(t1);
        r.setMontantPrevu(t1 * 2);
        r.setStatut("CONFIRMEE");
        reservationRepo.save(r);

        Chambre c2 = room("CHELLAH", "205");
        if (c2 == null) c2 = chambres.get(0);
        Reservation r2 = new Reservation();
        r2.setClient(clients.get(1));
        r2.setChambre(c2);
        r2.setPavillon(c2.getPavillon());
        r2.setCategorieClient(clients.get(1).getCategorieClient());
        r2.setDateArrivee(LocalDate.now().plusDays(3));
        r2.setDateDepart(LocalDate.now().plusDays(6));
        r2.setNbPersonnes(1);
        r2.setModePaiement("ESPECES");
        double t2 = tarifPour(r2.getCategorieClient(), c2);
        r2.setTarifNuitee(t2);
        r2.setMontantPrevu(t2 * 3);
        r2.setStatut("CONFIRMEE");
        reservationRepo.save(r2);
    }

    private double tarifPour(CategorieClient cat, Chambre c) {
        if (cat != null && c.getTypeChambre() != null) {
            Double p = tarifRepo
                    .findByCategorieClientIdAndTypeChambreId(cat.getId(), c.getTypeChambre().getId())
                    .map(Tarif::getPrix).orElse(null);
            if (p != null) return p;
        }
        return c.getPrix();
    }

    private void seedPavillons() {
        pavillonRepo.save(new Pavillon(null, "CHELLAH", "Chellah", "Pavillon Chellah — 5 étages x 7 chambres", true));
        pavillonRepo.save(new Pavillon(null, "OUDAYAS", "Oudayas", "Pavillon Oudayas — 4 étages x 7 chambres", true));
    }

    private void seedCategoriesClients() {
        categorieClientRepo.save(new CategorieClient(null, "OFF_SUP", "Officier supérieur", 1));
        categorieClientRepo.save(new CategorieClient(null, "OFF_SUB", "Officier subalterne", 2));
        categorieClientRepo.save(new CategorieClient(null, "GEND", "Gendarmerie", 3));
        categorieClientRepo.save(new CategorieClient(null, "GEND_GEN", "Gendarmerie générale", 4));
        categorieClientRepo.save(new CategorieClient(null, "CIVIL", "Client civil", 5));
        categorieClientRepo.save(new CategorieClient(null, "INVITE", "Invité autorisé", 6));
        categorieClientRepo.save(new CategorieClient(null, "DELEGATION", "Délégation", 7));
    }

    private void seedOrganismes() {
        Organisme o1 = new Organisme();
        o1.setNom("Armée - Région Militaire");
        o1.setType("ARMEE");
        o1.setTelephone("021000000");
        organismeRepo.save(o1);

        Organisme o2 = new Organisme();
        o2.setNom("Gendarmerie Nationale");
        o2.setType("GENDARMERIE");
        o2.setTelephone("021111111");
        organismeRepo.save(o2);

        Organisme o3 = new Organisme();
        o3.setNom("Délégation officielle");
        o3.setType("DELEGATION");
        o3.setTelephone("021222222");
        organismeRepo.save(o3);
    }

    /** Tariff grid: price = base room-type price x category coefficient. */
    private void seedTarifs() {
        List<TypeChambre> types = typeChambreRepo.findAll();
        java.util.Map<String, Double> coeff = new java.util.HashMap<>();
        coeff.put("OFF_SUP", 0.80);
        coeff.put("OFF_SUB", 0.90);
        coeff.put("GEND", 0.90);
        coeff.put("GEND_GEN", 0.85);
        coeff.put("CIVIL", 1.00);
        coeff.put("INVITE", 0.50);
        coeff.put("DELEGATION", 1.20);

        for (CategorieClient cat : categorieClientRepo.findAll()) {
            double k = coeff.getOrDefault(cat.getCode(), 1.0);
            for (TypeChambre t : types) {
                Tarif tarif = new Tarif();
                tarif.setCategorieClient(cat);
                tarif.setTypeChambre(t);
                tarif.setPrix(Math.round(t.getPrixBase() * k));
                tarifRepo.save(tarif);
            }
        }
    }

    /** An in-house stay with an open folio (accommodation + one meal voucher). */
    private void seedSejours() {
        List<Chambre> chambres = chambreRepo.findAll();
        List<Client> clients = clientRepo.findAll();
        if (chambres.isEmpty() || clients.isEmpty()) return;

        Chambre c = room("CHELLAH", "101");
        if (c == null) c = chambres.get(0);
        Client cl = clients.get(0);
        Organisme org = organismeRepo.findAll().stream().findFirst().orElse(null);
        String day = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));

        Sejour s = new Sejour();
        s.setClient(cl);
        s.setChambre(c);
        s.setPavillon(c.getPavillon());
        s.setCategorieClient(cl.getCategorieClient());
        s.setDateCheckin(LocalDateTime.now().minusDays(1));
        s.setDateDepartPrevue(LocalDate.now().plusDays(1));
        s.setStatut("EN_COURS");
        s.setTarifNuitee(tarifPour(cl.getCategorieClient(), c));
        s.setMontant(s.getTarifNuitee() * 2);
        s.setAccompagnants("Épouse + 1 enfant");
        s.setModePaiement("PRISE_EN_CHARGE");
        s.setOrganisme(org);
        s.setReferencePec("PEC-2026-100");
        s = sejourRepo.save(s);

        CompteClient cpt = new CompteClient();
        cpt.setNumero("CPT-" + day + "-0001");
        cpt.setSejour(s);
        cpt.setClient(cl);
        cpt.setDateOuverture(s.getDateCheckin());
        cpt.setStatut("OUVERT");
        cpt = compteClientRepo.save(cpt);

        Prestation p1 = new Prestation();
        p1.setCompte(cpt);
        p1.setType("HEBERGEMENT");
        p1.setLibelle("Hébergement chambre " + c.getNumero() + " — 2 nuit(s)");
        p1.setQuantite(2);
        p1.setPrixUnitaire(s.getTarifNuitee());
        p1.setMontant(s.getTarifNuitee() * 2);
        p1.setDateHeure(s.getDateCheckin());
        p1.setUtilisateur("system");
        prestationRepo.save(p1);

        BonRepas br = new BonRepas();
        br.setNumero("BR-" + day + "-0001");
        br.setCode("DEMOBR000001");
        br.setCompte(cpt);
        br.setSejour(s);
        br.setClient(cl);
        br.setBeneficiaire(cl.getNomComplet());
        br.setTypeRepas("DEJEUNER");
        br.setDateRepas(LocalDate.now());
        br.setNbPersonnes(2);
        br.setMontant(1600);
        br.setStatut("VALIDE");
        br.setCreatedBy("system");
        bonRepasRepo.save(br);

        Prestation p2 = new Prestation();
        p2.setCompte(cpt);
        p2.setType("BON_REPAS");
        p2.setLibelle("Bon DEJEUNER x2");
        p2.setQuantite(2);
        p2.setPrixUnitaire(800);
        p2.setMontant(1600);
        p2.setDateHeure(LocalDateTime.now());
        p2.setReference(br.getNumero());
        p2.setUtilisateur("system");
        prestationRepo.save(p2);

        cpt.setTotal(s.getTarifNuitee() * 2 + 1600);
        compteClientRepo.save(cpt);
    }

    /** Housekeeping: gouvernantes responsables, femmes de chambre, room states and a technical problem. */
    private void seedHousekeeping() {
        Pavillon chellah = pavillonRepo.findByCode("CHELLAH").orElse(null);
        Pavillon oudayas = pavillonRepo.findByCode("OUDAYAS").orElse(null);

        // Pavillon Chellah : 1 gouvernante responsable + 3 femmes de chambre
        Gouvernante gChellah = gouvernante("Bensalem", "Amina", "0555 11 22 33", chellah, "GOUVERNANTE");
        Gouvernante f1 = gouvernante("Cherif", "Fatima", "0555 44 55 66", chellah, "FEMME_DE_CHAMBRE");
        Gouvernante f2 = gouvernante("Saidi", "Rachida", "0555 44 55 67", chellah, "FEMME_DE_CHAMBRE");
        Gouvernante f3 = gouvernante("Aouali", "Leila", "0555 44 55 68", chellah, "FEMME_DE_CHAMBRE");
        // Pavillon Oudayas : 1 gouvernante responsable + 3 femmes de chambre
        Gouvernante gOudayas = gouvernante("Hamdi", "Nadia", "0555 77 88 99", oudayas, "GOUVERNANTE");
        Gouvernante f4 = gouvernante("Bouzid", "Samira", "0555 77 88 11", oudayas, "FEMME_DE_CHAMBRE");
        Gouvernante f5 = gouvernante("Kessai", "Houria", "0555 77 88 22", oudayas, "FEMME_DE_CHAMBRE");
        Gouvernante f6 = gouvernante("Merabet", "Djamila", "0555 77 88 33", oudayas, "FEMME_DE_CHAMBRE");
        gouvernanteRepo.saveAll(List.of(gChellah, f1, f2, f3, gOudayas, f4, f5, f6));

        String[] etats = {"CLEAN", "A_VERIFIER", "DIRTY"};
        int i = 0;
        for (Chambre c : chambreRepo.findAllByOrderByNumeroAsc()) {
            boolean chellahRoom = c.getPavillon() != null && "CHELLAH".equals(c.getPavillon().getCode());
            Gouvernante[] equipe = chellahRoom ? new Gouvernante[]{ f1, f2, f3 } : new Gouvernante[]{ f4, f5, f6 };
            c.setGouvernante(equipe[i % 3]);
            String etat = "BLOQUEE".equals(c.getEtat()) ? "BLOQUEE" : etats[i % 3];
            c.setEtatMenage(etat);
            if ("CLEAN".equals(etat)) {
                c.setDateVerification(LocalDateTime.now().minusHours(2));
                c.setVerifiePar("reception");
            }
            chambreRepo.save(c);
            i++;
        }

        Chambre cible = room("CHELLAH", "105");
        if (cible == null && !chambreRepo.findAll().isEmpty()) cible = chambreRepo.findAll().get(0);
        if (cible != null) {
            ProblemeTechnique pt = new ProblemeTechnique();
            pt.setChambre(cible);
            pt.setDescription("Climatisation ne refroidit pas");
            pt.setPriorite("HAUTE");
            pt.setStatut("SIGNALE");
            pt.setSignalePar("reception");
            pt.setDateSignalement(LocalDateTime.now().minusHours(1));
            problemeRepo.save(pt);
        }
    }

    private Gouvernante gouvernante(String nom, String prenom, String tel, Pavillon p, String role) {
        Gouvernante g = new Gouvernante();
        g.setNom(nom);
        g.setPrenom(prenom);
        g.setTelephone(tel);
        g.setPavillon(p);
        g.setRole(role);
        g.setActif(true);
        return g;
    }
}
