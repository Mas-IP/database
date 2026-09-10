//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

let timeout = 100000
let poin = 1000

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebakemoji.json')

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

    // DATABASE SEBAGAI SUMBER UTAMA
    if (database.length > 0) {
        const index = Math.floor(
            Math.random() * database.length
        )

        const json = database[index]

        // Hapus soal yang sudah dipakai
        database.splice(index, 1)

        saveDatabase(database)

        return json
    }

    // FALLBACK API JIKA DATABASE KOSONG
    try {
        const response = await fetch(
            `https://api.botcahx.eu.org/api/game/tebakemoji?apikey=${btc}`
        )

        if (!response.ok) {
            return null
        }

        const json = await response.json()

        if (
            !json ||
            !json.emoticon ||
            !json.soal ||
            !json.jawaban
        ) {
            return null
        }

        return {
            emoticon: String(json.emoticon),
            soal: String(json.soal),
            jawaban: String(json.jawaban),
            deskripsi: json.deskripsi
                ? String(json.deskripsi)
                : ''
        }

    } catch (e) {
        console.error('[TEBAKEMOJI API]', e)
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakemoji = conn.tebakemoji
        ? conn.tebakemoji
        : {}

    let id = m.chat

    if (id in conn.tebakemoji) {
        conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.tebakemoji[id][0]
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
*TEBAK EMOJI*
Emoji nya: ${json.emoticon}

┌─⊷ *SOAL*
▢ ${json.soal}
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}hemo untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ reply soal ini untuk menjawab*
└──────────────
`.trim()

    conn.tebakemoji[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {
            if (conn.tebakemoji[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\n` +
                    `Jawabannya adalah *${json.jawaban}*\n\n` +
                    `Deskripsi: ${json.deskripsi || '-'}`,
                    conn.tebakemoji[id][0]
                )

                delete conn.tebakemoji[id]
            }
        }, timeout)
    ]
}

handler.help = ['tebakemoji']
handler.tags = ['game']
handler.command = /^tebakemoji/i
handler.register = false
handler.group = true

export default handler