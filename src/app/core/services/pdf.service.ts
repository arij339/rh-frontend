import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class PdfService {

  private readonly COLORS = {
    primary:    [11, 110, 126]  as [number, number, number],
    secondary:  [18, 181, 196]  as [number, number, number],
    dark:       [10, 61, 71]    as [number, number, number],
    white:      [255, 255, 255] as [number, number, number],
    gray:       [245, 247, 248] as [number, number, number],
    text:       [45, 55, 72]    as [number, number, number],
    textLight:  [113, 128, 150] as [number, number, number],
    success:    [56, 161, 105]  as [number, number, number],
    warning:    [214, 158, 46]  as [number, number, number],
    danger:     [229, 62, 62]   as [number, number, number],
  };

  // ===================================================================
  // HEADER COMMUN
  // ===================================================================
  private addHeader(doc: jsPDF, title: string, subtitle: string): void {
    const w = doc.internal.pageSize.getWidth();

    // Fond dégradé simulé
    doc.setFillColor(...this.COLORS.dark);
    doc.rect(0, 0, w, 35, 'F');

    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 35, w, 8, 'F');

    // Logo texte
    doc.setFillColor(...this.COLORS.secondary);
    doc.roundedRect(14, 8, 20, 20, 3, 3, 'F');
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RH', 24, 21, { align: 'center' });

    // Titre
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RH Manager', 40, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 230, 235);
    doc.text('Plateforme de Gestion des Ressources Humaines', 40, 24);

    // Titre document
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.white);
    doc.text(title, w - 14, 16, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 230, 235);
    doc.text(subtitle, w - 14, 24, { align: 'right' });
  }

  // ===================================================================
  // FOOTER COMMUN
  // ===================================================================
  private addFooter(doc: jsPDF): void {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const pages = doc.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);

      doc.setFillColor(...this.COLORS.gray);
      doc.rect(0, h - 18, w, 18, 'F');

      doc.setDrawColor(...this.COLORS.secondary);
      doc.setLineWidth(0.5);
      doc.line(0, h - 18, w, h - 18);

      doc.setFontSize(8);
      doc.setTextColor(...this.COLORS.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        14, h - 8
      );
      doc.text(
        `Page ${i} / ${pages}`,
        w - 14, h - 8, { align: 'right' }
      );
      doc.text('Confidentiel — Usage interne uniquement',
        w / 2, h - 8, { align: 'center' }
      );
    }
  }

  // ===================================================================
  // SECTION TITLE
  // ===================================================================
  private addSectionTitle(
    doc: jsPDF, title: string, y: number): number {
    const w = doc.internal.pageSize.getWidth();

    doc.setFillColor(...this.COLORS.primary);
    doc.rect(14, y, 4, 8, 'F');

    doc.setFillColor(232, 247, 249);
    doc.rect(20, y, w - 34, 8, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.primary);
    doc.text(title, 24, y + 5.5);

    return y + 14;
  }

  // ===================================================================
  // INFO BOX
  // ===================================================================
  private addInfoBox(
    doc: jsPDF,
    items: { label: string; value: string }[],
    x: number, y: number,
    width: number): number {

    const lineH   = 8;
    const padding = 4;
    const boxH    = items.length * lineH + padding * 2;

    doc.setFillColor(...this.COLORS.gray);
    doc.roundedRect(x, y, width, boxH, 3, 3, 'F');

    doc.setDrawColor(...this.COLORS.secondary);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, boxH, 3, 3, 'S');

    items.forEach((item, idx) => {
      const lineY = y + padding + idx * lineH + 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.COLORS.textLight);
      doc.text(item.label + ' :', x + padding, lineY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...this.COLORS.text);
      doc.text(item.value || '—', x + 50, lineY);
    });

    return y + boxH + 6;
  }

  // ===================================================================
  // BADGE STATUT
  // ===================================================================
  private addBadge(
    doc: jsPDF, text: string, x: number, y: number,
    color: [number,number,number]): void {

    const tw = doc.getTextWidth(text);
    const bw = tw + 8;
    const bh = 6;

    doc.setFillColor(
      Math.min(color[0] + 180, 255),
      Math.min(color[1] + 180, 255),
      Math.min(color[2] + 180, 255)
    );
    doc.roundedRect(x, y - bh + 1, bw, bh, 2, 2, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(text, x + 4, y - 0.5);
  }

  private getStatutColor(
    statut: string): [number,number,number] {
    const map: Record<string, [number,number,number]> = {
      VALIDEE:            this.COLORS.success,
      REJETEE:            this.COLORS.danger,
      ANNULEE:            this.COLORS.textLight,
      EN_ATTENTE_MANAGER: this.COLORS.warning,
      EN_ATTENTE_RH:      this.COLORS.warning,
      NOUVELLE:           this.COLORS.primary,
      EN_COURS:           this.COLORS.warning,
      RESOLUE:            this.COLORS.success,
      CLOTUREE:           this.COLORS.textLight
    };
    return map[statut] ?? this.COLORS.textLight;
  }

  // ===================================================================
  // PDF 1 — RAPPORT RH MENSUEL
  // ===================================================================
  exportRapportMensuel(
    data: any,
    annee: number,
    mois: number,
    nomEntreprise: string = 'Entreprise'): void {

    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w    = doc.internal.pageSize.getWidth();
    const mois_label = new Date(annee, mois - 1, 1)
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    // Header
    this.addHeader(doc, 'RAPPORT RH MENSUEL', mois_label.toUpperCase());
    let y = 52;

    // Résumé exécutif
    y = this.addSectionTitle(doc, '📊 Résumé Exécutif', y);

    const conges      = data.conges      ?? [];
    const reclamations = data.reclamations ?? [];
    const avances     = data.avances     ?? [];
    const sorties     = data.sorties     ?? [];

    // KPI boxes
    const kpis = [
      { label: 'Demandes de congé',       value: String(conges.length) },
      { label: 'Congés validés',           value: String(conges.filter((c: any) => c.statut === 'VALIDEE').length) },
      { label: 'Jours ouvrables consommés',value: String(conges.reduce((s: number, c: any) => s + (c.joursOuvrables || 0), 0)) },
      { label: 'Réclamations reçues',      value: String(reclamations.length) },
      { label: 'Réclamations résolues',    value: String(reclamations.filter((r: any) => r.statut === 'RESOLUE' || r.statut === 'CLOTUREE').length) },
      { label: 'Avances accordées',        value: String(avances.filter((a: any) => a.statut === 'VALIDEE' || a.statut === 'EN_COURS').length) },
      { label: 'Montant total avances',    value: avances.filter((a: any) => a.montantAccorde).reduce((s: number, a: any) => s + (a.montantAccorde || 0), 0).toFixed(3) + ' DT' },
      { label: 'Autorisations de sortie',  value: String(sorties.length) },
    ];

    // 2 colonnes de KPI
    const col1 = kpis.slice(0, 4);
    const col2 = kpis.slice(4, 8);
    const afterBox1 = this.addInfoBox(doc, col1, 14, y, (w - 32) / 2);
    this.addInfoBox(doc, col2, 14 + (w - 32) / 2 + 4, y, (w - 32) / 2);
    y = afterBox1 + 4;

    // ===== SECTION CONGÉS =====
    if (conges.length > 0) {
      y = this.addSectionTitle(doc, '📅 Détail des Congés', y);

      autoTable(doc, {
        startY: y,
        head: [['Employé', 'Type', 'Période', 'Jours', 'Statut']],
        body: conges.map((c: any) => [
          `${c.employeNom || ''} ${c.employePrenom || ''}`,
          c.typeConge || '',
          `${this.formatDate(c.dateDebut)} → ${this.formatDate(c.dateFin)}`,
          `${c.joursOuvrables || 0} j`,
          c.statut || ''
        ]),
        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          textColor: this.COLORS.text,
          lineColor: [226, 232, 240],
          lineWidth: 0.3
        },
        headStyles: {
          fillColor: this.COLORS.primary,
          textColor: this.COLORS.white,
          fontStyle: 'bold',
          fontSize: 9
        },
        alternateRowStyles: { fillColor: [248, 252, 253] },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 30 }
        },
        margin: { left: 14, right: 14 },
        didDrawCell: (data: any) => {
          if (data.column.index === 4 && data.section === 'body') {
            const statut = data.cell.raw as string;
            const color  = this.getStatutColor(statut);
            doc.setFillColor(
              Math.min(color[0] + 180, 255),
              Math.min(color[1] + 180, 255),
              Math.min(color[2] + 180, 255)
            );
            doc.roundedRect(
              data.cell.x + 2,
              data.cell.y + 1.5,
              data.cell.width - 4,
              data.cell.height - 3,
              2, 2, 'F'
            );
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...color);
            doc.text(
              statut,
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2 + 1,
              { align: 'center' }
            );
          }
        }
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ===== SECTION RÉCLAMATIONS =====
    if (reclamations.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = this.addSectionTitle(doc, '📢 Réclamations', y);

      autoTable(doc, {
        startY: y,
        head: [['Ticket', 'Objet', 'Type', 'Urgence', 'Statut', 'Note']],
        body: reclamations.map((r: any) => [
          r.numeroTicket || '',
          (r.objet || '').substring(0, 35),
          r.typeReclamation || '',
          r.niveauUrgence || '',
          r.statut || '',
          r.noteEvaluation ? `${r.noteEvaluation}/5` : '—'
        ]),
        styles: { fontSize: 8, cellPadding: 3.5 },
        headStyles: {
          fillColor: this.COLORS.primary,
          textColor: this.COLORS.white,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 252, 253] },
        margin: { left: 14, right: 14 }
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ===== SECTION AVANCES =====
    if (avances.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = this.addSectionTitle(doc, '💰 Avances sur Salaire', y);

      autoTable(doc, {
        startY: y,
        head: [['Employé', 'Montant demandé', 'Montant accordé', 'Mensualités', 'Statut']],
        body: avances.map((a: any) => [
          `${a.employeNom || ''} ${a.employePrenom || ''}`,
          `${(a.montantDemande || 0).toFixed(3)} DT`,
          a.montantAccorde ? `${(a.montantAccorde).toFixed(3)} DT` : '—',
          a.nombreMensualites ? `${a.nombreMensualites} mois` : '—',
          a.statut || ''
        ]),
        styles: { fontSize: 8, cellPadding: 3.5 },
        headStyles: {
          fillColor: this.COLORS.primary,
          textColor: this.COLORS.white,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 252, 253] },
        margin: { left: 14, right: 14 }
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ===== SECTION SORTIES =====
    if (sorties.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = this.addSectionTitle(doc, '🚪 Autorisations de Sortie', y);

      autoTable(doc, {
        startY: y,
        head: [['Employé', 'Date', 'Horaire', 'Type', 'Durée', 'Statut']],
        body: sorties.map((s: any) => [
          `${s.employeNom || ''} ${s.employePrenom || ''}`,
          this.formatDate(s.dateSortie),
          `${s.heureSortie || ''} → ${s.heureRetourPrevue || ''}`,
          s.typeSortie || '',
          s.dureePrevueFormatee || '—',
          s.statut || ''
        ]),
        styles: { fontSize: 8, cellPadding: 3.5 },
        headStyles: {
          fillColor: this.COLORS.primary,
          textColor: this.COLORS.white,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 252, 253] },
        margin: { left: 14, right: 14 }
      });
    }

    this.addFooter(doc);
    doc.save(`Rapport_RH_${mois_label.replace(' ', '_')}.pdf`);
  }

  // ===================================================================
  // PDF 2 — ATTESTATION AUTORISATION DE SORTIE
  // ===================================================================
  exportAttestationSortie(sortie: any): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w   = doc.internal.pageSize.getWidth();

    this.addHeader(doc, 'AUTORISATION DE SORTIE', `N° ${sortie.id || ''}`);
    let y = 52;

    // Titre central
    doc.setFillColor(232, 247, 249);
    doc.roundedRect(14, y, w - 28, 16, 4, 4, 'F');
    doc.setDrawColor(...this.COLORS.secondary);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, w - 28, 16, 4, 4, 'S');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.primary);
    doc.text('ATTESTATION D\'AUTORISATION DE SORTIE', w / 2, y + 10, { align: 'center' });
    y += 24;

    // Intro
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.text);
    doc.text(
      'Nous soussignés, le Service des Ressources Humaines, attestons avoir accordé',
      14, y
    );
    y += 6;
    doc.text(
      'l\'autorisation de sortie aux conditions suivantes :',
      14, y
    );
    y += 12;

    // Info employé
    y = this.addSectionTitle(doc, 'Informations de l\'Employé', y);
    y = this.addInfoBox(doc, [
      { label: 'Nom & Prénom',  value: `${sortie.employeNom || ''} ${sortie.employePrenom || ''}` },
      { label: 'Matricule',     value: sortie.employeMatricule || '—' },
      { label: 'Département',   value: sortie.employeDepartement || '—' }
    ], 14, y, w - 28);

    // Info sortie
    y = this.addSectionTitle(doc, 'Détails de la Sortie', y);
    y = this.addInfoBox(doc, [
      { label: 'Date de sortie',     value: this.formatDate(sortie.dateSortie) },
      { label: 'Heure de sortie',    value: sortie.heureSortie || '—' },
      { label: 'Retour prévu',       value: sortie.heureRetourPrevue || '—' },
      { label: 'Durée prévue',       value: sortie.dureePrevueFormatee || '—' },
      { label: 'Type de sortie',     value: sortie.typeSortie || '—' },
      { label: 'Motif',              value: sortie.motif || '—' }
    ], 14, y, w - 28);

    // Validation
    y = this.addSectionTitle(doc, 'Validation', y);
    y = this.addInfoBox(doc, [
      { label: 'Validé par',    value: sortie.managerValideurNom || '—' },
      { label: 'Date validation', value: this.formatDateTime(sortie.dateValidation) },
      { label: 'Commentaire',   value: sortie.commentaireManager || '—' }
    ], 14, y, w - 28);

    // Statut badge
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.text);
    doc.text('Statut : ', 14, y + 5);
    this.addBadge(doc, sortie.statut || 'VALIDEE', 38, y + 5,
      this.getStatutColor(sortie.statut));
    y += 16;

    // Pointage retour si disponible
    if (sortie.heureRetourReelle) {
      y = this.addSectionTitle(doc, 'Pointage Retour Effectif', y);
      y = this.addInfoBox(doc, [
        { label: 'Heure retour réelle', value: sortie.heureRetourReelle },
        { label: 'Durée réelle',        value: sortie.dureeReelleFormatee || '—' }
      ], 14, y, w - 28);
    }

    // Signatures
    y += 8;
    if (y > 220) { doc.addPage(); y = 20; }

    doc.setFillColor(...this.COLORS.gray);
    doc.rect(14, y, w - 28, 40, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.text);

    // Signature employé
    doc.text("L'Employé(e)", 35, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.textLight);
    doc.text(`${sortie.employeNom || ''} ${sortie.employePrenom || ''}`, 35, y + 14, { align: 'center' });
    doc.setDrawColor(...this.COLORS.secondary);
    doc.line(14, y + 33, 80, y + 33);
    doc.setFontSize(7);
    doc.text('Signature', 47, y + 38, { align: 'center' });

    // Signature RH
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.text);
    doc.text('Le Responsable RH', w - 35, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.textLight);
    doc.text(sortie.managerValideurNom || 'Service RH', w - 35, y + 14, { align: 'center' });
    doc.line(w - 80, y + 33, w - 14, y + 33);
    doc.setFontSize(7);
    doc.text('Signature & Cachet', w - 47, y + 38, { align: 'center' });

    // Note légale
    y += 50;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...this.COLORS.textLight);
    doc.text(
      '* Ce document est généré automatiquement par le système RH Manager et constitue une autorisation officielle.',
      w / 2, y, { align: 'center' }
    );

    this.addFooter(doc);
    doc.save(`Autorisation_Sortie_${sortie.employeNom}_${sortie.dateSortie}.pdf`);
  }

  // ===================================================================
  // PDF 3 — ATTESTATION DE CONGÉ VALIDÉ
  // ===================================================================
  exportAttestationConge(conge: any): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w   = doc.internal.pageSize.getWidth();

    this.addHeader(doc, 'ATTESTATION DE CONGÉ', `N° ${conge.id || ''}`);
    let y = 52;

    // Titre central
    doc.setFillColor(232, 247, 249);
    doc.roundedRect(14, y, w - 28, 16, 4, 4, 'F');
    doc.setDrawColor(...this.COLORS.secondary);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, y, w - 28, 16, 4, 4, 'S');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.primary);
    doc.text('ATTESTATION DE CONGÉ APPROUVÉ', w / 2, y + 10, { align: 'center' });
    y += 24;

    // Intro
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.text);
    doc.text(
      'Nous soussignés, le Service des Ressources Humaines, attestons avoir accordé',
      14, y
    );
    y += 6;
    doc.text(
      'le congé aux conditions suivantes :',
      14, y
    );
    y += 12;

    // Info employé
    y = this.addSectionTitle(doc, 'Informations de l\'Employé', y);
    y = this.addInfoBox(doc, [
      { label: 'Nom & Prénom',  value: `${conge.employeNom || ''} ${conge.employePrenom || ''}` },
      { label: 'Matricule',     value: conge.employeMatricule || '—' },
      { label: 'Département',   value: conge.employeDepartement || '—' }
    ], 14, y, w - 28);

    // Info congé
    y = this.addSectionTitle(doc, 'Détails du Congé', y);

    const typeLabels: Record<string, string> = {
      'ANNUEL':       'Congé Annuel',
      'MALADIE':      'Congé Maladie',
      'EXCEPTIONNEL': 'Congé Exceptionnel',
      'SANS_SOLDE':   'Congé Sans Solde',
      'MATERNITE':    'Congé Maternité',
      'PATERNITE':    'Congé Paternité'
    };

    y = this.addInfoBox(doc, [
      { label: 'Type de congé',   value: typeLabels[conge.typeConge] || conge.typeConge || '—' },
      { label: 'Date de début',   value: this.formatDate(conge.dateDebut) },
      { label: 'Date de fin',     value: this.formatDate(conge.dateFin) },
      { label: 'Jours ouvrables', value: `${conge.joursOuvrables || conge.nombreJours || 0} jour(s)` },
      { label: 'Motif',           value: conge.motif || '—' }
    ], 14, y, w - 28);

    // Validation
    y = this.addSectionTitle(doc, 'Validation', y);
    y = this.addInfoBox(doc, [
      { label: 'Commentaire Manager', value: conge.commentaireManager || '—' },
      { label: 'Commentaire RH',      value: conge.commentaireRh || conge.commentaireRH || '—' },
      { label: 'Date de demande',     value: this.formatDateTime(conge.createdAt) }
    ], 14, y, w - 28);

    // Statut badge
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.text);
    doc.text('Statut : ', 14, y + 5);
    this.addBadge(doc, 'VALIDÉE', 38, y + 5, this.COLORS.success);
    y += 16;

    // Signatures
    if (y > 220) { doc.addPage(); y = 20; }

    doc.setFillColor(...this.COLORS.gray);
    doc.rect(14, y, w - 28, 40, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.text);

    // Signature employé
    doc.text("L'Employé(e)", 35, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.textLight);
    doc.text(`${conge.employeNom || ''} ${conge.employePrenom || ''}`, 35, y + 14, { align: 'center' });
    doc.setDrawColor(...this.COLORS.secondary);
    doc.line(14, y + 33, 80, y + 33);
    doc.setFontSize(7);
    doc.text('Signature', 47, y + 38, { align: 'center' });

    // Signature RH
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLORS.text);
    doc.text('Le Responsable RH', w - 35, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.textLight);
    doc.text('Service RH', w - 35, y + 14, { align: 'center' });
    doc.line(w - 80, y + 33, w - 14, y + 33);
    doc.setFontSize(7);
    doc.text('Signature & Cachet', w - 47, y + 38, { align: 'center' });

    // Note légale
    y += 50;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...this.COLORS.textLight);
    doc.text(
      '* Ce document est généré automatiquement par le système RH Manager et constitue une attestation officielle de congé.',
      w / 2, y, { align: 'center' }
    );

    this.addFooter(doc);
    doc.save(`Attestation_Conge_${conge.employeNom}_${conge.dateDebut}.pdf`);
  }

  // ===================================================================
  // HELPERS
  // ===================================================================
  private formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  private formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('fr-FR');
  }
}
