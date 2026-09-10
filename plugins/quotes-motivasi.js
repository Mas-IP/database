//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const QUOTES_FILE = path.join(
    process.cwd(),
    'database',
    'quotes',
    'motivasi.json'
)

let handler = async (m, { conn }) => {
    try {
        if (!fs.existsSync(QUOTES_FILE)) {
            return m.reply(
                '❌ Database quotes motivasi tidak ditemukan.'
            )
        }

        const data = fs.readFileSync(
            QUOTES_FILE,
            'utf8'
        )

        if (!data.trim()) {
            return m.reply(
                '❌ Database quotes motivasi masih kosong.'
            )
        }

        const quotes = JSON.parse(data)

        if (!Array.isArray(quotes)) {
            return m.reply(
                '❌ Format database quotes motivasi tidak valid.'
            )
        }

        const validQuotes = quotes.filter(quote => {
            return (
                typeof quote === 'string' &&
                quote.trim()
            )
        })

        if (validQuotes.length === 0) {
            return m.reply(
                '❌ Belum ada quotes motivasi di database.'
            )
        }

        const quote = validQuotes[
            Math.floor(
                Math.random() * validQuotes.length
            )
        ]

        const text = `―MOTIVASI―

"${quote.trim()}"`

        await conn.reply(
            m.chat,
            text,
            m
        )

    } catch (e) {
        console.error(
            '[MOTIVASI DATABASE ERROR]',
            e
        )

        await m.reply(
            '❌ Terjadi error saat membaca database quotes.'
        )
    }
}

handler.help = ['motivasi']
handler.tags = ['quotes']
handler.command = /^(motivasi)$/i

handler.limit = true
handler.fail = null

export default handler