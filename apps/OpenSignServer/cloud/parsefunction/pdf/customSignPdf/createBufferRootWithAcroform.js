import getIndexFromRef from './getIndexFromRef.js';

const createBufferRootWithAcroform = (pdf, info, form) => {
    const rootIndex = getIndexFromRef(info.xref, info.rootRef);

    return Buffer.concat([
        Buffer.from(`${rootIndex} 0 obj\n`),
        Buffer.from('<<\n'),
        Buffer.from(`${info.root}\n`),
        Buffer.from(`/AcroForm ${form}`),
        Buffer.from('\n>>\nendobj\n'),
    ]);
};

export default createBufferRootWithAcroform;
