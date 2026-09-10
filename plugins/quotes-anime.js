//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const QUOTES_FILE = path.join(
    process.cwd(),
    'database',
    'quotes',
    'anime.json'
)

let handler = async (m, { conn }) => {
    try {
        if (!fs.existsSync(QUOTES_FILE)) {
            return m.reply(
                '❌ Database anime belum tersedia.'
            )
        }

        const data = fs.readFileSync(
            QUOTES_FILE,
            'utf8'
        )

        if (!data.trim()) {
            return m.reply(
                '❌ Database anime masih kosong.'
            )
        }

        const quotes = JSON.parse(data)

        if (!Array.isArray(quotes)) {
            return m.reply(
                '❌ Format database anime tidak valid.'
            )
        }

        const validQuotes = quotes.filter(item => {
            return (
                item &&
                typeof item === 'object' &&
                typeof item.quotes === 'string' &&
                item.quotes.trim()
            )
        })

        if (validQuotes.length === 0) {
            return m.reply(
                '❌ Belum ada quote anime di database.'
            )
        }

        const animeQuote =
            validQuotes[
                Math.floor(
                    Math.random() *
                    validQuotes.length
                )
            ]

        const cleanQuotes =
            animeQuote.quotes
                .replace(/[\n\r\t]/g, ' ')
                .trim()

        const replyMessage =
            `${cleanQuotes}\n\n` +
            `Character: ${animeQuote.karakter || '-'}\n` +
            `Anime: ${animeQuote.anime || '-'}\n` +
            `Episode: ${animeQuote.episode || '-'}`

        if (animeQuote.gambar) {

            await conn.sendFile(
                m.chat,
                animeQuote.gambar,
                'image.jpg',
                replyMessage,
                m,
                false,
                {
                    contextInfo: {
                        mentionedJid: [
                            m.sender
                        ]
                    }
                }
            )

        } else {

            await conn.reply(
                m.chat,
                replyMessage,
                m
            )
        }

    } catch (e) {

        console.error(
            '[ANIME DATABASE ERROR]',
            e
        )

        await m.reply(
            '❌ Gagal mengambil quote anime dari database.'
        )
    }
}

handler.help = ['anime']
handler.tags = ['quotes']
handler.command = /^(anime)$/i

handler.limit = true
handler.fail = null

export default handler