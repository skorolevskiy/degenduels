import { sql } from '@vercel/postgres'

export async function seed() {
  const createTable = await sql`
    CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        fid INTEGER NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        wallet VARCHAR(255),
        points INTEGER,
        "duelsCounter" INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "totalWin" INTEGER,
        "totalLose" INTEGER,
        "choiceWater" INTEGER,
        "choiceWind" INTEGER,
        "choiceFire" INTEGER,
        "lastFriend" VARCHAR(255),
      );
    `

  console.log(`Created "users" table`)

  return {
    createTable,
  }
}