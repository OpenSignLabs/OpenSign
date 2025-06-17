import fs from 'node:fs';
import multer from 'multer';
import Coherentpdf from 'coherentpdf';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'exports');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });

export default async function decryptpdf(req, res) {
  const inputPath = req.file.path;
  const outputPath = './exports/out.pdf';
  const password = req.body.password || '';
  try {
    const file = fs.readFileSync(inputPath);
    const pdf = await Coherentpdf.fromMemory(file, password);
    await Coherentpdf.decryptPdf(pdf, password);
    await Coherentpdf.toFile(pdf, outputPath, false, false);
    const buffer = fs.readFileSync(outputPath);
    res.set('Content-Type', 'application/pdf');
    res.send(buffer);
    fs.unlink(inputPath, () => {});
  } catch (err) {
    fs.unlink(inputPath, () => {});
    console.log('Error in decrypt file: ', err);
    let code = err?.code ? err.code : 400;
    let message = err?.[2]?.c ? err[2].c : 'Something went wrong.';
    if (err?.[2]?.c?.includes('Bad password') || err?.[2]?.c?.includes('decrypt_pdf_inner')) {
      code = 401;
      message = 'Incorrect password.';
    }
    return res.status(code).json({ error: message });
  }
}
