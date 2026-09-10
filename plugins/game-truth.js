//create code Wonge-bot

import fs from 'fs'
import path from 'path'

const GAME_FILE = path.join(
    process.cwd(),
    'database',
    'game',
    'truth.json'
)

const IMG = 'https://raw.githubusercontent.com/Mas-IP/Storage/main/assets/image/image_1787160534965.jpg'

let handler = async (m, { conn }) => {
    try {
        if (!fs.existsSync(GAME_FILE)) {
            return conn.reply(
                m.chat,
                '❌ Database truth belum tersedia.\nGunakan *.gameapi* terlebih dahulu.',
                m
            )
        }

        const data = JSON.parse(
            fs.readFileSync(GAME_FILE, 'utf8')
        )

        if (!Array.isArray(data) || data.length === 0) {
            return conn.reply(
                m.chat,
                '❌ Database truth masih kosong.\nGunakan *.gameapi* terlebih dahulu.',
                m
            )
        }

        const random = Math.floor(
            Math.random() * data.length
        )

        const truth = data[random]

        if (!truth || !truth.result) {
            return conn.reply(
                m.chat,
                '❌ Data truth tidak valid.',
                m
            )
        }

        await conn.sendFile(
            m.chat,
            IMG,
            'truth.jpg',
            `*TRUTH*\n\n“${truth.result}”`,
            m
        )

    } catch (e) {
        console.error('[TRUTH ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Gagal membaca database truth.',
            m
        )
    }
}

handler.help = ['truth']
handler.tags = ['fun']
handler.command = /^(truth|kebenaran|kejujuran)$/i
handler.limit = true

export default handler