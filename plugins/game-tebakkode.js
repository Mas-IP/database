//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebakkode.json')

const API_URL = `https://api.botcahx.eu.org/api/game/tebakkode?apikey=${btc}`

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

        if (
            !json ||
            !json.soal ||
            !Array.isArray(json.pilihan) ||
            json.pilihan.length === 0 ||
            !json.jawaban
        ) {
            return null
        }

        return json
    } catch {
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    try {
        conn.tebakkode = conn.tebakkode
            ? conn.tebakkode
            : {}

        const id = m.chat

        if (id in conn.tebakkode) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebakkode[id][0]
            )
        }

        let database = readDatabase()
        let json = null

        // Database sebagai sumber utama
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
            !Array.isArray(json.pilihan) ||
            !json.pilihan.length ||
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

            database.push(json)
            saveDatabase(database)
        }

        const soal = String(json.soal).trim()
        const bahasa = String(json.bahasa || '').trim()
        const jawaban = String(json.jawaban).trim()

        const pilihan = json.pilihan.map(opt => {
            return String(opt).trim()
        })

        const options = pilihan
            .map((opt, i) => {
                return `${String.fromCharCode(65 + i)}. ${opt}`
            })
            .join('\n')

        const caption = `
${soal}

${options}

┌─⊷ *SOAL*
▢ Bahasa: *${bahasa}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}kdo untuk clue jawaban
▢ *Balas/ reply soal ini untuk menjawab dengan a, b, c, atau d*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (conn.tebakkode[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${jawaban}*`,
                    conn.tebakkode[id][0]
                )

                delete conn.tebakkode[id]
            }
        }, timeout)

        conn.tebakkode[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error('[TEBAKKODE ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak kode.',
            m
        )
    }
}

handler.help = ['tebakkode']
handler.tags = ['game']
handler.command = /^tebakkode$/i
handler.register = false
handler.group = true

export default handler