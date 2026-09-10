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
    'tebakdrakor.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebakdrakor?apikey=${btc}`

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

function isValidQuestion(json) {
    return (
        json &&
        typeof json === 'object' &&
        String(json.img || '').trim() &&
        String(json.jawaban || '').trim() &&
        String(json.deskripsi || '').trim()
    )
}

async function getApiQuestion() {
    try {
        const response = await fetch(
            API_URL
        )

        if (!response.ok) {
            return null
        }

        const json = await response.json()

        if (!isValidQuestion(json)) {
            return null
        }

        return {
            img: String(
                json.img
            ).trim(),

            jawaban: String(
                json.jawaban
            ).trim(),

            deskripsi: String(
                json.deskripsi
            ).trim()
        }

    } catch {
        return null
    }
}

let handler = async (
    m,
    { conn, usedPrefix }
) => {
    try {
        conn.tebakdrakor =
            conn.tebakdrakor
                ? conn.tebakdrakor
                : {}

        const id = m.chat

        if (id in conn.tebakdrakor) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebakdrakor[id][0]
            )
        }

        let database = readDatabase()
        let json = null

        // Database sebagai sumber utama
        if (database.length > 0) {
            const validDatabase =
                database.filter(
                    item => isValidQuestion(item)
                )

            if (validDatabase.length > 0) {
                json =
                    validDatabase[
                        Math.floor(
                            Math.random() *
                            validDatabase.length
                        )
                    ]
            }
        }

        // Fallback API jika database kosong
        // atau tidak memiliki data valid
        if (!isValidQuestion(json)) {
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

        const img = String(
            json.img
        ).trim()

        const deskripsi = String(
            json.deskripsi
        ).trim()

        const jawaban = String(
            json.jawaban
        ).trim()

        const caption = `
≡ _GAME TEBAK DRAKOR_

┌─⊷ *SOAL*
▢ Penjelasan: *${deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tdkt untuk clue jawaban
▢ *REPLY* pesan ini untuk menjawab
└──────────────
`.trim()

        const pesan =
            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: img
                    },
                    caption: caption
                },
                {
                    quoted: m
                }
            )

        const timer = setTimeout(
            async () => {
                if (conn.tebakdrakor[id]) {
                    await conn.reply(
                        m.chat,
                        `Waktu habis!\nJawabannya adalah *${jawaban}*`,
                        conn.tebakdrakor[id][0]
                    )

                    delete conn.tebakdrakor[id]
                }
            },
            timeout
        )

        conn.tebakdrakor[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[TEBAKDRAKOR ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak drakor.',
            m
        )
    }
}

handler.help = [
    'tebakdrakor'
]

handler.tags = [
    'game'
]

handler.command =
    /^tebakdrakor$/i

handler.limit = true
handler.group = true

export default handler