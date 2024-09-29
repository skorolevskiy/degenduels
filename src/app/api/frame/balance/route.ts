import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
let points: number, fid: number | null, time: number;
import { getUser } from '../types';

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const body: { trustedData?: { messageBytes?: string } } = await req.json();

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		fid = status?.action?.interactor?.fid ? status.action.interactor.fid : 1;

		time = Math.floor(Date.now() / 1000);

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

		return getResponse(ResponseType.BALANCE);
	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	NO_ADDRESS,
	ERROR,
	BALANCE,
	SPIN_OUT
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/QmaS8bbwz79CWfJEfJ44JEu4PA7QkR563koCqSdgPED6Jp/success.webp',
		[ResponseType.NO_ADDRESS]: 'https://gateway.lighthouse.storage/ipfs/QmaS8bbwz79CWfJEfJ44JEu4PA7QkR563koCqSdgPED6Jp/no-address.png',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/error.jpg',
		[ResponseType.BALANCE]: SITE_URL + '/api/frame/balance/get-balance-image?fid='+ fid +'&points='+ points +'&time='+ time,
		[ResponseType.SPIN_OUT]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Balance-not-enough.png'
	}[type];
	// const shouldRetry =
	//   type === ResponseType.ERROR || type === ResponseType.RECAST;
	// const successRetry = 
	//   type === ResponseType.SUCCESS;
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${IMAGE}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

	<meta name="fc:frame:button:1" content="Duel" />
	<meta name="fc:frame:button:1:action" content="post" />
	<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/" />

    <meta name="fc:frame:button:2" content="Back" />
    <meta name="fc:frame:button:2:action" content="post" />
    <meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/" />

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
