import { SITE_URL } from '@/config';
import { ImageResponse } from 'next/og';
import { getUser } from '../../types';

let fid: number | null, username: string, points: number | null, wins: number, loses: number, winRate: number;

export async function GET(request: Request) {
	const fontData = await fetch(
		new URL(SITE_URL + '/assets/Orbitron-SemiBold.ttf', import.meta.url),
	  ).then((res) => res.arrayBuffer());

	try {
		const { searchParams } = new URL(request.url);

		const hasFid = searchParams.has('fid');
		fid = hasFid ? Number(searchParams.get('fid')) : null;

		const hasPoints = searchParams.has('points');
		points = hasPoints ? Number(searchParams.get('points')) : null;

		const User = await getUser(fid);

		if (!User) {
		} else {
			wins = User.totalWin;
			loses = User.totalLose;
		}

		winRate = Math.floor((wins/(wins+loses))*100);

		return new ImageResponse(
			(
				<div
					style={{
						fontFamily: 'Geist, Inter, "Material Icons"',
						fontSize: 32,
						color: 'black',
						background: '#f3cd08',
						width: '100%',
						height: '100%',
						padding: '30px 80px',
						display: 'flex',
						justifyContent: 'space-around',
						alignItems: 'center',
						flexDirection: 'column',
						flexWrap: 'nowrap',
					}}
				>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						fontSize: 48,
						textAlign: 'center',
					}}
				>
					<span>Balance: {points} $DUEL </span>
					<span>Wins: {wins} </span>
					<span>Loses: {loses} </span>
					<span>Win Rate: {winRate}% </span>
				</div>

				<div
					style={{
						display: 'flex',
						fontSize: 32,
						textAlign: 'center',
					}}
				>
					Go to the arena and earn some more coins in a fair fight ⚔️
				</div>

				</div>
			),
			{
				width: 960,
				height: 960,
				fonts: [
					{
					  name: 'Geist',
					  data: fontData,
					  style: 'normal',
					},
				  ],
			},
		);
	} catch (e: any) {
		console.log(`${e.message}`);
		return new Response(`Failed to generate the image`, {
			status: 500,
		});
	}
}