import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'node:fs';
import fontkit from '@pdf-lib/fontkit';

export default async function GenerateCertificate(docDetails) {
  const pdfDoc = await PDFDocument.create();
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = fs.readFileSync('./font/times.ttf'); //
  pdfDoc.registerFontkit(fontkit);
  const timesRomanFont = await pdfDoc.embedFont(fontBytes, { subset: true });
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
  const timeText = 11;
  const textKeyColor = rgb(0.12, 0.12, 0.12);
  const textValueColor = rgb(0.3, 0.3, 0.3);
  const completedAt = new Date();
  const completedUTCtime = completedAt.toUTCString();
  const signersCount = docDetails?.Signers?.length || 1;
  const generateAt = new Date();
  const generatedUTCTime = generateAt.toUTCString();
  const generatedOn = 'Generated On ' + generatedUTCTime;
  const OriginIp = docDetails?.OriginIp || '';
  const company = docDetails?.ExtUserPtr?.Company || '';
  const createdAt = docDetails?.DocSentAt?.iso || docDetails.createdAt;
  const IsEnableOTP = docDetails?.IsEnableOTP || false;
  const auditTrail =
    docDetails?.Signers?.length > 0
      ? docDetails.AuditTrail.map(x => {
          const data = docDetails.Signers.find(y => y.objectId === x.UserPtr.objectId);
          return {
            ...data,
            ipAddress: x.ipAddress,
            SignedOn: x?.SignedOn || generatedUTCTime,
            ViewedOn: x?.ViewedOn || x?.SignedOn || generatedUTCTime,
            Signature: x?.Signature || '',
          };
        })
      : [
          {
            ...docDetails.ExtUserPtr,
            ipAddress: docDetails?.AuditTrail[0].ipAddress,
            SignedOn: docDetails?.AuditTrail[0]?.SignedOn || generatedUTCTime,
            ViewedOn:
              docDetails?.AuditTrail[0]?.ViewedOn ||
              docDetails?.AuditTrail[0]?.SignedOn ||
              generatedUTCTime,
            Signature: docDetails?.AuditTrail[0]?.Signature || '',
          },
        ];

  const half = width / 2;
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

  page.drawText(generatedOn, {
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
  page.drawText('Created on :', {
    x: 30,
    y: 625,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${new Date(createdAt).toUTCString()}`, {
    x: 105,
    y: 625,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('Completed on :', {
    x: 30,
    y: 605,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${completedUTCtime}`, {
    x: 125,
    y: 605,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('Signers :', {
    x: 30,
    y: 585,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });

  page.drawText(`${signersCount}`, {
    x: 80,
    y: 585,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('Document originator', {
    x: 30,
    y: 565,
    size: 17,
    font: timesRomanFont,
    color: titleColor,
  });
  page.drawText('Name :', {
    x: 60,
    y: 545,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(`${docDetails.ExtUserPtr.Name}`, {
    x: 105,
    y: 545,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('Email :', {
    x: 60,
    y: 525,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(`${docDetails.ExtUserPtr.Email}`, {
    x: 105,
    y: 525,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });
  page.drawText('IP address :', {
    x: 60,
    y: 505,
    size: text,
    font: timesRomanFont,
    color: textKeyColor,
  });
  page.drawText(`${OriginIp}`, {
    x: 130,
    y: 505,
    size: text,
    font: timesRomanFont,
    color: textValueColor,
  });

  page.drawLine({
    start: { x: 30, y: 495 },
    end: { x: width - 30, y: 495 },
    color: rgb(0.12, 0.12, 0.12),
    thickness: 0.5,
  });
  let yPosition1 = 475;
  let yPosition2 = 455;
  let yPosition3 = 435;
  let yPosition4 = 415;
  let yPosition5 = 395;
  let yPosition6 = 360;
  auditTrail.slice(0, 3).forEach(async (x, i) => {
    const embedPng = x.Signature ? await pdfDoc.embedPng(x.Signature) : '';
    page.drawText(`Signer ${i + 1}`, {
      x: 30,
      y: yPosition1,
      size: subtitle,
      font: timesRomanFont,
      color: titleColor,
    });
    page.drawText('Name :', {
      x: 30,
      y: yPosition2,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.Name, {
      x: 75,
      y: yPosition2,
      size: text,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Viewed on :', {
      x: half + 55,
      y: yPosition2,
      size: timeText,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(`${new Date(x.ViewedOn).toUTCString()}`, {
      x: half + 112,
      y: yPosition2,
      size: timeText,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Email :', {
      x: 30,
      y: yPosition3,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.Email, {
      x: 75,
      y: yPosition3,
      size: text,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('Signed on :', {
      x: half + 55,
      y: yPosition3 + 5,
      size: timeText,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(`${new Date(x.SignedOn).toUTCString()}`, {
      x: half + 108,
      y: yPosition3 + 5,
      size: timeText,
      font: timesRomanFont,
      color: textValueColor,
    });

    page.drawText('IP address :', {
      x: 30,
      y: yPosition4,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawText(x?.ipAddress, {
      x: 100,
      y: yPosition4,
      size: 13,
      font: timesRomanFont,
      color: textValueColor,
    });
    if (IsEnableOTP) {
      page.drawText('Security level :', {
        x: half + 55,
        y: yPosition4 + 10,
        size: timeText,
        font: timesRomanFont,
        color: textKeyColor,
      });
      page.drawText('Email, OTP Auth', {
        x: half + 125,
        y: yPosition4 + 10,
        size: timeText,
        font: timesRomanFont,
        color: textValueColor,
      });
    }
    page.drawText('Signature :', {
      x: 30,
      y: yPosition5,
      size: text,
      font: timesRomanFont,
      color: textKeyColor,
    });

    page.drawRectangle({
      x: 98,
      y: yPosition5 - 30,
      width: 104,
      height: 44,
      borderColor: rgb(0.22, 0.18, 0.47),
      borderWidth: 1,
    });
    if (embedPng) {
      page.drawImage(embedPng, {
        x: 100,
        y: yPosition5 - 27,
        width: 100,
        height: 40,
      });
    }
    page.drawLine({
      start: { x: 30, y: yPosition6 },
      end: { x: width - 30, y: yPosition6 },
      color: rgb(0.12, 0.12, 0.12),
      thickness: 0.5,
    });

    yPosition1 = yPosition6 - 20;
    yPosition2 = yPosition1 - 20;
    yPosition3 = yPosition2 - 20;
    yPosition4 = yPosition3 - 20;
    yPosition5 = yPosition4 - 20;
    yPosition6 = yPosition6 - 140;
  });

  if (auditTrail.length > 3) {
    let currentPageIndex = 1;
    let currentPage = page;
    auditTrail.slice(3).forEach(async (x, i) => {
      const embedPng = x.Signature ? await pdfDoc.embedPng(x.Signature) : '';

      // Calculate remaining space on current page
      const remainingSpace = yPosition6;

      // If there's not enough space for the next entry, create a new page
      if (remainingSpace < 90) {
        // Adjust the value as needed
        currentPageIndex++;
        currentPage = pdfDoc.addPage();
        currentPage.drawRectangle({
          x: startX,
          y: startY,
          width: width - 2 * startX,
          height: height - 2 * startY,
          borderColor: borderColor,
          borderWidth: 1,
        });
        yPosition1 = currentPage.getHeight() - 40;
        yPosition2 = yPosition1 - 20;
        yPosition3 = yPosition2 - 20;
        yPosition4 = yPosition3 - 20;
        yPosition5 = yPosition4 - 20;
        yPosition6 = currentPage.getHeight() - 160;
      }

      currentPage.drawText(`Signer ${4 + i}`, {
        x: 30,
        y: yPosition1,
        size: subtitle,
        font: timesRomanFont,
        color: titleColor,
      });
      currentPage.drawText('Name :', {
        x: 30,
        y: yPosition2,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });

      currentPage.drawText(x?.Name, {
        x: 75,
        y: yPosition2,
        size: text,
        font: timesRomanFont,
        color: textValueColor,
      });

      currentPage.drawText('Viewed on :', {
        x: half,
        y: yPosition2,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });

      currentPage.drawText(`${new Date(x.ViewedOn).toUTCString()}`, {
        x: half + 75,
        y: yPosition2,
        size: text,
        font: timesRomanFont,
        color: textValueColor,
      });

      currentPage.drawText('Email :', {
        x: 30,
        y: yPosition3,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });

      currentPage.drawText(x?.Email, {
        x: 75,
        y: yPosition3,
        size: text,
        font: timesRomanFont,
        color: textValueColor,
      });

      currentPage.drawText('Signed on :', {
        x: half,
        y: yPosition3,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });

      currentPage.drawText(`${new Date(x.SignedOn).toUTCString()}`, {
        x: half + 70,
        y: yPosition3,
        size: text,
        font: timesRomanFont,
        color: textValueColor,
      });

      currentPage.drawText('IP address :', {
        x: 30,
        y: yPosition4,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });

      currentPage.drawText(x?.ipAddress, {
        x: 100,
        y: yPosition4,
        size: text,
        font: timesRomanFont,
        color: textValueColor,
      });
      currentPage.drawText('Security level :', {
        x: half,
        y: yPosition4,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });

      currentPage.drawText(`Email, OTP Auth`, {
        x: half + 90,
        y: yPosition4,
        size: text,
        font: timesRomanFont,
        color: textValueColor,
      });

      currentPage.drawText('Signature :', {
        x: 30,
        y: yPosition5,
        size: text,
        font: timesRomanFont,
        color: textKeyColor,
      });
      currentPage.drawRectangle({
        x: 98,
        y: yPosition5 - 27,
        width: 104,
        height: 44,
        borderColor: rgb(0.22, 0.18, 0.47),
        borderWidth: 1,
      });
      if (embedPng) {
        currentPage.drawImage(embedPng, {
          x: 100,
          y: yPosition5 - 25,
          width: 100,
          height: 40,
        });
      }

      currentPage.drawLine({
        start: { x: 30, y: yPosition6 },
        end: { x: width - 30, y: yPosition6 },
        color: rgb(0.12, 0.12, 0.12),
        thickness: 0.5,
      });

      // Update y positions for the next entry
      yPosition1 = yPosition6 - 20;
      yPosition2 = yPosition1 - 20;
      yPosition3 = yPosition2 - 20;
      yPosition4 = yPosition3 - 20;
      yPosition5 = yPosition4 - 20;
      yPosition6 = yPosition6 - 140;
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
