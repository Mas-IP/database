//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const timeout = 100000
const poin = 10000

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'siapakahaku.json')

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

function randomSoal(database) {
    if (!database.length) return null

    const index = Math.floor(
        Math.random() * database.length
    )

    return database[index]
}

async function ambilAPI() {
    try {
        const response = await fetch(
            `https://api.botcahx.eu.org/api/game/siapakahaku?apikey=${btc}`
        )

        if (!response.ok) return null

        const src = await response.json()

        if (
            !src ||
            !src.soal ||
            !src.jawaban
        ) {
            return null
        }

        return {
            soal: String(src.soal).trim(),
            jawaban: String(src.jawaban).trim()
        }

    } catch (e) {
        console.error(
            '[SIAPAKAH AKU API]',
            e.message
        )

        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    try {
        if (!conn.siapakahaku) {
            conn.siapakahaku = {}
        }

        const id = m.chat

        if (id in conn.siapakahaku) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.siapakahaku[id][0]
            )
        }

        let database = readDatabase()
        let json = null

        // Database sebagai sumber utama
        if (database.length > 0) {
            json = randomSoal(database)

            console.log(
                `[SIAPAKAH AKU] Menggunakan database | total: ${database.length}`
            )
        }

        // Database kosong → API
        if (!json) {
            console.log(
                '[SIAPAKAH AKU] Database kosong, mengambil API...'
            )

            json = await ambilAPI()

            if (!json) {
                return conn.reply(
                    m.chat,
                    '❌ Database kosong dan API gagal mengambil soal.',
                    m
                )
            }

            database.push(json)
            saveDatabase(database)

            console.log(
                `[SIAPAKAH AKU] Soal API disimpan | total: ${database.length}`
            )
        }

        const caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}maka untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/REPLY soal ini untuk menjawab*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (!conn.siapakahaku[id]) return

            conn.reply(
                m.chat,
                `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                conn.siapakahaku[id][0]
            )

            delete conn.siapakahaku[id]

        }, timeout)

        conn.siapakahaku[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[SIAPAKAH AKU ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Terjadi kesalahan saat menjalankan game.',
            m
        )
    }
}

handler.help = ['siapakahaku']
handler.tags = ['game']
handler.command = /^siapakahaku$/i
handler.register = false
handler.group = true

export default handler