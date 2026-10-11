package com.softappeng.hotelv2.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.softappeng.hotelv2.entities.*;
import com.softappeng.hotelv2.repositories.CompteClientRepo;
import com.softappeng.hotelv2.repositories.FactureRepo;
import com.softappeng.hotelv2.repositories.PrestationRepo;
import com.softappeng.hotelv2.repositories.SejourRepo;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Invoicing. At checkout:
 *  - Especes / TPE       -> a single GLOBALE invoice
 *  - Prise en charge PEC -> HEBERGEMENT + SUBSISTANCE + GLOBALE (récapitulative)
 */
@Service
@RequiredArgsConstructor
public class FacturationService {

    private final FactureRepo factureRepo;
    private final PrestationRepo prestationRepo;
    private final CompteClientRepo compteRepo;
    private final SejourRepo sejourRepo;
    private final CompteClientService compteService;
    private final NumberService numberService;

    public List<Facture> findAll() {
        return factureRepo.findAllByOrderByDateEmissionDesc();
    }

    public Facture findById(Long id) {
        return factureRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Facture introuvable: " + id));
    }

    public List<Facture> bySejour(Long sejourId) {
        return factureRepo.findBySejourId(sejourId);
    }

    /** Generate the invoice(s) for a stay. Idempotent (returns existing invoices). */
    @Transactional
    public List<Facture> genererPourSejour(Long sejourId) {
        Sejour s = sejourRepo.findById(sejourId)
                .orElseThrow(() -> new IllegalArgumentException("Séjour introuvable: " + sejourId));

        List<Facture> existing = factureRepo.findBySejourId(sejourId);
        if (!existing.isEmpty()) {
            return existing;
        }

        // Make sure the accommodation line is posted before invoicing
        compteService.ajouterHebergement(s);
        CompteClient cpt = compteRepo.findBySejourId(sejourId).orElse(null);
        List<Prestation> prestations = cpt != null
                ? prestationRepo.findByCompteIdOrderByDateHeureAsc(cpt.getId())
                : new ArrayList<>();

        List<Prestation> heb = new ArrayList<>();
        List<Prestation> subs = new ArrayList<>();
        List<Prestation> divers = new ArrayList<>();
        for (Prestation p : prestations) {
            switch (catOf(p)) {
                case "HEBERGEMENT" -> heb.add(p);
                case "SUBSISTANCE" -> subs.add(p);
                default -> divers.add(p);
            }
        }
        double tHeb = sum(heb);
        double tSubs = sum(subs);
        double tDiv = sum(divers);
        double tAll = tHeb + tSubs + tDiv;

        boolean pec = "PRISE_EN_CHARGE".equals(s.getModePaiement());
        List<Facture> result = new ArrayList<>();
        if (pec) {
            result.add(creer(s, "HEBERGEMENT", heb, tHeb, 0, 0, tHeb));
            result.add(creer(s, "SUBSISTANCE", subs, 0, tSubs, 0, tSubs));
            result.add(creer(s, "GLOBALE", prestations, tHeb, tSubs, tDiv, tAll));
        } else {
            result.add(creer(s, "GLOBALE", prestations, tHeb, tSubs, tDiv, tAll));
        }
        return result;
    }

    private Facture creer(Sejour s, String type, List<Prestation> lignes,
                          double tHeb, double tSubs, double tDiv, double total) {
        Facture f = new Facture();
        f.setNumero(numberService.nextFacture());
        f.setSejour(s);
        f.setClient(s.getClient());
        f.setType(type);
        f.setModePaiement(s.getModePaiement());
        f.setOrganisme(s.getOrganisme());
        f.setReferencePec(s.getReferencePec());
        f.setDateEmission(LocalDateTime.now());
        f.setTotalHebergement(tHeb);
        f.setTotalSubsistance(tSubs);
        f.setTotalGeneral(total);
        f.setStatut("EMISE");
        f.setUtilisateur(SecurityUtils.currentUsername());

        List<FactureLigne> fl = new ArrayList<>();
        for (Prestation p : lignes) {
            FactureLigne l = new FactureLigne();
            l.setFacture(f);
            l.setCategorie(catOf(p));
            l.setLibelle(p.getLibelle());
            l.setQuantite(p.getQuantite());
            l.setPrixUnitaire(p.getPrixUnitaire());
            l.setMontant(p.getMontant());
            fl.add(l);
        }
        f.setLignes(fl);
        return factureRepo.save(f);
    }

    private String catOf(Prestation p) {
        if (p.getType() == null) return "DIVERS";
        return switch (p.getType()) {
            case "HEBERGEMENT" -> "HEBERGEMENT";
            case "BON_REPAS", "RESTAURANT" -> "SUBSISTANCE";
            default -> "DIVERS";
        };
    }

    private double sum(List<Prestation> list) {
        return list.stream().mapToDouble(Prestation::getMontant).sum();
    }

    // ---------------- PDF ----------------

    public byte[] generatePdf(Long id) {
        Facture f = findById(id);
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            Font h1 = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font h2 = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font normal = new Font(Font.HELVETICA, 10);
            Font small = new Font(Font.HELVETICA, 9);

            Paragraph title = new Paragraph("HOTEL V2", h1);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            Paragraph sub = new Paragraph("Facture " + f.getType(), new Font(Font.HELVETICA, 12, Font.BOLD));
            sub.setAlignment(Element.ALIGN_CENTER);
            doc.add(sub);
            doc.add(new Paragraph("N° : " + f.getNumero() + "    Date : " + f.getDateEmission(), normal));
            doc.add(new Paragraph("Client : "
                    + (f.getClient() != null ? f.getClient().getNomComplet() : "-"), normal));
            if (f.getSejour() != null && f.getSejour().getChambre() != null) {
                doc.add(new Paragraph("Chambre : " + f.getSejour().getChambre().getNumero(), normal));
            }
            doc.add(new Paragraph("Mode de paiement : " + f.getModePaiement()
                    + (f.getOrganisme() != null ? "  (" + f.getOrganisme().getNom() + ")" : ""), normal));
            if (f.getReferencePec() != null) {
                doc.add(new Paragraph("Référence PEC : " + f.getReferencePec(), normal));
            }
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(new float[]{5, 1.2f, 2, 2});
            table.setWidthPercentage(100);
            addHeader(table, "Désignation", h2);
            addHeader(table, "Qté", h2);
            addHeader(table, "P.U.", h2);
            addHeader(table, "Montant", h2);
            for (FactureLigne l : f.getLignes()) {
                addCell(table, l.getLibelle(), normal, Element.ALIGN_LEFT);
                addCell(table, String.valueOf(l.getQuantite()), normal, Element.ALIGN_CENTER);
                addCell(table, money(l.getPrixUnitaire()), normal, Element.ALIGN_RIGHT);
                addCell(table, money(l.getMontant()), normal, Element.ALIGN_RIGHT);
            }
            doc.add(table);
            doc.add(Chunk.NEWLINE);

            if (f.getTotalHebergement() > 0) {
                doc.add(new Paragraph("Total hébergement : " + money(f.getTotalHebergement()), normal));
            }
            if (f.getTotalSubsistance() > 0) {
                doc.add(new Paragraph("Total subsistance : " + money(f.getTotalSubsistance()), normal));
            }
            doc.add(new Paragraph("TOTAL GÉNÉRAL : " + money(f.getTotalGeneral()) + " DA",
                    new Font(Font.HELVETICA, 13, Font.BOLD)));
            doc.add(Chunk.NEWLINE);
            Paragraph foot = new Paragraph("Facture émise par " + f.getUtilisateur() + " — Merci de votre séjour.", small);
            foot.setAlignment(Element.ALIGN_CENTER);
            doc.add(foot);
            doc.close();
        } catch (Exception e) {
            throw new IllegalStateException("Erreur génération PDF facture: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    private void addHeader(PdfPTable t, String txt, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(txt, f));
        c.setBackgroundColor(new Color(230, 230, 230));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        t.addCell(c);
    }

    private void addCell(PdfPTable t, String txt, Font f, int align) {
        PdfPCell c = new PdfPCell(new Phrase(txt == null ? "" : txt, f));
        c.setHorizontalAlignment(align);
        t.addCell(c);
    }

    private String money(double v) {
        return String.format("%.2f", v);
    }
}
