//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebakislami.json')

const API_URL = `https://api.botcahx.eu.org/api/game/kuisislami?apikey=${btc}`

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

function validQuestion(data) {
    return (
        data &&
        data.soal &&
        Array.isArray(data.pilihan) &&
        data.pilihan.length > 0 &&
        data.jawaban
    )
}

function isDuplicate(database, data) {
    const soal = String(data.soal)
        .trim()
        .toLowerCase()

    return database.some(item => {
        return String(item.soal || '')
            .trim()
            .toLowerCase() === soal
    })
}

async function getApiQuestion() {
    try {
        const response = await fetch(API_URL)

        if (!response.ok) return null

        const json = await response.json()

        return validQuestion(json) ? json : null
    } catch {
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakislami = conn.tebakislami
        ? conn.tebakislami
        : {}

    const id = m.chat

    if (id in conn.tebakislami) {
        return conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.tebakislami[id][0]
        )
    }

    let database = readDatabase()

    let data

    // =========================
    // AMBIL DARI DATABASE
    // =========================

    if (database.length > 0) {
        data = database[
            Math.floor(Math.random() * database.length)
        ]
    }

    // =========================
    // FALLBACK API
    // =========================

    if (!validQuestion(data)) {
        data = await getApiQuestion()

        if (!data) {
            return conn.reply(
                m.chat,
                '❌ Tidak ada soal tersedia.',
                m
            )
        }

        // Masukkan soal API ke database
        if (!isDuplicate(database, data)) {
            database.push(data)
            saveDatabase(database)
        }
    }

    const pilihan = data.pilihan.map(opt =>
        String(opt).trim()
    )

    const options = pilihan
        .map((opt, i) => {
            return `${String.fromCharCode(65 + i)}. ${opt}`
        })
        .join('\n')

    const caption = `
${data.soal}

${options}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tsa untuk clue jawaban
▢ *Balas/reply soal ini untuk menjawab dengan a, b, c, atau d*
└──────────────
`.trim()

    const pesan = await conn.reply(
        m.chat,
        caption,
        m
    )

    const timer = setTimeout(() => {
        if (conn.tebakislami[id]) {
            conn.reply(
                m.chat,
                `Waktu habis!\nJawabannya adalah *${data.jawaban}*`,
                conn.tebakislami[id][0]
            )

            delete conn.tebakislami[id]
        }
    }, timeout)

    conn.tebakislami[id] = [
        pesan,
        data,
        poin,
        timer
    ]
}

handler.help = ['tebakislami']
handler.tags = ['game']
handler.command = /^tebakislami$/i
handler.register = false
handler.group = true

export default handler