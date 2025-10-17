import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// This function can be used by any part of our app
export async function getDoujinshiList() {
  try {
    const query = 'SELECT * FROM "Doujinshi" ORDER BY "createdAt" DESC;';
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    // We throw the error so the calling component knows something went wrong.
    throw new Error('Failed to fetch doujinshi list.');
  }
}