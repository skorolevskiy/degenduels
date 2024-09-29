import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { updatePoints, getUser } from '../../../types';

export const dynamic = 'force-dynamic';
let spins: number, date: string, points: number, buttonText: string, recast: string | undefined, getId: string | null;

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const { searchParams } = new URL(req.url);
  		const id = searchParams.get('id');
		getId = id;
		const data = await req.json();
		const body: { trustedData?: { messageBytes?: string } } = data;

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		// const fid = status?.action?.interactor?.fid ? status.action.interactor.fid : null;

		// const User = await getUser(fid);

		// if (!User) {
		// 	spins = 0;
		// } else {
		// 	points = User.points;
		// }

		buttonText = "Fight again";

		let user = "random";

		let text = "I%20fight%20with%20you%20%40" + user + "%20in%20%2Fdegenduels%20game.%0ABack%20to%20game%20to%20end%20fight.";
  		recast = "https://warpcast.com/~/compose?text=" + text + "&embeds[]=" + SITE_URL + "/";

		return getResponse(ResponseType.RECEIVE);

	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	RECEIVE,
	REMATCH,
	ERROR,
	SPIN_OUT
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/GREERING%20RAZ%201.png',
		[ResponseType.REMATCH]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/rematch.gif',
		[ResponseType.RECEIVE]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/received.gif',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/error.jpg',
		[ResponseType.SPIN_OUT]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Balance-not-enough.png'
	}[type];
	const shouldRetry =
	  type === ResponseType.SPIN_OUT;
	
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${IMAGE}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

	${shouldRetry
		? `
		<meta name="fc:frame:button:1" content="Back" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/" />
		`
		: 
		`
    	<meta name="fc:frame:button:1" content="${buttonText}" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/" />

		<meta name="fc:frame:button:2" content="Make cast" />
		<meta name="fc:frame:button:2:action" content="link" />
		<meta name="fc:frame:button:2:target" content="${recast}" />

		<meta name="fc:frame:button:3" content="${getId}" />
		<meta name="fc:frame:button:3:action" content="link" />
		<meta name="fc:frame:button:3:target" content="${recast}" />
		`
	}

  </head></html>`);
}

async function validateFrameRequest(data: string | undefined) {
	if (!NEYNAR_API_KEY) throw new Error('NEYNAR_API_KEY is not set');
	if (!data) throw new Error('No data provided');

	const options = {
		method: 'POST',
		headers: {
			accept: 'application/json',
			api_key: NEYNAR_API_KEY,
			'content-type': 'application/json',
		},
		body: JSON.stringify({ message_bytes_in_hex: data }),
	};

	return await fetch(
		'https://api.neynar.com/v2/farcaster/frame/validate',
		options,
	)
		.then((response) => response.json())
		.catch((err) => console.error(err));
}