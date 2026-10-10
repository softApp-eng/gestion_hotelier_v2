package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.Client;
import com.softappeng.hotelv2.entities.TicketRepas;
import com.softappeng.hotelv2.repositories.ClientRepo;
import com.softappeng.hotelv2.repositories.TicketRepasRepo;
import com.softappeng.hotelv2.security.auth.SecurityUtils;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepasRepo ticketRepo;
    private final ClientRepo clientRepo;
    private final NumberService numberService;

    public List<TicketRepas> findAll() {
        return ticketRepo.findAll();
    }

    public List<TicketRepas> byDate(LocalDate date) {
        return ticketRepo.findByDateRepas(date);
    }

    public TicketRepas findByCode(String code) {
        return ticketRepo.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Ticket introuvable: " + code));
    }

    public TicketRepas findById(Long id) {
        return ticketRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Ticket introuvable: " + id));
    }

    public TicketRepas create(TicketRepas t) {
        t.setNumero(numberService.nextTicket());
        t.setCode(numberService.randomCode());
        if (t.getDateRepas() == null) t.setDateRepas(LocalDate.now());
        t.setStatut("VALIDE");
        t.setCreatedBy(SecurityUtils.currentUsername());
        if (t.getClient() != null && t.getClient().getId() != null) {
            Client c = clientRepo.findById(t.getClient().getId()).orElse(null);
            t.setClient(c);
            if (t.getBeneficiaire() == null && c != null) {
                t.setBeneficiaire(c.getNomComplet());
            }
        }
        if (t.getMontant() == 0) {
            t.setMontant(defaultPrice(t.getTypeRepas()) * Math.max(t.getNbPersonnes(), 1));
        }
        return ticketRepo.save(t);
    }

    /** Validate a ticket (consume it). */
    public TicketRepas utiliser(String code) {
        TicketRepas t = findByCode(code);
        if (!"VALIDE".equals(t.getStatut())) {
            throw new IllegalStateException("Ticket non valide (statut: " + t.getStatut() + ")");
        }
        t.setStatut("UTILISE");
        t.setDateUtilisation(LocalDateTime.now());
        return ticketRepo.save(t);
    }

    public TicketRepas annuler(Long id) {
        TicketRepas t = findById(id);
        t.setStatut("ANNULE");
        return ticketRepo.save(t);
    }

    public TicketRepas markPrinted(Long id) {
        TicketRepas t = findById(id);
        t.setImprime(true);
        return ticketRepo.save(t);
    }

    // ---------------- PDF generation ----------------

    /** Generate a printable A5-ish PDF ticket with QR code. */
    public byte[] generatePdf(Long id) {
        TicketRepas t = findById(id);
        Document doc = new Document(new Rectangle(300, 480), 15, 15, 15, 15);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            Font title = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font normal = new Font(Font.HELVETICA, 10);
            Font small = new Font(Font.HELVETICA, 8);

            Paragraph h = new Paragraph("TICKET REPAS", title);
            h.setAlignment(Element.ALIGN_CENTER);
            doc.add(h);

            Paragraph hotel = new Paragraph("HOTEL V2", new Font(Font.HELVETICA, 11, Font.BOLD));
            hotel.setAlignment(Element.ALIGN_CENTER);
            doc.add(hotel);
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("N° : " + t.getNumero(), normal));
            doc.add(new Paragraph("Type : " + t.getTypeRepas(), normal));
            doc.add(new Paragraph("Date : " + t.getDateRepas(), normal));
            doc.add(new Paragraph("Bénéficiaire : " + (t.getBeneficiaire() == null ? "-" : t.getBeneficiaire()),
                    normal));
            doc.add(new Paragraph("Personnes : " + t.getNbPersonnes(), normal));
            doc.add(new Paragraph("Montant : " + String.format("%.2f", t.getMontant()) + " DA",
                    new Font(Font.HELVETICA, 12, Font.BOLD)));
            doc.add(new Paragraph("Statut : " + t.getStatut(), normal));
            doc.add(Chunk.NEWLINE);

            Image qr = buildQr(t.getCode(), 110);
            qr.setAlignment(Element.ALIGN_CENTER);
            doc.add(qr);

            Paragraph code = new Paragraph("Code: " + t.getCode(), small);
            code.setAlignment(Element.ALIGN_CENTER);
            doc.add(code);

            Paragraph footer = new Paragraph("Présentez ce ticket à l'entrée du restaurant.", small);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
        } catch (Exception e) {
            throw new IllegalStateException("Erreur génération PDF: " + e.getMessage(), e);
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

    private double defaultPrice(String typeRepas) {
        if (typeRepas == null) return 500;
        return switch (typeRepas) {
            case "PETIT_DEJEUNER" -> 300;
            case "DEJEUNER" -> 800;
            case "DINER" -> 900;
            default -> 500;
        };
    }
}
