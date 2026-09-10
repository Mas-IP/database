//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const QUOTES_FILE = path.join(
    process.cwd(),
    'database',
    'quotes',
    'bijak.json'
)

let handler = async (m, { conn }) => {
    try {
        if (!fs.existsSync(QUOTES_FILE)) {
            return m.reply(
                '❌ Database quotes bijak tidak ditemukan.'
            )
        }

        const data = fs.readFileSync(
            QUOTES_FILE,
            'utf8'
        )

        if (!data.trim()) {
            return m.reply(
                '❌ Database quotes bijak masih kosong.'
            )
        }

        const quotes = JSON.parse(data)

        if (!Array.isArray(quotes)) {
            return m.reply(
                '❌ Format database quotes bijak tidak valid.'
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
                '❌ Belum ada quotes bijak di database.'
            )
        }

        const quote = validQuotes[
            Math.floor(
                Math.random() * validQuotes.length
            )
        ]

        const anu = `─────〔 *Kata Bijak* 〕─────

${quote.trim()}
`

        await m.reply(anu)

    } catch (e) {
        console.error(
            '[KATA BIJAK DATABASE ERROR]',
            e
        )

        await m.reply(
            '❌ Terjadi error saat membaca database quotes.'
        )
    }
}

handler.help = ['katabijak']
handler.tags = ['quotes']
handler.command = /^(katabijak)$/i

handler.limit = true
handler.fail = null

export default handler