const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        console.log('Reading migration script...');
        const sql = fs.readFileSync('migration.sql', 'utf8');

        console.log('Executing migration...');
        await client.query(sql);

        console.log('Migration successfully applied!');
        await client.end();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
