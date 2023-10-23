import SignPdfError from './SignPdfError.js';
import xrefToRefMap from './xrefToRefMap.js';

export const getLastTrailerPosition = (pdf) => {
    const trailerStart = pdf.lastIndexOf(Buffer.from('trailer', 'utf8'));
    const trailer = pdf.slice(trailerStart, pdf.length - 6);

    const xRefPosition = trailer
        .slice(trailer.lastIndexOf(Buffer.from('startxref', 'utf8')) + 10)
        .toString();

    return parseInt(xRefPosition);
};

export const getXref = (pdf, position) => {
    let refTable = pdf.slice(position); // slice starting from where xref starts
    const realPosition = refTable.indexOf(Buffer.from('xref', 'utf8'));
    if (realPosition === -1) {
        throw new SignPdfError(
            `Could not find xref anywhere at or after ${position}.`,
            SignPdfError.TYPE_PARSE,
        );
    }
    if (realPosition > 0) {
        const prefix = refTable.slice(0, realPosition);
        if (prefix.toString().replace(/\s*/g, '') !== '') {
            throw new SignPdfError(
                `Expected xref at ${position} but found other content.`,
                SignPdfError.TYPE_PARSE,
            );
        }
    }

    const nextEofPosition = refTable.indexOf(Buffer.from('%%EOF', 'utf8'));
    if (nextEofPosition === -1) {
        throw new SignPdfError(
            'Expected EOF after xref and trailer but could not find one.',
            SignPdfError.TYPE_PARSE,
        );
    }
    refTable = refTable.slice(0, nextEofPosition);
    refTable = refTable.slice(realPosition + 4); // move ahead with the "xref"
    refTable = refTable.slice(refTable.indexOf('\n') + 1); // move after the next new line

    // extract the size
    let size = refTable.toString().split('/Size')[1];

    if (!size) {
        throw new SignPdfError(
            'Size not found in xref table.',
            SignPdfError.TYPE_PARSE,
        );
    }
    size = (/^\s*(\d+)/).exec(size);
    if (size === null) {
        throw new SignPdfError(
            'Failed to parse size of xref table.',
            SignPdfError.TYPE_PARSE,
        );
    }
    size = parseInt(size[1]);

    const [objects, infos] = refTable.toString().split('trailer');

    const isContainingPrev = infos.split('/Prev')[1] != null;

    let prev;
    if (isContainingPrev) {
        const pagesRefRegex = /Prev (\d+)/g;
        const match = pagesRefRegex.exec(infos);
        const [, prevPosition] = match;
        prev = prevPosition;
    }

    const xRefContent = xrefToRefMap(objects);

    return {
        size,
        prev,
        xRefContent,
    };
};

export const getFullXrefTable = (pdf) => {
    const lastTrailerPosition = getLastTrailerPosition(pdf);
    const lastXrefTable = getXref(pdf, lastTrailerPosition);

    if (lastXrefTable.prev === undefined) {
        return lastXrefTable.xRefContent;
    }
    const pdfWithoutLastTrailer = pdf.slice(0, lastTrailerPosition);
    const partOfXrefTable = getFullXrefTable(pdfWithoutLastTrailer);

    const mergedXrefTable = new Map([
        ...partOfXrefTable,
        ...lastXrefTable.xRefContent,
    ]);

    return mergedXrefTable;
};

/**
 * @param {Buffer} pdfBuffer
 * @returns {object}
 */
const readRefTable = (pdf) => {
    const fullXrefTable = getFullXrefTable(pdf);
    const startingIndex = 0;
    const maxIndex = Math.max(...fullXrefTable.keys());

    return {
        startingIndex,
        maxIndex,
        offsets: fullXrefTable,
    };
};

export default readRefTable;
