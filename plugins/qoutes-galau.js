//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname

let handler = async (m, { conn }) => {
    try {
        const filePath = path.join(__dirname, '../database/quotes/galau.json')

        if (!fs.existsSync(filePath)) {
            return m.reply('Database quotes galau tidak ditemukan.')
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        if (!Array.isArray(data) || data.length === 0) {
            return m.reply('Database quotes galau masih kosong.')
        }

        const quote = data[Math.floor(Math.random() * data.length)]

        const anu = `─────〔 *Galau* 〕─────

${quote}
`

        m.reply(anu)
    } catch (e) {
        console.error('[GALAU ERROR]', e)
        m.reply('Terjadi error saat mengambil quotes.')
    }
}

handler.help = ['galau']
handler.tags = ['quotes']
handler.command = /^(galau)$/i
handler.limit = true
handler.fail = null

export default handler