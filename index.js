const WebSocket = require('ws')
const Discord = require('discord.js')
const fetch = require('node-fetch')
require('dotenv').config()

const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]
})

var bot
var body
var wsLink
var processing = false

function newError(text, error) {
    return new Error(`\x1b[33m${text}: \x1b[101m${error}\x1b[0m`)
}

(function () {
    const socket = new WebSocket('wss://chai-959f8-default-rtdb.firebaseio.com/.ws?v=5')

    try {
        socket.onopen = () => {
            socket.onmessage = (event) => {
                wsLink = JSON.parse(event.data).d.d.h
            }
        }
    } catch (error) {
        console.log('[[[ websocket connection error ]]]')
    }
}())

client.once('ready', () => {
    console.log(`Loaded Discord bot: ${client.user.tag}`)

    try {
        const socket = new WebSocket(`wss://${wsLink}/.ws?v=5&ns=chai-959f8-default-rtdb`)

        socket.onopen = () => {
            socket.send(JSON.stringify({ "t": "d", "d": { "r": 2, "a": "q", "b": { "p": "/botConfigs/bots/" + process.env.CHAI_BOT_ID, "h": "" } } }))
            socket.onmessage = (event) => {
                if (JSON.parse(event.data).d.b?.p) {
                    bot = JSON.parse(event.data).d.b.d

                    body = {
                        "text": `${bot.prompt}\n${bot.botLabel}: ${bot.firstMessage}`,
                        "temperature": bot.temperature,
                        "repetition_penalty": bot.repetitionPenalty,
                        "top_p": bot.topP,
                        "top_k": bot.topK,
                        "response_length": bot.responseLength
                    }
                    console.log(`Fetched bot data: ${bot.name}`)
                }
            }
        }
    } catch (error) {
        console.log('[[[ error connecting to websocket ]]]')
    }
})

client.on('messageCreate', async message => {
    try {
    const size = parseInt(msgn.size)
    if (message.attachments.size > 0) return;
    if ((message.author.id===process.env.DISCORD_BOT_ID) || message.channel.id != process.env.DISCORD_CHANNEL_ID || processing || !bot) return
    await new Promise(r => setTimeout(r, 500));
    processing = true
    body.text += `\n${bot.userLabel}: ${message.content}\n${bot.botLabel}:`
    message.channel.sendTyping()

    fetch("https://model-api-shdxwd54ta-nw.a.run.app/generate/gptj", {
        "headers": {
            "content-type": "application/json",
            "developer_key": process.env.CHAI_DEV_KEY,
            "developer_uid": process.env.CHAI_DEV_UID,
        },
        "body": JSON.stringify(body),
        "method": "POST",
    }).then(res => res.json()).then(async d => {
        if (d.error) console.log("[[[ error fetching data (122) ]]]");
        msgn.clear()
        body.text += d.data
        await new Promise(r => setTimeout(r, 4000));
        await message.reply({
            content: d.data
        }).catch(error => {
            console.log('[[[ error sending message (555) ]]]')
        }).finally(
            processing = false
        )
        console.log('Message Sent and size has been reset to 0' + d.data)
    })
 } catch (error) {console.log(error)}
})


client.login(process.env.DISCORD_BOT_TOKEN)