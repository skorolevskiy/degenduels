import * as kysely from 'kysely'
import { createKysely } from '@vercel/postgres-kysely'

export interface PlayersTable {
	id: kysely.Generated<number>
	fid: number | null
	username: string | null
	points: number
	duelsCounter: number
	totalWin: number
	totalLose: number
	choiceWater: number
	choiceWind: number
	choiceFire: number
	createdAt: kysely.ColumnType<Date, Date | undefined, never>
	wallet: string | null
}

// Keys of this interface are table names.
export interface Database {
	players: PlayersTable
}

export const db = createKysely<Database>() 
//export { sql } from 'kysely'

export async function getUser(fid: number | null): Promise<any> {
	let data: any;

	try {
		data = await db
			.selectFrom('players')
			.where('fid', '=', fid)
			.selectAll()
			.executeTakeFirst();
		return data; // Data fetched successfully
	} catch (e: any) {
		if (e.message.includes('relation "players" does not exist')) {
			console.warn(
				'Table does not exist, creating and seeding it with dummy data now...'
			);
			// Table is not created yet
			//await seed();
			return false; // Data fetched successfully after seeding
		} else {
			console.error('Error fetching data:', e);
			return false; // Error occurred while fetching data
		}
	}
}

export async function addUser(fid: number | null, username: string | null, wallet: string | null) {

	const result = await db
		.insertInto('players')
		.values({
			fid: fid ? fid : null,
			username: username ? username : null,
			points: 100,
			duelsCounter: 0,
			totalWin: 0,
			totalLose: 0,
			choiceWater: 0,
			choiceWind: 0,
			choiceFire: 0,
            wallet: wallet,
		})
		.executeTakeFirst()
}

export async function updateDuel(fid: number | null, points: number, win: boolean, choice: number) {
	let duelWin:number, duelLose:number, choiceFire:number, choiceWater:number, choiceWind:number = 0;
	if (win) {
		duelWin = 1;
	} else {
		duelLose = 1;
	}
	if (choice == 0) {
		choiceWater = 1;
	} else if (choice == 1) {
		choiceWind = 1;
	} else if (choice == 2) {
		choiceFire = 1;
	}
	await db
		.updateTable('players')
		.set((eb) => ({
			points: eb('points', '+', points),
			duelsCounter: eb('duelsCounter', '+', 1),
			totalWin: eb('totalWin', '+', duelWin),
			totalLose: eb('totalLose', '+', duelLose),
			choiceWater: eb('choiceWater', '+', choiceWater),
			choiceWind: eb('choiceWind', '+', choiceWind),
			choiceFire: eb('choiceFire', '+', choiceFire),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updatePoints(fid: number | null, points: number) {
	await db
		.updateTable('players')
		.set((eb) => ({
			points: eb('points', '+', points),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updateWallet(fid: number | null, wallet: string | null) {
	await db
		.updateTable('players')
		.set((eb) => ({
			wallet: wallet,
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function getTopPlayers(): Promise<any> {
	let data: any;
	try {
		data = await db
			.selectFrom('players')
			.select(['fid', 'username', 'points'])
			.orderBy('points desc')
			.limit(10)
			.execute();
		return data;
	} catch (e: any) {
		console.error('Ошибка получения данных:', e.message);
		return false;
	}
}

export async function getUserPosition(fid: number | null) {
	let data: any;
	try {
		const userPoints = await db
			.selectFrom('players')
			.select('points')
			.where('fid', '=', fid)
			.executeTakeFirst();

		data = await db
			.selectFrom('players')
			.select(db.fn.countAll().as('count'))
			.where('points', '>', userPoints?.points ?? 0)
			.execute();
		return data[0]['count'];
	} catch (e: any) {
		console.error('Ошибка получения данных:', e.message);
		return false;
	}
}

export async function getAllUsers() {
	let data: any;
	data = await db
			.selectFrom('players')
			.selectAll()
			.orderBy('points desc')
			.execute();
	return data;
}