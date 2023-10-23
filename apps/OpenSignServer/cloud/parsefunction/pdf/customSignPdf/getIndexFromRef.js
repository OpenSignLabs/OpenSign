import SignPdfError from './SignPdfError.js';

/**
 * @param {object} refTable
 * @param {string} ref
 * @returns {number}
 */
const getIndexFromRef = (refTable, ref) => {
    let [index] = ref.split(' ');
    index = parseInt(index);

    if (!refTable.offsets.has(index)) {
        throw new SignPdfError(
            `Failed to locate object "${ref}".`,
            SignPdfError.TYPE_PARSE,
        );
    }
    return index;
};

export default getIndexFromRef;
