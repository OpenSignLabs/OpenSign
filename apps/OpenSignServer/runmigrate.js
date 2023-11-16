// const { exec } = require('child_process');
import { exec } from 'child_process';

const migrate =
  'APPLICATION_ID=legadranaxn SERVER_URL=http://localhost:8080/app MASTER_KEY=XnAwPDRQQyMr npx parse-dbtool migrate';
// `APPLICATION_ID=${process.env.APP_ID} SERVER_URL=${process.env.SERVER_URL} MASTER_KEY=${process.env.MASTER_KEY} npx parse-dbtool migrate`;

exec(migrate, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }

  console.log(`Command output: ${stdout}`);
});

// const seeder =
//   'APPLICATION_ID=legadranaxn SERVER_URL=http://localhost:8080/app MASTER_KEY=XnAwPDRQQyMr npx parse-dbtool seed';

// exec(seeder, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.error(`Error: ${stderr}`);
//     return;
//   }

//   console.log(`Command output: ${stdout}`);
// });
