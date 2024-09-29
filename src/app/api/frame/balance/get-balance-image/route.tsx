import { SITE_URL } from '@/config';
import { ImageResponse } from 'next/og';

let fid: string | null, username: string, points: string | null;

export async function GET(request: Request) {
	const fontData = await fetch(
		new URL(SITE_URL + '/assets/Orbitron-SemiBold.ttf', import.meta.url),
	  ).then((res) => res.arrayBuffer());

	try {
		const { searchParams } = new URL(request.url);

		const hasFid = searchParams.has('fid');
		fid = hasFid ? searchParams.get('fid') : null;

		const hasPoints = searchParams.has('points');
		points = hasPoints ? searchParams.get('points') : null;

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
						padding: '30px 40px',
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
					<span>Fid: {fid} </span>
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