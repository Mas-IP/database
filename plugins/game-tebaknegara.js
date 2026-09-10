//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'tebaknegara.json')

const timeout = 100000
const poin = 10000

const API_URL = `https://api.botcahx.eu.org/api/game/tebaknegara?apikey=${btc}`

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
            !json.deskripsi ||
            !json.clue ||
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
        if (!conn.tebaknegara) {
            conn.tebaknegara = {}
        }

        const id = m.chat

        if (id in conn.tebaknegara) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebaknegara[id][0]
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

        // Database kosong → fallback API
        if (
            !json ||
            !json.deskripsi ||
            !json.clue ||
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

        const caption = `
┌─⊷ *SOAL TEBAK NEGARA*
▢ Deskripsi: ${json.deskripsi}
▢ Clue: ${json.clue}
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}tbn untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas / REPLY soal ini untuk menjawab*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (conn.tebaknegara[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    conn.tebaknegara[id][0]
                )
            }

            delete conn.tebaknegara[id]
        }, timeout)

        conn.tebaknegara[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error('[TEBAKNEGARA ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak negara.',
            m
        )
    }
}

handler.help = ['tebaknegara']
handler.tags = ['game']
handler.command = /^tebaknegara$/i
handler.register = false
handler.group = true

export default handler