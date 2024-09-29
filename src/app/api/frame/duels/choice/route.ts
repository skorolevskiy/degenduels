import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { updateFriend, getUser } from '../../types';

export const dynamic = 'force-dynamic';
let fid: number, date: string, points: number, inputText: string | undefined;

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const data = await req.json();
		const body: { trustedData?: { messageBytes?: string } } = data;

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		const inputData: { untrustedData?: { inputText?: string } } = data;
		inputText = inputData.untrustedData?.inputText ? inputData.untrustedData?.inputText : 'random';

		fid = status?.action?.interactor?.fid ? status.action.interactor.fid : 1;

		if (inputText === "") {
			return getResponse(ResponseType.ERROR);
		} else {
			await updateFriend(fid, inputText);
		}

		return getResponse(ResponseType.SUCCESS);
	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	ERROR
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Choose.gif',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/ERROR.png',
	}[type];
	
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${IMAGE}" />
	<meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />
	
	<meta name="fc:frame:button:1" content="Water" />
	<meta name="fc:frame:button:1:action" content="post" />
	<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/water" />

	<meta name="fc:frame:button:2" content="Wind" />
	<meta name="fc:frame:button:2:action" content="post" />
	<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/duels/wind" />

	<meta name="fc:frame:button:3" content="Fire" />
	<meta name="fc:frame:button:3:action" content="post" />
	<meta name="fc:frame:button:3:target" content="${SITE_URL}/api/frame/duels/fire" />		

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