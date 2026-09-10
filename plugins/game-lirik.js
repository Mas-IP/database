//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebaklirik.json')

const API_URL = `https://api.botcahx.eu.org/api/game/tebaklirik?apikey=${btc}`

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
    return (
        json &&
        json.question &&
        json.answer
    )
}

function addDatabase(json) {
    if (!validQuestion(json)) return

    const database = readDatabase()

    const question = String(json.question)
        .trim()
        .toLowerCase()

    const duplicate = database.some(item => {
        return String(item.question || '')
            .trim()
            .toLowerCase() === question
    })

    if (!duplicate) {
        database.push({
            question: String(json.question).trim(),
            answer: String(json.answer).trim()
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
    conn.tebaklirik = conn.tebaklirik
        ? conn.tebaklirik
        : {}

    const id = m.chat

    if (id in conn.tebaklirik) {
        return conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.tebaklirik[id][0]
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
                question: String(apiData.question).trim(),
                answer: String(apiData.answer).trim()
            }

            // Simpan hasil API ke database
            addDatabase(json)

        } catch (e) {
            console.error('[TEBAK LIRIK]', e)

            return conn.reply(
                m.chat,
                '❌ Gagal mengambil soal.',
                m
            )
        }
    }

    const caption = `
${json.question}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}liga untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim()

    const soalMessage = await conn.reply(
        m.chat,
        caption,
        m
    )

    conn.tebaklirik[id] = [
        soalMessage,
        json,
        poin,
        setTimeout(() => {
            if (conn.tebaklirik[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.answer}*`,
                    conn.tebaklirik[id][0]
                )

                delete conn.tebaklirik[id]
            }
        }, timeout)
    ]
}

handler.help = ['tebaklirik']
handler.tags = ['game']
handler.command = /^tebaklirik/i
handler.register = false
handler.group = true

export default handler