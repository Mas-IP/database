//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(
    process.cwd(),
    'database',
    'game'
)

const GAME_FILE = path.join(
    GAME_DIR,
    'tebakkalimat.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebakkalimat?apikey=${btc}`

let timeout = 100000
let poin = 500

function ensureDatabase() {
    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, {
            recursive: true
        })
    }

    if (!fs.existsSync(GAME_FILE)) {
        fs.writeFileSync(
            GAME_FILE,
            '[]',
            'utf8'
        )
    }
}

function readDatabase() {
    ensureDatabase()

    try {
        const data = fs.readFileSync(
            GAME_FILE,
            'utf8'
        )

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
    return (
        json &&
        json.soal &&
        json.jawaban
    )
}

function addToDatabase(json) {
    if (!validQuestion(json)) {
        return false
    }

    const database = readDatabase()

    const soal = String(json.soal)
        .trim()
        .toLowerCase()

    const duplicate = database.some(item => {
        return String(item.soal || '')
            .trim()
            .toLowerCase() === soal
    })

    if (duplicate) {
        return false
    }

    database.push({
        soal: String(json.soal).trim(),
        jawaban: String(json.jawaban).trim()
    })

    saveDatabase(database)

    return true
}

function getRandomQuestion(database) {
    if (!database.length) {
        return null
    }

    const index = Math.floor(
        Math.random() * database.length
    )

    return database[index]
}

let handler = async (
    m,
    { conn, usedPrefix }
) => {
    conn.tebakkalimat =
        conn.tebakkalimat
            ? conn.tebakkalimat
            : {}

    const id = m.chat

    if (id in conn.tebakkalimat) {
        return conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.tebakkalimat[id][0]
        )
    }

    let database = readDatabase()
    let json = null

    // =========================
    // AMBIL DARI DATABASE
    // =========================

    if (database.length > 0) {
        json = getRandomQuestion(database)
    }

    // =========================
    // FALLBACK API
    // =========================

    if (!json) {
        try {
            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error('API Error')
            }

            const apiData = await response.json()

            if (!validQuestion(apiData)) {
                throw new Error(
                    'Format API tidak sesuai'
                )
            }

            json = {
                soal: String(apiData.soal).trim(),
                jawaban: String(apiData.jawaban).trim()
            }

            // Simpan soal API ke database
            addToDatabase(json)

        } catch (e) {
            console.error(
                '[TEBAKKALIMAT]',
                e
            )

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
▢ Ketik ${usedPrefix}tela untuk bantuan
▢ Bonus: ${poin} Kredit sosial
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim()

    const soalMessage = await conn.reply(
        m.chat,
        caption,
        m
    )

    conn.tebakkalimat[id] = [
        soalMessage,
        json,
        poin,
        setTimeout(() => {
            if (conn.tebakkalimat[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\n` +
                    `Jawabannya adalah *${json.jawaban}*`,
                    conn.tebakkalimat[id][0]
                )

                delete conn.tebakkalimat[id]
            }
        }, timeout)
    ]
}

handler.help = ['tebakkalimat']
handler.tags = ['game']
handler.command = /^tebakkalimat/i
handler.register = false
handler.group = true

export default handler