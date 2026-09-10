//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebakkimia.json')

const API_URL = `https://api.botcahx.eu.org/api/game/tebakkimia?apikey=${btc}`

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

        if (!json || !json.nama || !json.lambang) {
            return null
        }

        return json
    } catch {
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    try {
        conn.kimia = conn.kimia
            ? conn.kimia
            : {}

        const id = m.chat

        if (id in conn.kimia) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.kimia[id][0]
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
            !json.nama ||
            !json.lambang
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

        const nama = String(json.nama).trim()
        const lambang = String(json.lambang).trim()

        const caption = `
*${nama}*

┌─⊷ *SOAL*
▢ Apa rumus kimia dari zat kimia/ senyawa di atas?
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}kmi untuk bantuan
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
            if (conn.kimia[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${lambang}*`,
                    conn.kimia[id][0]
                )
            }

            delete conn.kimia[id]
        }, timeout)

        conn.kimia[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error('[TEBAKKIMIA ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak kimia.',
            m
        )
    }
}

handler.help = ['tebakkimia']
handler.tags = ['game']
handler.command = /^tebakkimia$/i
handler.register = false
handler.group = false

export default handler