import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getDoujinshiList() {
  try {
    const query = `
      SELECT 
        id, 
        title, 
        circle,
        authors,
        genres, 
        TO_CHAR("publishedDate", 'YYYY-MM-DD') AS "publishedDate", 
        "thumbnailUrl", 
        "createdAt", 
        "updatedAt" 
      FROM "Doujinshi" 
      ORDER BY "createdAt" DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch doujinshi list.');
  }
}