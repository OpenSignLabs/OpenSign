import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'node:fs';
export default async function GenerateCertificate(docDetails) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const pngUrl = fs.readFileSync('./logo.png').buffer;
  const pngImage = await pdfDoc.embedPng(pngUrl);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const startX = 15;
  const startY = 15;
  const borderColor = rgb(0.12, 0.12, 0.12);
  const titleColor = rgb(0, 0.2, 0.4); //rgb(0, 0.53, 0.71);
  const titleUnderline = rgb(0, 0.2, 0.4); // rgb(0.12, 0.12, 0.12);
  const title = 25;
  const subtitle = 20;
  const text = 14;
  const textKeyColor = rgb(0.12, 0.12, 0.12);
  const textValueColor = rgb(0.3, 0.3, 0.3);
  const completedAt = new Date(docDetails.updatedAt);
  const completedUTCtime = completedAt.toUTCString();
  const signersCount = docDetails?.Signers?.length || 1;
  const createdAt = new Date();
  const createdUTCTime = createdAt.toUTCString();
  const createDate = 'Generated On ' + createdUTCTime;
  const company = docDetails?.ExtUserPtr?.Company || '';
  const auditTrail =
    docDetails.AuditTrail?.length > 1
      ? docDetails.AuditTrail.map(x => {
          const data = docDetails.Signers.find(y => y.objectId === x.UserPtr.objectId);
          return { ...data, ipAddress: x.ipAddress };
        })
      : [{ ...docDetails.ExtUserPtr, ipAddress: docDetails?.AuditTrail[0].ipAddress }];

  // Draw a border
  page.drawRectangle({
    x: startX,
    y: startY,
    width: width - 2 * startX,
    height: height - 2 * startY,
    borderColor: borderColor,
    borderWidth: 1,
  });
  page.drawImage(pngImage, {
    x: 30,
    y: 790,
    width: 100,
    height: 25,
  });

  page.drawText(createDate, {
    x: 320,
    y: 810,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText('Certificate of Completion', {
    x: 160,
    y: 750,
    size: title,
    font: timesRomanFont,
    color: titleColor,
  });

  const underlineY = 740;
  page.drawLine({
    start: { x: 30, y: underlineY },
    end: { x: width - 30, y: underlineY },
    color: titleUnderline,
    thickness: 1,
  });

  page.drawText('Summary', {
    x: 30,
    y: 710,
    size: subtitle,
    font: timesRomanFont,
    color: titleColor,
  });

  page.drawText('Document Id :', {
    x: 30,
    y: 685,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(docDetails.objectId, {
    x: 115,
    y: 685,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawText('Document Name :', {
    x: 30,
    y: 665,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(docDetails.Name, {
    x: 140,
    y: 665,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawText('Organization :', {
    x: 30,
    y: 645,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(company, {
    x: 115,
    y: 645,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawText('Completed on :', {
    x: 30,
    y: 625,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${completedUTCtime}`, {
    x: 120,
    y: 625,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawText('Signers :', {
    x: 30,
    y: 605,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${signersCount}`, {
    x: 80,
    y: 605,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawLine({
    start: { x: 30, y: 565 },
    end: { x: width - 30, y: 565 },
    color: rgb(0.12, 0.12, 0.12),
    thickness: 0.5,
  });
  page.drawText('Recipients', {
    x: 30,
    y: 575,
    size: subtitle,
    font: timesRomanFont,
    color: titleColor,
  });
  let yPosition1 = 550;
  let yPosition2 = 530;
  let yPosition3 = 510;
  let yPosition4 = 500;
  auditTrail.forEach(x => {
    page.drawText('Name :', {
      x: 30,
      y: yPosition1,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.Name, {
      x: 75,
      y: yPosition1,
      size: text,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Email :', {
      x: 30,
      y: yPosition2,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.Email, {
      x: 75,
      y: yPosition2,
      size: text,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Accessed from :', {
      x: 30,
      y: yPosition3,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.ipAddress, {
      x: 125,
      y: yPosition3,
      size: text,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawLine({
      start: { x: 30, y: yPosition4 },
      end: { x: width - 30, y: yPosition4 },
      color: rgb(0.12, 0.12, 0.12),
      thickness: 0.5,
    });

    yPosition1 = yPosition4 - 20;
    yPosition2 = yPosition1 - 20;
    yPosition3 = yPosition2 - 20;
    yPosition4 = yPosition4 - 70;
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
