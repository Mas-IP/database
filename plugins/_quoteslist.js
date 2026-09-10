//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const QUOTES_DIR = path.join(process.cwd(), 'database', 'quotes')

function getQuotesFiles() {
    if (!fs.existsSync(QUOTES_DIR)) {
        return []
    }

    return fs.readdirSync(QUOTES_DIR)
        .filter(file => /\.json$/i.test(file))
        .sort()
}

function getQuoteCount(file) {
    const filePath = path.join(QUOTES_DIR, file)

    try {
        const data = fs.readFileSync(filePath, 'utf8')

        if (!data.trim()) {
            return 0
        }

        const json = JSON.parse(data)

        if (!Array.isArray(json)) {
            return 0
        }

        return json.length
    } catch (e) {
        console.log(`[QUOTES LIST] Gagal membaca ${file}`)
        return 0
    }
}

let handler = async (m, { conn }) => {
    console.log('[QUOTES LIST] Membaca database quotes')

    if (!fs.existsSync(QUOTES_DIR)) {
        console.log('[QUOTES LIST] Folder database/quotes tidak ditemukan')

        return m.reply(
            '❌ Database quotes belum tersedia.'
        )
    }

    const files = getQuotesFiles()

    if (files.length === 0) {
        console.log('[QUOTES LIST] Tidak ada file quotes')

        return m.reply(
            '❌ Belum ada data quotes di database.'
        )
    }

    let totalQuotes = 0
    let text = '─────〔 *QUOTES LIST* 〕─────\n\n'

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const name = file.replace(/\.json$/i, '')
        const count = getQuoteCount(file)

        totalQuotes += count

        text += `${i + 1}. *${name}* : ${count}\n`
    }

    text +=
        `\n━━━━━━━━━━━━━━━━━━\n` +
        `📂 Total file : ${files.length}\n` +
        `📝 Total quote : ${totalQuotes}`

    console.log('[QUOTES LIST]')
    console.log(`file ${String(files.length).padStart(2, '0')}`)
    console.log(`quotes ${String(totalQuotes).padStart(2, '0')}`)

    await m.reply(text)
}

handler.help = ['quoteslist']
handler.tags = ['quotes']
handler.command = /^quoteslist$/i

handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.register = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

export default handler