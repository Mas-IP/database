//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebaktebakan.json')

const API_URL = `https://api.botcahx.eu.org/api/game/tebaktebakan?apikey=${btc}`

const timeout = 100000
const poin = 10000

function ensureDatabase() {
    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, { recursive: true })
    }

    if (!fs.existsSync(GAME_FILE)) {
        fs.writeFileSync(GAME_FILE, '[]', 'utf8')
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
        JSON.stringify(data, null, 2),
        'utf8'
    )
}

async function getApiQuestion() {
    try {
        const response = await fetch(API_URL)

        if (!response.ok) return null

        const json = await response.json()

        if (!json || !json.soal || !json.jawaban) {
            return null
        }

        return json
    } catch {
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    try {
        conn.tebaktebakan = conn.tebaktebakan
            ? conn.tebaktebakan
            : {}

        const id = m.chat

        if (id in conn.tebaktebakan) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebaktebakan[id][0]
            )
        }

        let database = readDatabase()
        let json = null

        // Database menjadi sumber utama
        if (database.length > 0) {
            json = database[
                Math.floor(
                    Math.random() * database.length
                )
            ]
        }

        // Fallback API jika database kosong
        if (
            !json ||
            !json.soal ||
            !json.jawaban
        ) {
            json = await getApiQuestion()

            if (!json) {
                return conn.reply(
                    m.chat,
                    '❌ Database kosong dan API gagal mengambil soal.',
                    m
                )
            }

            // Simpan hasil fallback API
            database.push(json)
            saveDatabase(database)
        }

        const soal = String(json.soal).trim()
        const jawaban = String(json.jawaban).trim()

        const caption = `
${soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}tika untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (conn.tebaktebakan[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${jawaban}*`,
                    conn.tebaktebakan[id][0]
                )
            }

            delete conn.tebaktebakan[id]
        }, timeout)

        conn.tebaktebakan[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error('[TEBAKTEBAKAN ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak-tebakan.',
            m
        )
    }
}

handler.help = ['tebaktebakan']
handler.tags = ['game']
handler.command = /^tebaktebakan$/i
handler.register = false
handler.group = true

export default handler