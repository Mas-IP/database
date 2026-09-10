//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebakwallet.json')

const API_URL = `https://api.botcahx.eu.org/api/game/tebakwallet?apikey=${btc}`

let timeout = 100000
let poin = 10000

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

function validQuestion(json) {
    return json && json.soal && json.jawaban
}

function addDatabase(json) {
    if (!validQuestion(json)) return

    const database = readDatabase()

    const soal = String(json.soal)
        .trim()
        .toLowerCase()

    const duplicate = database.some(item => {
        return String(item.soal || '')
            .trim()
            .toLowerCase() === soal
    })

    if (!duplicate) {
        database.push({
            soal: String(json.soal).trim(),
            jawaban: String(json.jawaban).trim()
        })

        saveDatabase(database)
    }
}

function randomQuestion(database) {
    if (!database.length) return null

    return database[
        Math.floor(Math.random() * database.length)
    ]
}

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakwallet = conn.tebakwallet
        ? conn.tebakwallet
        : {}

    const id = m.chat

    if (id in conn.tebakwallet) {
        return conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.tebakwallet[id][0]
        )
    }

    let database = readDatabase()
    let json = null

    // Ambil dari database
    if (database.length > 0) {
        json = randomQuestion(database)
    }

    // Fallback API jika database kosong
    if (!json) {
        try {
            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error('API Error')
            }

            const apiData = await response.json()

            if (!validQuestion(apiData)) {
                throw new Error('Format API tidak sesuai')
            }

            json = {
                soal: String(apiData.soal).trim(),
                jawaban: String(apiData.jawaban).trim()
            }

            // Simpan hasil API
            addDatabase(json)

        } catch (e) {
            console.error('[TEBAKWALLET]', e)

            return conn.reply(
                m.chat,
                '❌ Gagal mengambil soal.',
                m
            )
        }
    }

    const caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}twa untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ reply soal ini untuk menjawab*
└──────────────
`.trim()

    const soalMessage = await conn.reply(
        m.chat,
        caption,
        m
    )

    conn.tebakwallet[id] = [
        soalMessage,
        json,
        poin,
        setTimeout(() => {
            if (conn.tebakwallet[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    conn.tebakwallet[id][0]
                )

                delete conn.tebakwallet[id]
            }
        }, timeout)
    ]
}

handler.help = ['tebakwallet']
handler.tags = ['game']
handler.command = /^tebakwallet/i
handler.register = false
handler.group = true

export default handler