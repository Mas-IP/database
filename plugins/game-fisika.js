//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

let timeout = 100000
let poin = 10000

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'fisika.json')

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

        // Hapus soal yang sudah digunakan
        database.splice(index, 1)

        saveDatabase(database)

        return json
    }

    // FALLBACK API JIKA DATABASE KOSONG
    try {
        const response = await fetch(
            `https://api.botcahx.eu.org/api/game/fisika?apikey=${btc}`
        )

        if (!response.ok) {
            return null
        }

        const src = await response.json()

        if (
            !src ||
            !src.soal ||
            !Array.isArray(src.pilihan) ||
            !src.pilihan.length ||
            !src.jawaban
        ) {
            return null
        }

        return {
            soal: String(src.soal),
            pilihan: src.pilihan.map(opt =>
                String(opt)
            ),
            jawaban: String(src.jawaban),
            level: src.level
                ? String(src.level)
                : ''
        }

    } catch (e) {
        console.error('[FISIKA API]', e)
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    conn.fisika = conn.fisika
        ? conn.fisika
        : {}

    let id = m.chat

    if (id in conn.fisika) {
        conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.fisika[id][0]
        )

        throw false
    }

    let json = await getSoal()

    if (!json) {
        return conn.reply(
            m.chat,
            `❌ Soal fisika tidak tersedia.\n\n` +
            `Database kosong dan API gagal mengambil soal.`,
            m
        )
    }

    let options = json.pilihan
        .map((opt, i) =>
            `${String.fromCharCode(65 + i)}. ${opt}`
        )
        .join('\n')

    let caption = `
${json.soal}

${options}

┌─⊷ *SOAL*
▢ Level: *${json.level || '-'}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}fska untuk clue jawaban
▢ *Balas/ reply soal ini untuk menjawab dengan a, b, c, atau d*
└──────────────
`.trim()

    conn.fisika[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {
            if (conn.fisika[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    conn.fisika[id][0]
                )

                delete conn.fisika[id]
            }
        }, timeout)
    ]
}

handler.help = ['fisika']
handler.tags = ['game']
handler.command = /^fisika/i
handler.register = false
handler.group = true

export default handler