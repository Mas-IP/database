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
    'tebakkata.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebakkata?apikey=${btc}`

const timeout = 100000
const poin = 10000

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

        return Array.isArray(json)
            ? json
            : []
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

        return json

    } catch {
        return null
    }
}

let handler = async (
    m,
    { conn, usedPrefix }
) => {
    try {
        conn.tbkata = conn.tbkata
            ? conn.tbkata
            : {}

        const id = m.chat

        if (id in conn.tbkata) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tbkata[id][0]
            )
        }

        let database = readDatabase()
        let json = null

        // =========================
        // DATABASE SEBAGAI SUMBER UTAMA
        // =========================

        if (database.length > 0) {
            json = database[
                Math.floor(
                    Math.random() *
                    database.length
                )
            ]
        }

        // =========================
        // FALLBACK API
        // =========================

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

            // Simpan soal fallback API
            database.push(json)
            saveDatabase(database)
        }

        const soal = String(
            json.soal
        ).trim()

        const jawaban = String(
            json.jawaban
        ).trim()

        const caption = `
${soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}tkaa untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas / Reply soal ini untuk menjawab*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (conn.tbkata[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${jawaban}*`,
                    conn.tbkata[id][0]
                )
            }

            delete conn.tbkata[id]

        }, timeout)

        conn.tbkata[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[TEBAKKATA ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak kata.',
            m
        )
    }
}

handler.help = ['tebakkata']
handler.tags = ['game']
handler.command = /^tebakkata$/i
handler.register = false
handler.group = true

export default handler