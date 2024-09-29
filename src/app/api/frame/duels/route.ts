import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '../types';

// const HAS_KV = !!process.env.KV_URL;
// const transport = http(process.env.RPC_URL);

export const dynamic = 'force-dynamic';
let spins: number, date: string, points: number, buttonText: string;

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const body: { trustedData?: { messageBytes?: string } } = await req.json();

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		const fid = status?.action?.interactor?.fid ? status.action.interactor.fid : null;

		const User = await getUser(fid);

		if (!User) {
			points = 0;
		} else {
			points = User.points;
		}

		if (points > 0) {}
		else {
			return getResponse(ResponseType.SPIN_OUT);
		}

		return getResponse(ResponseType.CHOICE);

	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	CHOICE,
	ERROR,
	SPIN_OUT
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.CHOICE]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Choose-opponent.gif',
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

		<meta name="fc:frame:button:2" content="Back" />
		<meta name="fc:frame:button:2:action" content="post" />
		<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/" />
		`
		: 
		`
    	<meta name="fc:frame:button:1" content="Friend" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/friend" />

		<meta name="fc:frame:button:2" content="Random" />
		<meta name="fc:frame:button:2:action" content="post" />
		<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/duels/choice" />

		<meta name="fc:frame:button:3" content="Back" />
		<meta name="fc:frame:button:3:action" content="post" />
		<meta name="fc:frame:button:3:target" content="${SITE_URL}/api/frame/" />
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

function weighted_random_number() {
	const weights = [5, 4, 4, 4, 3, 2, 2, 1];

	const total_weight = weights.reduce((acc, val) => acc + val, 0);
	const random_weight = Math.floor(Math.random() * total_weight);
	let cumulative_weight = 0;
	for (let i = 0; i < weights.length; i++) {
		cumulative_weight += weights[i];
		if (random_weight < cumulative_weight) {
			return i + 1;
		}
	}
}