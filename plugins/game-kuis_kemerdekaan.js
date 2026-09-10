//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

let timeout = 100000
let poin = 10000

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'kuismerdeka.json')

function ensureDatabase() {
    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, { recursive: true })
    }

    if (!fs.existsSync(GAME_FILE)) {
        fs.writeFileSync(GAME_FILE, '[]')
    }
}

function readDatabase() {
    ensureDatabase()

    try {
        const data = fs.readFileSync(GAME_FILE, 'utf8')
        const json = JSON.parse(data)

        return Array.isArray(json) ? json : []
    } catch {
        return []
    }
}

function saveDatabase(data) {
    ensureDatabase()

    fs.writeFileSync(
        GAME_FILE,
        JSON.stringify(data, null, 2)
    )
}

async function getSoal() {
    let database = readDatabase()

    // DATABASE ADALAH SUMBER UTAMA
    if (database.length > 0) {
        const index = Math.floor(
            Math.random() * database.length
        )

        const json = database[index]

        // Hapus soal setelah dipakai
        database.splice(index, 1)

        saveDatabase(database)

        return json
    }

    // FALLBACK API JIKA DATABASE KOSONG
    try {
        const response = await fetch(
            `https://api.botcahx.eu.org/api/game/kuismerdeka?apikey=${btc}`
        )

        if (!response.ok) {
            return null
        }

        const json = await response.json()

        if (
            !json ||
            !json.soal ||
            !json.jawaban
        ) {
            return null
        }

        return {
            soal: String(json.soal),
            jawaban: String(json.jawaban)
        }

    } catch (e) {
        console.error('[KUISMERDEKA API]', e)
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    conn.merdeka = conn.merdeka
        ? conn.merdeka
        : {}

    let id = m.chat

    if (id in conn.merdeka) {
        conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.merdeka[id][0]
        )

        throw false
    }

    let json = await getSoal()

    if (!json) {
        return conn.reply(
            m.chat,
            `❌ Soal tidak tersedia.\n\n` +
            `Database kosong dan API gagal mengambil soal.`,
            m
        )
    }

    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}mka untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim()

    conn.merdeka[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {
            if (conn.merdeka[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    conn.merdeka[id][0]
                )

                delete conn.merdeka[id]
            }
        }, timeout)
    ]
}

handler.help = ['kuismerdeka']
handler.tags = ['game']
handler.command = /^kuismerdeka/i
handler.register = false
handler.group = true

export default handler