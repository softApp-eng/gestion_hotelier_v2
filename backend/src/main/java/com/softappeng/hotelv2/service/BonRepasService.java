package com.softappeng.hotelv2.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.softappeng.hotelv2.entities.BonRepas;
import com.softappeng.hotelv2.entities.CompteClient;
import com.softappeng.hotelv2.entities.Prestation;
import com.softappeng.hotelv2.entities.Sejour;
import com.softappeng.hotelv2.repositories.BonRepasRepo;
import com.softappeng.hotelv2.repositories.SejourRepo;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Guest meal vouchers (bons repas). Creating a bon posts a BON_REPAS line on
 * the guest folio so it is billed at checkout.
 */
@Service
@RequiredArgsConstructor
public class BonRepasService {

    private final BonRepasRepo bonRepo;
    private final SejourRepo sejourRepo;
    private final CompteClientService compteService;
    private final NumberService numberService;

    public List<BonRepas> findAll() {
        return bonRepo.findAllByOrderByDateRepasDescIdDesc();
    }

    public List<BonRepas> byDate(LocalDate date) {
        return bonRepo.findByDateRepas(date);
    }

    public BonRepas findById(Long id) {
        return bonRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bon repas introuvable: " + id));
    }

    public BonRepas findByCode(String code) {
        return bonRepo.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Bon repas introuvable: " + code));
    }

    @Transactional
    public BonRepas create(BonRepas b) {
        b.setNumero(numberService.nextBonRepas());
        b.setCode(numberService.randomCode());
        if (b.getDateRepas() == null) b.setDateRepas(LocalDate.now());
        b.setStatut("VALIDE");
        b.setCreatedBy(SecurityUtils.currentUsername());

        if (b.getSejour() != null && b.getSejour().getId() != null) {
            Sejour s = sejourRepo.findById(b.getSejour().getId()).orElse(null);
            b.setSejour(s);
            if (s != null) {
                b.setClient(s.getClient());
                CompteClient cpt = compteService.ouvrir(s);
                b.setCompte(cpt);
                if (b.getBeneficiaire() == null && s.getClient() != null) {
                    b.setBeneficiaire(s.getClient().getNomComplet());
                }
            }
        }

        double prix = defaultPrice(b.getTypeRepas());
        if (b.getMontant() == 0) {
            b.setMontant(prix * Math.max(b.getNbPersonnes(), 1));
        }
        BonRepas saved = bonRepo.save(b);

        // Impute the meal on the guest account
        if (saved.getCompte() != null) {
            Prestation p = new Prestation();
            p.setType("BON_REPAS");
            p.setLibelle("Bon " + saved.getTypeRepas() + " x" + saved.getNbPersonnes());
            p.setQuantite(Math.max(saved.getNbPersonnes(), 1));
            p.setPrixUnitaire(prix);
            p.setReference(saved.getNumero());
            compteService.ajouterPrestation(saved.getCompte().getId(), p);
        }
        return saved;
    }

    @Transactional
    public BonRepas utiliser(String code) {
        BonRepas b = findByCode(code);
        if (!"VALIDE".equals(b.getStatut())) {
            throw new IllegalStateException("Bon non valide (statut: " + b.getStatut() + ")");
        }
        b.setStatut("UTILISE");
        b.setDateUtilisation(LocalDateTime.now());
        return bonRepo.save(b);
    }

    @Transactional
    public BonRepas annuler(Long id) {
        BonRepas b = findById(id);
        b.setStatut("ANNULE");
        return bonRepo.save(b);
    }

    private double defaultPrice(String typeRepas) {
        if (typeRepas == null) return 500;
        return switch (typeRepas) {
            case "PETIT_DEJEUNER" -> 300;
            case "DEJEUNER" -> 800;
            case "DINER" -> 900;
            default -> 500;
        };
    }

    // ---------------- PDF ----------------

    public byte[] generatePdf(Long id) {
        BonRepas b = findById(id);
        Document doc = new Document(new Rectangle(300, 480), 15, 15, 15, 15);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            Font title = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font normal = new Font(Font.HELVETICA, 10);
            Font small = new Font(Font.HELVETICA, 8);

            Paragraph h = new Paragraph("BON REPAS", title);
            h.setAlignment(Element.ALIGN_CENTER);
            doc.add(h);
            Paragraph hotel = new Paragraph("HOTEL V2", new Font(Font.HELVETICA, 11, Font.BOLD));
            hotel.setAlignment(Element.ALIGN_CENTER);
            doc.add(hotel);
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("N° : " + b.getNumero(), normal));
            doc.add(new Paragraph("Type : " + b.getTypeRepas(), normal));
            doc.add(new Paragraph("Date : " + b.getDateRepas(), normal));
            doc.add(new Paragraph("Bénéficiaire : " + (b.getBeneficiaire() == null ? "-" : b.getBeneficiaire()), normal));
            doc.add(new Paragraph("Personnes : " + b.getNbPersonnes(), normal));
            doc.add(new Paragraph("Montant : " + String.format("%.2f", b.getMontant()) + " DA",
                    new Font(Font.HELVETICA, 12, Font.BOLD)));
            doc.add(new Paragraph("Statut : " + b.getStatut(), normal));
            doc.add(Chunk.NEWLINE);

            Image qr = buildQr(b.getCode(), 110);
            qr.setAlignment(Element.ALIGN_CENTER);
            doc.add(qr);
            Paragraph code = new Paragraph("Code: " + b.getCode(), small);
            code.setAlignment(Element.ALIGN_CENTER);
            doc.add(code);

            doc.close();
        } catch (Exception e) {
            throw new IllegalStateException("Erreur génération PDF bon: " + e.getMessage(), e);
        }
        return out.toByteArray();
    }

    private Image buildQr(String data, int size) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, size, size);
        BufferedImage img = MatrixToImageWriter.toBufferedImage(matrix);
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(img, "PNG", png);
        return Image.getInstance(png.toByteArray());
    }
}
