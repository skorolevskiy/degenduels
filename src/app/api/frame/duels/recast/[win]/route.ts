import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { updatePoints, getUser } from '../../../types';

export const dynamic = 'force-dynamic';
let spins: number, date: string, points: number, buttonText: string, recast: string | undefined, getParam: string | undefined, user: string;

export async function POST(req: NextRequest): Promise<Response> {
	try {
		getParam = req.nextUrl.pathname.split('/').pop();

		const data = await req.json();
		const body: { trustedData?: { messageBytes?: string } } = data;

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		const fid = status?.action?.interactor?.fid ? status.action.interactor.fid : null;
		const User = await getUser(fid);

		if (!User) {
		} else {
			user = User.lastFriend;
			if (user === "random") {
				user = "eat";
			}
		}
		let text = "I%20just%20won%20a%20duel%20in%20Degen%20Duels%20and%20earned%20100%20%24duels%21%20%E2%9A%94%EF%B8%8F%0ABetter%20luck%20next%20time%2C%20%40" + user + "%21%0A%0ALost%20the%20battle%20but%20not%20the%20war%21%20Great%20duel%2C%20%40" + user + ".%20Let%E2%80%99s%20go%20rematch%21%20%E2%9A%94%EF%B8%8F";
  		recast = "https://warpcast.com/~/compose?text=" + text + "&embeds[]=" + SITE_URL + "/";

		await updatePoints(fid, 100);

		if (getParam == "win") {
			buttonText = "Fight again";
			return getResponse(ResponseType.RECEIVE);
		} else {
			buttonText = "Rematch";
			return getResponse(ResponseType.REMATCH);
		}

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
		[ResponseType.REMATCH]: 'https://gateway.lighthouse.storage/ipfs/bafybeibgat6ad7impnsq233vlfovyhnaelgjyemi27h3wqnu5xkzmi2zsy/make-cast-lose.png',
		[ResponseType.RECEIVE]: 'https://gateway.lighthouse.storage/ipfs/bafkreihlgqnj23qo64fgni2z4owim664pbqetoi6fp33ifssyms7cesxy4',
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
    	<meta name="fc:frame:button:1" content="Check" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/final/${getParam}" />

		<meta name="fc:frame:button:2" content="Make cast" />
		<meta name="fc:frame:button:2:action" content="link" />
		<meta name="fc:frame:button:2:target" content="${recast}" />
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