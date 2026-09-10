//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const QUOTES_FILE = path.join(
    process.cwd(),
    'database',
    'quotes',
    'bacot.json'
)

let handler = async (m, { conn }) => {
    try {
        if (!fs.existsSync(QUOTES_FILE)) {
            return m.reply(
                '❌ Database quotes bacot tidak ditemukan.'
            )
        }

        const data = fs.readFileSync(
            QUOTES_FILE,
            'utf8'
        )

        if (!data.trim()) {
            return m.reply(
                '❌ Database quotes bacot masih kosong.'
            )
        }

        const quotes = JSON.parse(data)

        if (!Array.isArray(quotes)) {
            return m.reply(
                '❌ Format database quotes bacot tidak valid.'
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
                '❌ Belum ada quotes bacot di database.'
            )
        }

        const quote =
            validQuotes[
                Math.floor(
                    Math.random() *
                    validQuotes.length
                )
            ]

        const anu = `
─────〔 *Bacot* 〕─────

${quote.trim()}
`

        await conn.reply(
            m.chat,
            anu,
            m
        )

    } catch (e) {
        console.error(
            '[BACOT DATABASE ERROR]',
            e
        )

        await m.reply(
            '❌ Terjadi error saat membaca database quotes.'
        )
    }
}

handler.help = ['bacot']
handler.tags = ['quotes']
handler.command = /^(bacot)$/i

handler.limit = true
handler.fail = null

export default handler