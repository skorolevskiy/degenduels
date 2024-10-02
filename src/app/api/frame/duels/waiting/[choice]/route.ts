import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { updateDuel, getUser } from '../../../types';

export const dynamic = 'force-dynamic';
let spins: number, date: string, points: number, buttonText: string, inputText: string | undefined, choice: string | undefined;

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

		choice = req.nextUrl.pathname.split('/').pop();

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
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/bafybeibgat6ad7impnsq233vlfovyhnaelgjyemi27h3wqnu5xkzmi2zsy/generating-results.png',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/error.jpg'
	}[type];
	const shouldRetry =
	  type === ResponseType.ERROR;
	
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
    	<meta name="fc:frame:button:1" content="View results" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/duels/${choice}" />
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