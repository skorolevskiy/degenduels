import { SITE_URL, NEYNAR_API_KEY } from '@/config';
//import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import {
	Address
} from 'viem';

let fid: number, points: number, spins: number, dateString: string, refFid: string, refCount: number;
import { addUser, getUser } from './types'

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const body: { trustedData?: { messageBytes?: string } } = await req.json();

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		// Check if user has an address connected
		const address: Address | undefined =
			status?.action?.interactor?.verifications?.[0];

		if (!address) {
			return getResponse(ResponseType.NO_ADDRESS);
		}

		const fid_new = status?.action?.interactor?.fid ? status.action.interactor.fid : null;
		const username_new = status?.action?.interactor?.username ? JSON.stringify(status.action.interactor.username) : null;
		const wallet = status?.action?.interactor?.verifications?.[0] ? status.action.interactor.verifications?.[0] : null;

		const User = await getUser(fid_new);

		if (!User) {
			await addUser(fid_new, username_new, wallet);
		} else {

		}

		// Check if user has liked and recasted
		// const hasLikedAndRecasted =
		// 	!!status?.action?.cast?.viewer_context?.liked &&
		// 	!!status?.action?.cast?.viewer_context?.recasted;

		// if (!hasLikedAndRecasted) {
		// 	return getResponse(ResponseType.RECAST);
		// }

		return getResponse(ResponseType.SUCCESS);
	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	RECAST,
	NO_ADDRESS,
	ERROR
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Start.png',
		[ResponseType.RECAST]: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/recast.JPG',
		[ResponseType.NO_ADDRESS]: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/no-address.png',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/error.jpg',
	}[type];
	const shouldRetry =
		type === ResponseType.ERROR || type === ResponseType.RECAST;
	
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${IMAGE}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

    ${shouldRetry
			? 
				`<meta property="fc:frame:button:1" content="Try again" />
				`
			: 
				`
				<meta name="fc:frame:button:1" content="Duel" />
				<meta name="fc:frame:button:1:action" content="post" />
				<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/" />

				<meta name="fc:frame:button:2" content="Rules" />
				<meta name="fc:frame:button:2:action" content="post" />
				<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/rules/" />
			
				<meta name="fc:frame:button:3" content="Balance" />
				<meta name="fc:frame:button:3:action" content="post" />
				<meta name="fc:frame:button:3:target" content="${SITE_URL}/api/frame/balance/" />
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
		body: JSON.stringify({
			cast_reaction_context: true,
			follow_context: true,
			signer_context: false,
			channel_follow_context: true,
			message_bytes_in_hex: data
		}),
	};

	return await fetch(
		'https://api.neynar.com/v2/farcaster/frame/validate',
		options,
	)
		.then((response) => response.json())
		.catch((err) => console.error(err));
}
