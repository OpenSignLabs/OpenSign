import getIndexFromRef from './getIndexFromRef.js';

/**
 * @param {Buffer} pdf
 * @param {Map} refTable
 * @returns {object}
 */
const findObject = (pdf, refTable, ref) => {
    const index = getIndexFromRef(refTable, ref);

    const offset = refTable.offsets.get(index);
    let slice = pdf.slice(offset);
    slice = slice.slice(0, slice.indexOf('endobj', 'utf8'));

    // FIXME: What if it is a stream?
    slice = slice.slice(slice.indexOf('<<', 'utf8') + 2);
    slice = slice.slice(0, slice.lastIndexOf('>>', 'utf8'));
    return slice;
};

export default findObject;
