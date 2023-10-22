import findObject from './findObject.js';
import getIndexFromRef from './getIndexFromRef.js';

const createBufferPageWithAnnotation = (pdf, info, pagesRef, widget) => {
    const pagesDictionary = findObject(pdf, info.xref, pagesRef).toString();

    // Extend page dictionary with newly created annotations
    let annotsStart; let annotsEnd; let
        annots;
    annotsStart = pagesDictionary.indexOf('/Annots');
    if (annotsStart > -1) {
        annotsEnd = pagesDictionary.indexOf(']', annotsStart);
        annots = pagesDictionary.substr(annotsStart, annotsEnd + 1 - annotsStart);
        annots = annots.substr(0, annots.length - 1); // remove the trailing ]
    } else {
        annotsStart = pagesDictionary.length;
        annotsEnd = pagesDictionary.length;
        annots = '/Annots [';
    }

    const pagesDictionaryIndex = getIndexFromRef(info.xref, pagesRef);
    const widgetValue = widget.toString();

    annots = `${annots} ${widgetValue}]`; // add the trailing ] back

    const preAnnots = pagesDictionary.substr(0, annotsStart);
    let postAnnots = '';
    if (pagesDictionary.length > annotsEnd) {
        postAnnots = pagesDictionary.substr(annotsEnd + 1);
    }

    return Buffer.concat([
        Buffer.from(`${pagesDictionaryIndex} 0 obj\n`),
        Buffer.from('<<\n'),
        Buffer.from(`${preAnnots + annots + postAnnots}\n`),
        Buffer.from('\n>>\nendobj\n'),
    ]);
};

export default createBufferPageWithAnnotation;
