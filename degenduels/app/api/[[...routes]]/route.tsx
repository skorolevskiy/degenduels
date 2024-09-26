/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { neynar } from 'frog/middlewares'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { readFile } from 'fs/promises'

import { duelApp } from './duel'
import { NEYNAR_API_KEY } from '@/app/config'
const neynarKey = NEYNAR_API_KEY ? NEYNAR_API_KEY.toString() : ""
import { addUser, getUser } from './types'
const app = new Frog({
  title: "Degen Duels Game",
})
.use(
  neynar({ apiKey: neynarKey, features: ['interactor', 'cast'], })
)

// Uncomment to use Edge Runtime
//export const runtime = 'edge';

const IMAGE = {
  GENERAL: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Start.png',
  RECAST: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/recast.JPG',
  NO_ADDRESS: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/no-address.png',
  ERROR: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/error.jpg',
  RULES: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Rules.png',
  LOW_BALANCE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Balance-not-enough.png',
};

app.frame('/', (c) => {
  return c.res({
    image: IMAGE.GENERAL,
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/general">Enter Game</Button>,
    ],
  })
})

app.frame('/general', async (c) => {
  const { fid, username, verifications } = c.var.interactor || {}
  const fidNew = fid ? fid : 1;
  const usernameNew = username ? String(username) : 'test';
  const walletsNew = verifications ? String(verifications[0]) : '0x';

  const User = await getUser(fidNew);

  if (!User) {
    //console.warn('not added: ' + JSON.stringify(User));
    await addUser(fidNew, usernameNew, walletsNew);
  }

  return c.res({
    image: IMAGE.GENERAL,
    imageAspectRatio: '1:1',

    intents: [
      <Button action="/duels">Duel</Button>,
      <Button action="/rules">Rules</Button>,
      <Button action="/check">Balance</Button>,
    ],
  })
})

app.frame('/rules', async (c) => {
  
  return c.res({
    image: IMAGE.RULES,
    imageAspectRatio: '1:1',

    intents: [
      <Button action="/duels">Duel</Button>,
      <Button action='/general'>Back</Button>,
    ],
  })
})

app.frame('/check', async (c) => {
  const time = Math.floor(Date.now() / 1000);
  const { fid } = c.var.interactor || {};
  const fidNew = fid ? fid : 1;
  let image:string, points:number;
  const User = await getUser(fidNew);

  if (!User) {
      image = IMAGE.ERROR;
  } else {
      points = User.points;
      if (points >= 100) {
          image = '/balance?time=' + time;
      } else {
          image = IMAGE.LOW_BALANCE;
      }
  }
  return c.res({
    image: image,
    headers: {
      'Cache-Control': 'max-age=0'
    },
    imageAspectRatio: '1:1',

    intents: [
      <Button action="/duels">Duel</Button>,
      <Button action='/general'>Back</Button>,
    ],
  })
})

app.image('/balance', async (c) => {
  const { fid } = c.var.interactor || {}
  const fidNew = fid ? fid : 1;
  const User = await getUser(fidNew);

  const points = User.points;
  //const localFont = await readFile('./public/fonts/Orbitron-SemiBold.ttf');
  return c.res({
    headers: {
      'Cache-Control': 'max-age=0'
    },
    image: (
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
							fontSize: 48,
              textAlign: 'center',
						}}
					>
						Balance: {points} $DUEL 
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
  imageOptions: { 
    width: 720,
    height: 720,
    // fonts: [
    //   {
    //     name: 'Geist',
    //     data: localFont,
    //   },
    // ],
  },

  })
})

app.route('/duels', duelApp)

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
