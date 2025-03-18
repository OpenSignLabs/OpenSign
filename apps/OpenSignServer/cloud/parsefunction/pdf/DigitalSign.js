import { exec } from 'child_process';

export default function DigitalSign(pdf, pfx, details) {
  const signcmd = `java -jar PDFDigitalSigner.jar "${pdf}" "${pfx.name}" "${pfx.passphrase}" "${details.name}" "${details.location}" "${details.reason}"`;
  // const signcmd = `java -jar PDFDigitalSigner.jar "${pdf}" keystore.pfx opensign "${details.name}" "${details.location}" "${details.reason}"`;
  return new Promise((resolve, reject) => {
    exec(signcmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
      }
      // Resolve the promise with the output
      resolve(stdout.trim());
    });
  });
}

export async function retryAsync(fn, args = [], retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fn(...args); // Try executing the async function
      if (response) return { response, attempt }; // Stop retrying if response is received
    } catch (error) {
      if (attempt < retries) {
        console.log(`Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...\n`);
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
      } else {
        return { error, attempt };
        // throw new Error(error);
      }
    }
  }
}
