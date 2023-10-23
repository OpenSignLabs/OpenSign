import PDFAbstractReference from './PDFAbstractReference.js';

class PDFKitReferenceMock extends PDFAbstractReference {
    constructor(index, additionalData = undefined) {
        super();
        this.index = index;
        if (typeof additionalData !== 'undefined') {
            Object.assign(this, additionalData);
        }
    }

    toString() {
        return `${this.index} 0 R`;
    }
}

export default PDFKitReferenceMock;