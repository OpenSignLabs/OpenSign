import moment from "moment";
import { degrees } from "pdf-lib";
import {
  isMobile,
  drawWidget,
  textWidget,
  textInputWidget,
  radioButtonWidget,
  cellsWidget,
  randomId
} from "./UtilsPart01.js";
import { isEmptyValue } from "./UtilsPart10.js";
import { placeholderWidth, placeholderHeight } from "./placeholderTools.js";
import { compensateRotation } from "./UtilsPart14.js";
import { getWidgetPosition } from "./UtilsPart15.js";
import { getWidgetsFontColor, forceBreakLongWord } from "./UtilsPart10.js";
import { changeDateToMomentFormat } from "./UtilsPart03.js";
import { isBase64 } from "./UtilsPart10.js";

/** Draw one widget into its PDF page while preserving its field-specific layout. */
export const drawWidgetPosition = async ({
  id,
  position,
  images,
  ImgTypeWidget,
  pdfDoc,
  page,
  pageNo,
  scale,
  font,
  form,
  getSize
}) => {
  const isTextTypeWidget = [
    textWidget,
    textInputWidget,
    cellsWidget,
    "name",
    "company",
    "job title",
    "date",
    "email"
  ].includes(position.type);

  let img;
  if (ImgTypeWidget.includes(position.type)) {
    if (images[id].mimetype === "image/png") {
      img = await pdfDoc.embedPng(images[id].arrayBuffer);
    } else {
      img = await pdfDoc.embedJpg(images[id].arrayBuffer);
    }
  } else if (!position.type) {
    //  to handle old widget when only stamp and signature are exists
    if (images[id].mimetype === "image/png") {
      img = await pdfDoc.embedPng(images[id].arrayBuffer);
    } else {
      img = await pdfDoc.embedJpg(images[id].arrayBuffer);
    }
  }
  let widgetWidth, widgetHeight;
  widgetWidth = placeholderWidth(position);
  widgetHeight = placeholderHeight(position);
  const xPos = (position) => {
    const resizePos = position.xPosition;
    //first two condition handle to old data already saved from mobile view which scale point diffrent
    if (isMobile && position.isMobile) {
      //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
      const x = resizePos * (position.scale / scale);
      return x * scale;
    } else if (position.isMobile && position.scale) {
      const x = resizePos * position.scale;
      return x;
    } else {
      return resizePos;
    }
  };
  const yPos = (position) => {
    const resizePos = position.yPosition;

    if (position.isMobile && position.scale) {
      if (position.IsResize) {
        const y = resizePos * position.scale;
        return y;
      } else {
        const y = resizePos * position.scale;
        return y;
      }
    } else {
      const yPosition = isTextTypeWidget ? resizePos + 6 : resizePos;
      return yPosition;
    }
  };
  const color = position?.options?.fontColor;
  const updateColorInRgb = getWidgetsFontColor(color);
  const fontSize = parseInt(position?.options?.fontSize || 12);
  if (position.type === "checkbox") {
    // Determine layout mode: 'vertical' (default) or 'horizontal'
    const isHorizontal =
      position?.options?.layout === "horizontal" ? true : false;
    // Initial “cursor” positions
    let currentX = xPos(position);
    let currentY = yPos(position) + 2;
    // Size and spacing settings
    const checkboxSize = fontSize - 1; // checkbox diameter
    const checkboxTextGapFromLeft = fontSize + 3.4; // gap between box and its label
    const verticalGap = fontSize + 5.5; // gap between two options (vertical layout)
    let horizontalGap = 0; // will compute after drawing each label
    if (position?.options?.values?.length > 0) {
      position.options.values.forEach((item, ind) => {
        if (ind > 0) {
          if (isHorizontal) {
            currentX += horizontalGap;
          } else {
            currentY += verticalGap;
          }
        }
        let isCheck = false;
        if (
          position.options.response &&
          position.options.response?.length > 0
        ) {
          isCheck = position.options.response.includes(ind);
        } else if (position.options.defaultValue) {
          isCheck = position.options.defaultValue.includes(ind);
        }

        if (!position.options.isHideLabel) {
          const labelX = currentX + checkboxTextGapFromLeft;
          const labelY = currentY - 3;

          const optionsPosition = compensateRotation(
            page.getRotation().angle,
            labelX,
            labelY,
            1,
            getSize,
            fontSize,
            updateColorInRgb,
            font,
            page
          );
          page.drawText(item, optionsPosition);
        }
        const checkboxRandomId = "checkbox" + randomId();
        const checkbox = form.createCheckBox(checkboxRandomId);
        let checkboxObj = {
          x: currentX,
          y: currentY,
          width: checkboxSize,
          height: checkboxSize
        };
        checkboxObj = getWidgetPosition(page, checkboxObj, 1, getSize);
        checkbox.addToPage(page, checkboxObj);
        // 5. Check or uncheck as needed, then make read‐only
        if (isCheck) {
          checkbox.check();
        } else {
          checkbox.uncheck();
        }
        checkbox.enableReadOnly();
        // 6. If horizontal layout, compute how far to shift next checkbox‐circle
        if (isHorizontal) {
          // Measure the width of this label text at `fontSize`
          const textWidth = font.widthOfTextAtSize(item, fontSize);
          // Next checkbox should come after: [box] + gap + [label text] + extra 10pt padding
          const gap = position.options?.isHideLabel
            ? checkboxTextGapFromLeft - 5
            : checkboxTextGapFromLeft + textWidth;
          horizontalGap = checkboxSize + gap;
        }
      });
    }
  } else if (isTextTypeWidget) {
    let textContent = "";
    if (!isEmptyValue(position?.options?.response)) {
      if (position.type === "date" && position.options?.response === "today") {
        const getFormat = changeDateToMomentFormat(
          position?.options?.validation?.format
        );
        textContent = moment().format(getFormat);
      } else {
        textContent = position.options?.response;
      }
    } else if (!isEmptyValue(position?.options?.defaultValue)) {
      textContent = position?.options?.defaultValue?.toString();
    }
    if (position.type === cellsWidget) {
      const cellCount = position?.options?.cellCount || textContent.length || 1;
      const charWidth = widgetWidth / cellCount;
      const y = yPos(position) - 4;
      for (let i = 0; i < cellCount; i++) {
        const ch = textContent[i] || "";
        const charX =
          xPos(position) +
          charWidth * i +
          (charWidth - font.widthOfTextAtSize(ch, fontSize)) / 2;
        const textPosition = compensateRotation(
          page.getRotation().angle,
          charX,
          y,
          1,
          getSize,
          fontSize,
          updateColorInRgb,
          font,
          page
        );
        if (ch) page.drawText(ch, textPosition);
      }
    } else {
      const fixedWidth = widgetWidth; // Set your fixed
      textContent = textContent?.toString();
      const isNewOnEnterLineExist = textContent?.includes("\n");

      // Function to break text into lines based on the fixed width
      const NewbreakTextIntoLines = (textContent, width) => {
        const lines = [];
        let currentLine = "";

        const words = textContent?.split(" ");
        for (let word of words) {
          const testLine = currentLine ? currentLine + " " + word : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth <= width) {
            currentLine = testLine;
          } else {
            // If single long word
            if (font.widthOfTextAtSize(word, fontSize) > width) {
              // Break a long word into smaller parts character-by-character
              const brokenParts = forceBreakLongWord(
                word,
                width,
                font,
                fontSize
              );

              // push currentLine before breaking word
              if (currentLine.trim()) lines.push(currentLine.trim());

              // push ALL broken parts in order
              brokenParts.forEach((p) => lines.push(p));

              currentLine = "";
            } else {
              // push current line and start new
              if (currentLine.trim()) lines.push(currentLine.trim());
              currentLine = word;
            }
          }
        }
        if (currentLine.trim()) lines.push(currentLine.trim());
        return lines;
      };
      // Function to break text into lines based on when user go next line on press enter button
      const breakTextIntoLines = (textContent, width) => {
        const finalLines = [];
        const paragraphs = textContent.split("\n"); // preserve user order
        for (const para of paragraphs) {
          const lineWidth = font.widthOfTextAtSize(para, fontSize);
          //checking string length to container width
          //if string length is less then container width it means user press enter button
          if (lineWidth <= width) {
            // user forced newline
            finalLines.push(para);
          } else {
            // auto wrap paragraph
            finalLines.push(...NewbreakTextIntoLines(para, width));
          }
        }

        return finalLines;
      };
      //check if text content have `\n` string it means user press enter to go next line and handle condition
      //else auto adjust text content according to container width
      const lines = isNewOnEnterLineExist
        ? breakTextIntoLines(textContent, fixedWidth)
        : NewbreakTextIntoLines(textContent, fixedWidth);
      // Set initial y-coordinate for the first line
      let x = xPos(position);
      let y = yPos(position) - 4;
      // Embed each line on the page
      for (const line of lines) {
        const textPosition = compensateRotation(
          page.getRotation().angle,
          x,
          y,
          1,
          getSize,
          fontSize,
          updateColorInRgb,
          font,
          page
        );
        page.drawText(line, textPosition);
        y += 18; // Adjust the line height as needed
      }
    }
  } else if (position.type === "dropdown") {
    const dropdownRandomId = "dropdown" + randomId();
    const dropdown = form.createDropdown(dropdownRandomId);
    dropdown.addOptions(position?.options?.values);
    // A multi-select field stores an array, so every selected value has
    // to be applied at once.
    if (position?.options?.isMultiSelect && dropdown.enableMultiselect) {
      dropdown.enableMultiselect();
    }
    const toValues = (value) => {
      if (Array.isArray(value)) return value.filter((v) => v != null);
      return value ? [value] : [];
    };
    const selectedValues = toValues(position?.options?.response).length
      ? toValues(position?.options?.response)
      : toValues(position?.options?.defaultValue);
    if (selectedValues.length > 0) {
      const allowed = (position?.options?.values || []).map((v) =>
        v == null
          ? ""
          : typeof v === "object"
            ? String(v?.name ?? v?.value ?? "")
            : String(v)
      );
      const picked = selectedValues
        .map((v) =>
          v == null
            ? ""
            : typeof v === "object"
              ? String(v?.name ?? v?.value ?? "")
              : String(v)
        )
        .filter((v) => v && allowed.includes(v));
      if (picked.length > 0) {
        try {
          dropdown.select(...picked);
        } catch (e) {
          // ignore values pdf-lib refuses; keep the rest of the embed
        }
      }
    }
    // Define the default appearance string
    // Example format: `/FontName FontSize Tf 0 g` where:
    // - `/FontName` is the name of the font (e.g., `/Helv` for Helvetica)
    // - `FontSize` is the size you want to set (e.g., 12)
    // - `Tf` specifies the font and size
    // - `0 g` sets the text color to black
    const defaultAppearance = `/Helv ${fontSize} Tf 0 g`;
    // Set the default appearance for the dropdown field
    dropdown.acroField.setDefaultAppearance(defaultAppearance);
    dropdown.setFontSize(fontSize);
    const dropdownObj = {
      x: xPos(position),
      y: yPos(position),
      width: widgetWidth,
      height: widgetHeight
    };
    const dropdownOption = getWidgetPosition(page, dropdownObj, 1, getSize);
    const dropdownSelected = {
      ...dropdownOption,
      font: font,
      textColor: updateColorInRgb
    };
    dropdown.defaultUpdateAppearances(font);
    dropdown.addToPage(page, dropdownSelected);
    dropdown.enableReadOnly();
  } else if (position.type === radioButtonWidget) {
    const radioRandomId = "radio" + randomId();
    const radioGroup = form.createRadioGroup(radioRandomId);
    //getting radio buttons options text font size
    const optionsFontSize = fontSize; // font size for option text
    const radioTextGapFromLeft = fontSize + 3; // gap between circle and its label
    const radioSize = fontSize; // circle diameter (square of width×height)
    // Initial “cursor” positions (from your existing helpers)
    let currentX = xPos(position) + 2;
    let currentY = yPos(position) + 3;
    // Vertical gap between two options
    const verticalGap = fontSize + 5;
    // We’ll compute horizontalGap on the fly—after drawing each label
    // Initialize to zero (will be set after first option is placed)
    let horizontalGap = 0;
    // Determine layout mode: 'vertical' or 'horizontal'.
    // (You mentioned “add one variable called layout” – here we read it from position.layout.)
    const isHorizontal =
      position?.options?.layout === "horizontal" ? true : false;
    const asOptionText = (value) =>
      value == null
        ? ""
        : typeof value === "string"
          ? value
          : typeof value === "object"
            ? String(value?.name ?? value?.value ?? "")
            : String(value);
    const radioOptions = (position?.options?.values || []).map(asOptionText);
    // Loop through each option in the group
    if (radioOptions.length > 0) {
      radioOptions.forEach((item, ind) => {
        // 1. Advance cursor on second+ iteration
        if (ind > 0) {
          if (isHorizontal) {
            // Move to the right by horizontalGap
            currentX += horizontalGap;
          } else {
            // Move down by verticalGap (vertical stacking)
            currentY += verticalGap;
          }
        }
        // 2. Draw the label text (if not hidden)
        if (!position?.options?.isHideLabel) {
          // Compute where to draw the text (just to the right of the circle)
          const labelX = currentX + radioTextGapFromLeft;
          const labelY = currentY - 2;
          const optionsPosition = compensateRotation(
            page.getRotation().angle,
            labelX,
            labelY,
            1,
            getSize,
            optionsFontSize,
            updateColorInRgb,
            font,
            page
          );

          page.drawText(item, optionsPosition);
        }
        // 3. Place the radio‐circle itself at (currentX, currentY)
        let radioObj = {
          x: currentX,
          y: currentY,
          width: radioSize,
          height: radioSize
        };

        radioObj = getWidgetPosition(page, radioObj, 1, getSize);
        radioGroup.addOptionToPage(item, page, radioObj);
        // 4. If horizontal layout, re-compute horizontalGap for next iteration:
        if (isHorizontal) {
          // Measure how wide the label text is, so we know how far to shift next circle
          const textWidth = font.widthOfTextAtSize(item, optionsFontSize);
          // radioSize = the circle.  radioTextGapFromLeft = gap between circle and label.
          // Add a small extra padding (e.g. 10pt) before placing next circle.
          const gap = position?.options?.isHideLabel
            ? radioTextGapFromLeft - 6
            : radioTextGapFromLeft + textWidth;
          horizontalGap = radioSize + gap;
        }
      });
    }
    // pdf-lib only accepts a string that exists in the option list;
    // anything else (NaN, objects, stale values) aborts the whole embed.
    const wantedRadio =
      asOptionText(position?.options?.response) ||
      asOptionText(position?.options?.defaultValue);
    if (wantedRadio && radioOptions.includes(wantedRadio)) {
      try {
        radioGroup.select(wantedRadio);
      } catch (e) {
        // a bad value must not block the document from finishing
      }
    }
    // 6. Set to read‐only (if required)
    radioGroup.enableReadOnly();
  } else {
    const widgetRotation = position?.options?.rotation || 0;
    const isSwapped = [90, 270].includes(widgetRotation);
    // Use visual (swapped) dimensions to compute the correct position
    const signature = {
      x: xPos(position),
      y: yPos(position),
      width: isSwapped ? widgetHeight : widgetWidth,
      height: isSwapped ? widgetWidth : widgetHeight
    };
    const imageOptions = getWidgetPosition(page, signature, 1, getSize);
    if (widgetRotation) {
      const pageRotation = page.getRotation().angle;
      const combinedRotation = degrees(
        (imageOptions.rotate?.angle || pageRotation) - widgetRotation
      );
      const visualWidth = imageOptions.width;
      const visualHeight = imageOptions.height;
      if (isSwapped) {
        // Override with original (unswapped) dimensions for the actual image
        imageOptions.width = visualHeight;
        imageOptions.height = visualWidth;
      }
      imageOptions.rotate = combinedRotation;
      // Adjust position to compensate for pdf-lib rotation pivot (bottom-left corner)
      if (widgetRotation === 90) {
        imageOptions.y += visualHeight;
      } else if (widgetRotation === 180) {
        imageOptions.x += imageOptions.width;
        imageOptions.y += imageOptions.height;
      } else if (widgetRotation === 270) {
        imageOptions.x += visualWidth;
      }
    }
    page.drawImage(img, imageOptions);
  }
};
