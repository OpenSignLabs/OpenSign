import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import { convertUTCToTimezone, getTimestampInTimezone } from '../../../Utils.js';
import geoip from 'geoip-lite';
import { STRINGS } from '../../../constants/strings.js';

export default async function GenerateCertificate(docDetails, userIP) {
  const pdfDoc = await PDFDocument.create();
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = fs.readFileSync('./font/times.ttf'); //
  pdfDoc.registerFontkit(fontkit);
  const timesRomanFont = await pdfDoc.embedFont(fontBytes, { subset: true });
  const pngUrl = fs.readFileSync('./logo.png').buffer;
  const pngImage = await pdfDoc.embedPng(pngUrl);
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const startX = 10;
  const startY = 10;
  const borderColor = rgb(0.12, 0.12, 0.12);
  const titleColor = rgb(0, 0.2, 0.4); //rgb(0, 0.53, 0.71);
  const titleUnderline = rgb(0, 0.2, 0.4); // rgb(0.12, 0.12, 0.12);
  const title = 25;
  const subtitle = 20;
  const text = 12;
  const timeText = 11;
  const textKeyColor = rgb(0.12, 0.12, 0.12);
  const textValueColor = rgb(0.3, 0.3, 0.3);
  const completedAt = new Date();
  const OriginIp = docDetails?.OriginIp || '';
  const geo = geoip.lookup(
    process.env.NODE_ENV === STRINGS.ENVIRONMENT.DEVELOPMENT ? process.env.TEST_IP : userIP
  );
  console.log('\n----userIP---in generateCert--', userIP);
  console.log('\n----geo---in generateCert--', geo);
  const utcTime = getTimestampInTimezone(geo.timezone, true); // convertUtcToSpecificTimezone(new Date().toISOString(), userTimezone); //getFormattedLocalTime(userTimezone);//`${new Date().toISOString().split('.')[0]} (UTC)`;
  const completedUTCtime = utcTime;
  const signersCount = docDetails?.Signers?.length || 1;
  const generateAt = new Date();
  const generatedUTCTime = utcTime;
  const generatedOn = 'Generated On ' + utcTime;
  const company = docDetails?.ExtUserPtr?.Company || '';
  const createdAt = docDetails?.DocSentAt?.iso || docDetails.createdAt;
  const userTimezoneCreatedAt = getTimestampInTimezone(geo.timezone, true, createdAt); //convertUtcToSpecificTimezone(createdAt, userTimezone);
  const IsEnableOTP = docDetails?.IsEnableOTP || false;
  const padding = 6; // Reduced padding
  const topPadding = 20;
  const borderPadding = 15; // Slightly reduced padding inside the border
  const bottomPadding = 40; // Increased bottom padding to prevent cutoff
  const bottomPadding_10 = 10;
  const lineSpacing = text + padding;
  const timezoneAbbr = getTimestampInTimezone(geo.timezone, true, null, true);

  let currentY = height - startY - topPadding - borderPadding;
  let initialYPosition = currentY; // Adjusted for border padding

  const auditTrail =
    docDetails?.Signers?.length > 0
      ? docDetails.AuditTrail.map((x, i) => {
          const { Signers, AdditionalUserInfo, Placeholders } = docDetails;
          const data = Signers.find(y => y.objectId === x.UserPtr.objectId);
          const additionalInfo = AdditionalUserInfo[i];
          const placeholdersInfo = Placeholders[i];
          const userId = x.UserPtr.objectId;
          // Check if current userId matches placeholdersInfo or additionalInfo signer object ID
          const isPlaceholderSigner = userId === placeholdersInfo?.signerObjId;
          const isAdditionalUserInfoSigner = userId === additionalInfo?.signerObjId;
          return {
            ...data,
            ipAddress: x.ipAddress,
            SignedOn: x?.SignedOn || generatedUTCTime,
            ViewedOn: x?.ViewedOn || x?.SignedOn || generatedUTCTime,
            Signature: x?.Signature || '',
            Initials: x?.Initials || '',
            Role: isPlaceholderSigner ? placeholdersInfo.Role : '',
            TermsCond: isAdditionalUserInfoSigner ? additionalInfo.termsCond : '',
            TermsCondAcceptedOn: isAdditionalUserInfoSigner
              ? additionalInfo.termsCondAcceptedOn
              : '',
            OtpProtected: isAdditionalUserInfoSigner
              ? additionalInfo.otpRequired
                ? 'Yes'
                : 'No'
              : 'No',
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
  // Draw border function with border and bottom padding
  const drawBorder = page => {
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    page.drawRectangle({
      x: startX, // Starting X position
      y: startY, // Starting Y position
      width: pageWidth - 2 * startX, // Page width minus padding from both sides
      height: pageHeight - 2 * startY, // Page height minus padding from top and bottom
      borderColor: borderColor, // Set border color
      borderWidth: 1, // Set border width
    });
  };

  function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // Draw border on the first page
  drawBorder(page);

  // Draw logo
  page.drawImage(pngImage, {
    x: startX + 15,
    y: currentY - 30,
    width: 100,
    height: 25,
  });
  currentY -= 50;

  page.drawText(generatedOn, {
    x: startX + 310,
    y: currentY + 50,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.12, 0.12, 0.12),
  });
  currentY -= padding + 20;

  page.drawText('Certificate of Completion', {
    x: startX + 130,
    y: currentY,
    size: title,
    font: timesRomanFont,
    color: titleColor,
  });
  currentY -= padding + 2;

  page.drawLine({
    start: { x: startX + borderPadding, y: currentY },
    end: { x: width - startX - borderPadding, y: currentY },
    color: titleUnderline,
    thickness: 1,
  });
  currentY -= padding + title;

  // "Summary" section title
  page.drawText('Summary', {
    x: startX + borderPadding,
    y: currentY,
    size: subtitle,
    font: timesRomanFont,
    color: titleColor,
  });
  currentY -= padding + subtitle;

  // Document details
  const textItems = [
    { label: 'Document Id :', value: docDetails.objectId },
    { label: 'Document Name :', value: docDetails.Name },
    { label: 'Organization :', value: company },
    { label: 'Created on :', value: userTimezoneCreatedAt },
    { label: 'Completed on :', value: completedUTCtime },
    { label: 'Signers :', value: signersCount.toString() },
    { label: 'Document originator', value: '' },
    { label: 'Name :', value: docDetails.ExtUserPtr.Name },
    { label: 'Email :', value: docDetails.ExtUserPtr.Email },
    { label: 'IP address :', value: OriginIp },
  ];

  textItems.forEach(item => {
    const isItemValueNull = item.value == '' ? true : false;
    if (isItemValueNull) {
      currentY -= padding * 2;
    }
    page.drawText(item.label, {
      x: startX + borderPadding,
      y: currentY,
      size: isItemValueNull ? subtitle : text,
      font: timesRomanFont,
      color: isItemValueNull ? titleColor : borderColor,
    });
    if (isItemValueNull) {
      currentY -= padding * 2;
    }
    if (item.value) {
      page.drawText(item.value, {
        x: startX + 120 + borderPadding,
        y: currentY,
        size: text,
        font: timesRomanFont,
        color: titleColor,
      });
    }
    currentY -= padding + text;
  });

  // Draw separator line after Document originator section
  page.drawLine({
    start: { x: startX + borderPadding, y: currentY },
    end: { x: width - startX - borderPadding, y: currentY },
    color: borderColor,
    thickness: 0.5,
  });
  currentY -= padding * 2;

  // Adjust starting Y position for "Signer" section to prevent overlap
  const signerSectionStartY = currentY - 20; // Added space after "Document originator" section

  // Pagination and audit trail section
  initialYPosition = signerSectionStartY;

  const createNewPage = () => {
    page = pdfDoc.addPage();
    drawBorder(page); // Draw border on every new page
    initialYPosition = page.getHeight() - startY - topPadding - borderPadding;
  };

  // Loop through audit trail
  await Promise.all(
    auditTrail.slice(0, 3).map(async (x, i) => {
      if (initialYPosition < bottomPadding + borderPadding) {
        createNewPage();
      }

      const embedPng = x.Signature ? await pdfDoc.embedPng(x.Signature) : '';
      const embedInitialsPng = x.Initials ? await pdfDoc.embedPng(x.Initials) : '';

      // Draw signer role
      page.drawText(`Signer ${i + 1} - ${x.Role}`, {
        x: startX + borderPadding,
        y: initialYPosition,
        size: subtitle,
        font: timesRomanFont,
        color: titleColor,
      });
      page.drawText('Viewed on:', {
        x: half + 55,
        y: initialYPosition,
        size: timeText,
        font: timesRomanFont,
        color: textKeyColor,
      });

      page.drawText(`${x.ViewedOn}`, {
        x: half + 112,
        y: initialYPosition,
        size: timeText,
        font: timesRomanFont,
        color: textValueColor,
      });
      initialYPosition -= lineSpacing;
      const termsLines = wrapText(x?.TermsCond || '', timesRomanFont, text, width - startX - 150);
      if (initialYPosition * (termsLines.length + 2) < text) {
        createNewPage();
      }
      page.drawText(`Terms and Conditions:`, {
        x: startX + borderPadding,
        y: initialYPosition,
        size: text,
        font: timesRomanFont,
        color: borderColor,
      });

      termsLines.forEach(line => {
        if (initialYPosition < text) {
          createNewPage();
        }
        page.drawText(line, {
          x: startX + 120 + borderPadding,
          y: initialYPosition,
          size: text,
          font: timesRomanFont,
          color: titleColor,
        });
        initialYPosition -= lineSpacing; // Move Y-coordinate for the next line
      });
      if (initialYPosition - lineSpacing < text) {
        createNewPage();
      }

      page.drawText(`OTP Protected:`, {
        x: startX + borderPadding,
        y: initialYPosition,
        size: text,
        font: timesRomanFont,
        color: borderColor,
      });
      page.drawText(x?.OtpProtected, {
        x: startX + 120 + borderPadding,
        y: initialYPosition,
        size: text,
        font: timesRomanFont,
        color: titleColor,
      });
      initialYPosition -= lineSpacing;

      let signatureIndex = 0; // Counter for signatures
      let initialsIndex = 0; // Counter for initials

      // Loop through placeholders and draw details
      docDetails.Placeholders.forEach(async x2 => {
        if (x.objectId === x2.signerObjId) {
          x2.placeHolder.forEach(placeholder => {
            placeholder.pos.forEach(pos => {
              const { dateAdded, type } = pos;

              if (type === 'signature' || type === 'initials') {
                if (initialYPosition < bottomPadding + borderPadding) {
                  createNewPage();
                }

                // Increment the respective counter
                const displayIndex = type === 'signature' ? ++signatureIndex : ++initialsIndex;

                // Draw Name
                page.drawText('Name:', {
                  x: startX + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: borderColor,
                });
                page.drawText(x?.Name, {
                  x: startX + 120 + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: titleColor,
                });
                page.drawText('Page Number:', {
                  x: half + 55,
                  y: initialYPosition,
                  size: timeText,
                  font: timesRomanFont,
                  color: textKeyColor,
                });

                page.drawText(`${placeholder.pageNumber}`, {
                  x: half + 122,
                  y: initialYPosition,
                  size: timeText,
                  font: timesRomanFont,
                  color: textValueColor,
                });

                initialYPosition -= lineSpacing;

                // Draw Email
                page.drawText('Email:', {
                  x: startX + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: borderColor,
                });
                page.drawText(x?.Email, {
                  x: startX + 120 + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: titleColor,
                });
                initialYPosition -= lineSpacing;

                // Draw IP Address
                page.drawText('IP Address:', {
                  x: startX + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: borderColor,
                });
                page.drawText(x?.ipAddress, {
                  x: startX + 120 + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: titleColor,
                });
                initialYPosition -= lineSpacing;

                // Draw Signed On date
                page.drawText('Signed on:', {
                  x: startX + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: borderColor,
                });
                page.drawText(`${getTimestampInTimezone(geo.timezone, true, dateAdded)}`, {
                  x: startX + 120 + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: titleColor,
                });
                initialYPosition -= lineSpacing;
                const textHeight = 10; // Height of the text
                const rectangleHeight = 44; // Height of the rectangle
                const rectangleWidth = 104; // Width of the rectangle
                const spacingBetweenSections = 5; // Space between the bottom of the rectangle and the next section
                const totalHeight = textHeight + rectangleHeight; // Total height needed for this section
                if (initialYPosition - totalHeight < bottomPadding) {
                  // Not enough space on the current page, add a new page
                  createNewPage();
                }

                // Draw Signature/Initials
                page.drawText(`${type.charAt(0).toUpperCase() + type.slice(1)} ${displayIndex}:`, {
                  x: startX + borderPadding,
                  y: initialYPosition,
                  size: text,
                  font: timesRomanFont,
                  color: borderColor,
                });

                const rectX = startX + 120 + borderPadding; // X position of the rectangle
                const rectY = initialYPosition - rectangleHeight + 10; // Adjust rectangle Y position to align with text
                page.drawRectangle({
                  x: rectX,
                  y: rectY, // Align bottom of rectangle with current Y position
                  width: rectangleWidth,
                  height: rectangleHeight,
                  borderColor: rgb(0.22, 0.18, 0.47),
                  borderWidth: 1,
                });

                if (embedPng) {
                  const imageWidth = 100; // Width of the image
                  const imageHeight = 40; // Height of the image
                  const imageX = rectX + (104 - imageWidth) / 2; // Center the image horizontally in the rectangle
                  const imageY = rectY + (rectangleHeight - imageHeight) / 2; // Center the image vertically in the rectangle

                  page.drawImage(type === 'signature' ? embedPng : embedInitialsPng, {
                    x: imageX,
                    y: imageY,
                    width: imageWidth,
                    height: imageHeight,
                  });
                }

                // initialYPosition -= lineSpacing * 2;
                // Update the Y position for the next entry
                // initialYPosition -= requiredSpace; // Adjust as needed for spacing between entries
                initialYPosition -= totalHeight;
                // Add small space after the signature section
                // initialYPosition -= 10;
              }
            });
          });
        }
      });

      // Draw horizontal line separator
      page.drawLine({
        start: { x: startX + borderPadding, y: initialYPosition - lineSpacing },
        end: { x: width - startX - borderPadding, y: initialYPosition - lineSpacing },
        color: rgb(0.12, 0.12, 0.12),
        thickness: 0.5,
      });

      initialYPosition -= lineSpacing * 2;
    })
  );

  initialYPosition -= lineSpacing;

  // Draw "Document History" header
  page.drawText(`Document History`, {
    x: startX + borderPadding,
    y: initialYPosition,
    size: subtitle,
    font: timesRomanFont,
    color: titleColor,
  });
  initialYPosition -= lineSpacing;

  page.drawText('Date', {
    x: startX + borderPadding,
    y: initialYPosition,
    size: text,
    font: timesRomanFont,
    color: borderColor,
  });

  page.drawText('Details', {
    x: half + 55, // Adjust this value to match where the details should start
    y: initialYPosition,
    size: timeText,
    font: timesRomanFont,
    color: textKeyColor,
  });

  // Adjust Y-position for Document History content
  initialYPosition -= lineSpacing;

  docDetails.DocumentHistory.forEach(item => {
    const { details, timestamp, createdAt } = item;
    const userTimezoneCreatedAt = convertUTCToTimezone(createdAt, geo.timezone);
    const modifiedCreatedAt = `${userTimezoneCreatedAt} ${timezoneAbbr}`;

    // Wrap text for 'details' to avoid overflow within the defined width
    const timestampX = startX + borderPadding; // Starting X position for 'timestamp'
    const timestampWidth = timesRomanFont.widthOfTextAtSize(timestamp, text); // Width of 'timestamp'
    const detailsX = timestampX + timestampWidth + 20; // Small gap after 'timestamp'
    const maxDetailsWidth = width - detailsX - borderPadding; // Maximum width for 'details' text

    // Ensure text wrapping within the available width
    const docHistoryMsg = wrapText(details.message || '', timesRomanFont, text, maxDetailsWidth);

    // Check if a new page is needed before starting this entry
    if (initialYPosition - text * (docHistoryMsg.length + 1) < bottomPadding_10) {
      createNewPage();
    }

    // Draw timestamp
    page.drawText(modifiedCreatedAt, {
      x: timestampX,
      y: initialYPosition,
      size: text,
      font: timesRomanFont,
      color: titleColor,
    });

    // Draw wrapped details text
    docHistoryMsg.forEach((line, idx) => {
      // Check for space before drawing each line
      if (initialYPosition < bottomPadding_10) {
        createNewPage();
      }

      // Draw the current line of the details message
      page.drawText(line, {
        x: detailsX, // Align all lines under the "Details" column
        y: initialYPosition,
        size: text,
        font: timesRomanFont,
        color: titleColor,
      });

      // Move down for the next line
      initialYPosition -= text;
    });

    // Add spacing between entries to avoid overlap
    initialYPosition -= text;
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

      currentPage.drawText(`${x.SignedOn}`, {
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
