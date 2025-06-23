import mysql from 'mysql2/promise';

// MySQL database connection
const db = mysql.createPool({
  host: process.env.DB_HOST, // Your MySQL host
  user: process.env.DB_USER, // Your MySQL user
  password: process.env.DB_PASSWORD, // Your MySQL password
  database: process.env.DB_NAME, // Your database name
  connectionLimit: 10, // Max concurrent connections
  keepAliveInitialDelay: 1000,
});

db.on('connection', connection => {
  console.log('MySQL connection established');
});

db.on('error', err => {
  console.error('MySQL pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection lost.');
  }
});

setInterval(() => {
  db.query('select 1');
}, 120000);

export { db };
