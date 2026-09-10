//create code Wonge-bot

import { sticker5 } from '../lib/sticker.js'

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) throw `🚩 *Contoh:* ${usedPrefix + command} 🗿`

    await conn.reply(m.chat, wait, m)

    const emojiType = {
        stikapple: 'apple',
        stikgoogle: 'google',
        stiksamsung: 'samsung',
        stikmicrosoft: 'microsoft',
        stikwhatsapp: 'whatsapp',
        stiktwitter: 'twitter',
        stikfacebook: 'facebook',
        stikskype: 'skype',
        stikjoypixels: 'joypixels',
        stikopenmoji: 'openmoji',
        stikemojipedia: 'emojipedia',
        stiklg: 'lg',
        stikhtc: 'htc',
        stikmozilla: 'mozilla',
        stiksoftbank: 'softbank',
        stikdocomo: 'docomo',
        stikkddi: 'kddi'
    }

    const type = emojiType[command]

    if (!type) throw '*🚩 Stiker tidak di temukan!*'

    try {
        const url = `https://api.botcahx.eu.org/api/emoji/${type}?emoji=${encodeURIComponent(text)}&apikey=${btc}`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const buffer = Buffer.from(await response.arrayBuffer())

        if (!buffer.length) {
            throw new Error('Sticker kosong')
        }

        // Buat sticker + WM
        const stiker = await sticker5(
            buffer,
            null,
            global.packname,
            global.author
        )

        await conn.sendFile(
            m.chat,
            stiker,
            'sticker.webp',
            '',
            m
        )

    } catch (e) {
        console.log('STICKER ERROR:', e)
        throw '*🚩 Stiker tidak di temukan!*'
    }
}

handler.command = handler.help = [
    'stikapple',
    'stikkddi',
    'stikgoogle',
    'stikdocomo',
    'stiksoftbank',
    'stikhtc',
    'stikmozilla',
    'stiklg',
    'stikopenmoji',
    'stikemojipedia',
    'stikjoypixels',
    'stikfacebook',
    'stikskype',
    'stikwhatsapp',
    'stiktwitter',
    'stiksamsung',
    'stikmicrosoft'
]

handler.tags = ['sticker']
handler.limit = true

export default handler