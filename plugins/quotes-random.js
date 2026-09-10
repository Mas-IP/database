//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const QUOTES_DIR = path.join(
    process.cwd(),
    'database',
    'quotes'
)

const QUOTE_FILES = {
    bucin: 'bucin.json',
    ilham: 'ilham.json',
    dilan: 'dilan.json',
    fiersa: 'fiersa.json',
    fakta: 'fakta.json',
    nyindir: 'nyindir.json',
    ngawur: 'ngawur.json',
    jawa: 'jawa.json',
    quotes: 'quotes.json',
    sunda: 'sunda.json',
    batak: 'batak.json',
    aceh: 'aceh.json',
    cina: 'cina.json',
    minangkabau: 'minangkabau.json'
}

let handler = async (m, { conn, command }) => {
    try {
        const fileName = QUOTE_FILES[command]

        if (!fileName) {
            return m.reply(
                '❌ Database quotes tidak ditemukan.'
            )
        }

        const filePath = path.join(
            QUOTES_DIR,
            fileName
        )

        if (!fs.existsSync(filePath)) {
            return m.reply(
                `❌ Database *${command}* tidak ditemukan.`
            )
        }

        const data = fs.readFileSync(
            filePath,
            'utf8'
        )

        if (!data.trim()) {
            return m.reply(
                `❌ Database *${command}* masih kosong.`
            )
        }

        const quotes = JSON.parse(data)

        if (!Array.isArray(quotes)) {
            return m.reply(
                `❌ Format database *${command}* tidak valid.`
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
                `❌ Belum ada quotes *${command}* di database.`
            )
        }

        const quote = validQuotes[
            Math.floor(
                Math.random() *
                validQuotes.length
            )
        ]

        const anu = `─────〔 *${command}* 〕─────

${quote.trim()}
`

        await conn.reply(
            m.chat,
            anu,
            m
        )

    } catch (e) {
        console.error(
            `[QUOTES DATABASE ERROR] ${command}`,
            e
        )

        await m.reply(
            `❌ Terjadi error saat membaca database *${command}*.`
        )
    }
}

handler.help = [
    'bucin',
    'ilham',
    'dilan',
    'fiersa',
    'fakta',
    'nyindir',
    'ngawur',
    'jawa',
    'quotes',
    'sunda',
    'batak',
    'aceh',
    'cina',
    'minangkabau'
]

handler.tags = ['quotes']

handler.command =
    /^(bucin|ilham|dilan|fiersa|fakta|nyindir|ngawur|jawa|quotes|sunda|batak|aceh|cina|minangkabau)$/i

handler.limit = true
handler.fail = null

export default handler