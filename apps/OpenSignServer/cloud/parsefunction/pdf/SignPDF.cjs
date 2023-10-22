const signer = require("node-signpdf").default;

class SignPDF {
  constructor(pdfBuffer, certBuffer) {
    this.pdfDoc = pdfBuffer;
    this.certificate = certBuffer;
  }
  /**
   * @return Promise<Buffer>
   */
  async signPDF() {
    let newPDF = signer.sign(this.pdfDoc, this.certificate, {
      passphrase: "emudhra",
    });
    return newPDF;
  }

  /**
   * @param {Uint8Array} unit8
   */
  static unit8ToBuffer(unit8) {
    let buf = Buffer.alloc(unit8.byteLength);
    const view = new Uint8Array(unit8);

    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }
}
module.exports = SignPDF;
