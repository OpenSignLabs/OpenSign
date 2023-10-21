import SignPdfError from './SignPdfError.js';

/**
 * @param {Object} info As extracted from readRef()
 */

export default function getPagesDictionaryRef(info) {
    const pagesRefRegex = /\/Pages\s+(\d+\s+\d+\s+R)/g;
    const match = pagesRefRegex.exec(info.root);
    if (match === null) {
        throw new SignPdfError(
            'Failed to find the pages descriptor. This is probably a problem in node-signpdf.',
            SignPdfError.TYPE_PARSE,
        );
    }

    return match[1];
}
