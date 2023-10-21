import SignPdfError from './SignPdfError.js';

const xrefToRefMap = (xrefString) => {
    const lines = xrefString.split('\n').filter((l) => l !== '');

    let index = 0;
    let expectedLines = 0;
    const xref = new Map();
    lines.forEach((line) => {
        const split = line.split(' ');
        if (split.length === 2) {
            index = parseInt(split[0]);
            expectedLines = parseInt(split[1]);
            return;
        }
        if (expectedLines <= 0) {
            throw new SignPdfError(
                'Too many lines in xref table.',
                SignPdfError.TYPE_PARSE,
            );
        }
        expectedLines -= 1;
        const [offset, , inUse] = split;
        if (inUse.trim() === 'f') {
            index += 1;
            return;
        }
        if (inUse.trim() !== 'n') {
            throw new SignPdfError(
                `Unknown in-use flag "${inUse}". Expected "n" or "f".`,
                SignPdfError.TYPE_PARSE,
            );
        }
        if (!/^\d+$/.test(offset.trim())) {
            throw new SignPdfError(
                `Expected integer offset. Got "${offset}".`,
                SignPdfError.TYPE_PARSE,
            );
        }
        const storeOffset = parseInt(offset.trim());
        xref.set(index, storeOffset);
        index += 1;
    });

    return xref;
};

export default xrefToRefMap;
