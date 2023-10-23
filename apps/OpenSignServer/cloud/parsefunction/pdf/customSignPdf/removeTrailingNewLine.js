import SignPdfError from './SignPdfError.js';

const sliceLastChar = (pdf, character) => {
    const lastChar = pdf.slice(pdf.length - 1).toString();
    if (lastChar === character) {
        return pdf.slice(0, pdf.length - 1);
    }

    return pdf;
};

/**
 * Removes a trailing new line if there is such.
 *
 * Also makes sure the file ends with an EOF line as per spec.
 * @param {Buffer} pdf
 * @returns {Buffer}
 */
const removeTrailingNewLine = (pdf) => {
    if (!(pdf instanceof Buffer)) {
        throw new SignPdfError(
            'PDF expected as Buffer.',
            SignPdfError.TYPE_INPUT,
        );
    }
    let output = pdf;

    output = sliceLastChar(output, '\n');
    output = sliceLastChar(output, '\r');

    const lastLine = output.slice(output.length - 6).toString();
    if (lastLine !== '\n%%EOF') {
        throw new SignPdfError(
            'A PDF file must end with an EOF line.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return output;
};

export default removeTrailingNewLine;
