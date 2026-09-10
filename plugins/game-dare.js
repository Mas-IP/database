//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const GAME_FILE = path.join(
    process.cwd(),
    'database',
    'game',
    'dare.json'
)

const IMG = 'https://raw.githubusercontent.com/Mas-IP/Storage/main/assets/image/image_1787160534965.jpg'

let handler = async (m, { conn }) => {
    try {
        if (!fs.existsSync(GAME_FILE)) {
            return conn.reply(
                m.chat,
                '❌ Database dare belum tersedia.',
                m
            )
        }

        const data = JSON.parse(
            fs.readFileSync(GAME_FILE, 'utf8')
        )

        if (!Array.isArray(data) || data.length === 0) {
            return conn.reply(
                m.chat,
                '❌ Database dare masih kosong.',
                m
            )
        }

        const random = Math.floor(
            Math.random() * data.length
        )

        const dare = data[random]

        if (!dare || !dare.result) {
            return conn.reply(
                m.chat,
                '❌ Data dare tidak valid.',
                m
            )
        }

        await conn.sendFile(
            m.chat,
            IMG,
            'dare.jpg',
            `*DARE*\n\n“${dare.result}”`,
            m
        )

    } catch (e) {
        console.error('[DARE ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Gagal mengirim dare.',
            m
        )
    }
}

handler.help = ['dare']
handler.tags = ['fun']
handler.command = /^(dare|berani|tantangan)$/i
handler.limit = true

export default handler