/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput  } from 'frog'
import { neynar } from 'frog/middlewares'
import { handle } from 'frog/next'
import { NEYNAR_API_KEY, SITE_URL } from '@/app/config'
const neynarKey = NEYNAR_API_KEY ? NEYNAR_API_KEY.toString() : "";
import { updateDuel, updatePoints, getUser } from './types';
let spins: number, date: string, points: string, buttonText: string;
//import { readFile } from 'fs/promises';
 
export const duelApp = new Frog({
  title: 'Degen Duels Game',
}).use(
    neynar({ apiKey: neynarKey, features: ['interactor', 'cast'], })
)

const IMAGE = {
    SUCCESS: 'https://gateway.lighthouse.storage/ipfs/QmaS8bbwz79CWfJEfJ44JEu4PA7QkR563koCqSdgPED6Jp/success.webp',
    LOW_BALANCE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Balance-not-enough.png',
    CHOICE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Choose-opponent.gif',
    CHOICE_FRIEND: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Duel-friend.gif',
    CHOICE_POWER: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/Choose.gif',
    WATER_FIRE_WIN: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/water-fire-won.gif',
    WATER_WIND_LOSE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/wind-water-lose.gif',
    FIRE_WIND_WIN: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/wind-fire-won.gif',
    FIRE_WATER_LOSE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/water-fire-lose.gif',
    WIND_WATER_WIN: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/wind-water-won.gif',
    WIND_FIRE_LOSE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/wind-fire-lose.gif',
    NO_ADDRESS: 'https://gateway.lighthouse.storage/ipfs/QmaS8bbwz79CWfJEfJ44JEu4PA7QkR563koCqSdgPED6Jp/no-address.png',
    ERROR: 'https://gateway.lighthouse.storage/ipfs/bafybeiborpipie6brxzofzgaf5eswp53pctxhu335etzbjyvax46pfvpwa/error.jpg',
    REMATCH: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/rematch.gif',
    RECEIVE: 'https://gateway.lighthouse.storage/ipfs/bafybeidot3ebld6cylwsb6h2elpwzskpe77oduqau6dx7zxxmi35zhbc7a/received.gif'
};

duelApp.frame('/', async (c) => {
    const { fid } = c.var.interactor || {};
    const fidNew = fid ? fid : 1;
    let image:string, points:number;
    const User = await getUser(fidNew);

    if (!User) {
        image = IMAGE.ERROR;
    } else {
        points = User.points;
        if (points >= 100) {
            image = IMAGE.CHOICE;
        } else {
            image = IMAGE.LOW_BALANCE;
        }
    }

    return c.res({
        image: image,
        imageAspectRatio: '1:1',
        intents: [
            <Button action="/friend">Friend</Button>,
            <Button action="/duel">Random</Button>,
            <Button.Reset>Back</Button.Reset>
        ],
    })
})

duelApp.frame('/friend', async (c) => {
    
    return c.res({
        image: IMAGE.CHOICE_FRIEND,
        imageAspectRatio: '1:1',

        intents: [
            <TextInput placeholder="Write handle your friend..." />,
            <Button action="/duel">Enter Duel</Button>,
            <Button action='/'>Back</Button>,
        ],
    })
})

duelApp.frame('/duel', async (c) => {
    const { inputText, status } = c
    const user = inputText || 'random';
    return c.res({
        action: "/wait/"+ user,
        image: IMAGE.CHOICE_POWER,
        imageAspectRatio: '1:1',

        intents: [
            <Button value="water">Water</Button>,
            <Button value="wind">Wind</Button>,
            <Button value="fire">Fire</Button>,
            //<Button action='/'>{user}</Button>,
        ],
    })
})

duelApp.frame('/wait/:user', async (c) => {
    const { buttonValue, status } = c;
    const time = Math.floor(Date.now() / 1000);
    const user = c.req.param('user');
    const choice = buttonValue || '';
    
    return c.res({
        action: "/result/"+ user,
        image: '/waiting',
        imageAspectRatio: '1:1',

        intents: [
            <Button value={choice}>View Results</Button>,
        ],
    })
})

duelApp.image('/waiting', async (c) => {
    //const localFont = await readFile('./public/fonts/Orbitron-SemiBold.ttf');
    return c.res({
        image: (
            <div style={{ fontFamily: 'Geist, Inter, "Material Icons"',
                fontSize: 32,
                color: 'white',
                background: '#000',
                width: '100%',
                height: '100%',
                padding: '30px 40px',
                display: 'flex', 
                justifyContent: "center",
                alignItems: "center" }}>
                ⚔️ Wait for ending fight ⚔️
            </div>
          ),
        imageOptions: { 
            width: 720,
            height: 720,
            // fonts: [
            //     {
            //     name: 'Geist',
            //     data: localFont,
            //     },
            // ],
        },
    })
});

duelApp.frame('/result/:user', async (c) => {
    const { buttonValue, status } = c;
    const { fid } = c.var.interactor || {}
    const fidNew = fid ? fid : 1;
    const user = c.req.param('user');
    const choice = buttonValue || '';
    let imageChoice, buttonText;
    const rand = Math.floor(Math.random() * 2);
    switch (choice) {
        case "water": {
            if (rand == 0) {
                imageChoice = IMAGE.WATER_FIRE_WIN;
                await updateDuel(fidNew, 0, true, 0);
            } else {
                imageChoice = IMAGE.WATER_WIND_LOSE;
                await updateDuel(fidNew, -100, false, 0);
            }
            break
        }
        case "wind": {
            if (rand == 0) {
                imageChoice = IMAGE.WIND_WATER_WIN;
                await updateDuel(fidNew, 0, true, 1);
            } else {
                imageChoice = IMAGE.WIND_FIRE_LOSE;
                await updateDuel(fidNew, -100, false, 1);
            }
            break
        }
        case "fire": {
            if (rand == 0) {
                imageChoice = IMAGE.FIRE_WIND_WIN;
                await updateDuel(fidNew, 0, true, 2);
            } else {
                imageChoice = IMAGE.FIRE_WATER_LOSE;
                await updateDuel(fidNew, -100, false, 2);
            }
            break
        }
        default:
            imageChoice = IMAGE.ERROR;
    }
    if (rand == 0) {
        buttonText = "Get rewards"
    } else {
        buttonText = "Rematch"
    }

    let actionValue = "/recast/" + user;
        
    return c.res({
        image: imageChoice,
        imageAspectRatio: '1:1',

        intents: [
            <Button action={actionValue} value={rand ? '1' : '0'}>{buttonText}</Button>,
            <Button action='/'>Skip</Button>,
        ],
    })
})

duelApp.frame('/recast/:user', async (c) => {
    const { buttonValue, status } = c;
    const { fid } = c.var.interactor || {};
    const fidNew = fid ? fid : 1;
    const user = c.req.param('user');
    const choice = buttonValue || '';
    let recast, imageChoice, buttonText;
    switch (choice) {
        case "0": {
            imageChoice = IMAGE.RECEIVE;
            break
        }
        case "1": {
            imageChoice = IMAGE.REMATCH;
            break;
        }
        default: {
            imageChoice = IMAGE.REMATCH;
        }
    }
    if (choice == "0") {
        buttonText = "Fight again"
    } else {
        buttonText = "Rematch"
    }
    let text = "I%20fight%20with%20you%20%40" + user + "%20in%20%2Fdegenduels%20game.%0ABack%20to%20game%20to%20end%20fight.";
    recast = "https://warpcast.com/~/compose?text=" + text + "&embeds[]=" + SITE_URL + "/";

    await updatePoints(fidNew, 100);

    return c.res({
        image: imageChoice,
        imageAspectRatio: '1:1',
        intents: [
            <Button.Redirect location={recast}>Make cast</Button.Redirect>,
            <Button action='/'>{buttonText}</Button>,
        ],
    })
})

export const GET = handle(duelApp)
export const POST = handle(duelApp)