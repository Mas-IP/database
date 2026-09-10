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
    'tebakchara.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebakchara?apikey=${btc}`

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
        String(json.desc || '').trim() &&
        String(json.image || '').trim() &&
        String(json.name || '').trim()
    )
}

function normalizeQuestion(json) {
    if (
        !json ||
        typeof json !== 'object'
    ) {
        return null
    }

    const result = json.result || json

    if (!result || typeof result !== 'object') {
        return null
    }

    const question = {
        desc: String(
            result.desc || ''
        ).trim(),

        image: String(
            result.image || ''
        ).trim(),

        name: String(
            result.name || ''
        ).trim()
    }

    return isValidQuestion(question)
        ? question
        : null
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

        return normalizeQuestion(json)

    } catch {
        return null
    }
}

let handler = async (
    m,
    { conn, usedPrefix }
) => {
    try {
        conn.tebakchara = conn.tebakchara
            ? conn.tebakchara
            : {}

        const id = m.chat

        if (id in conn.tebakchara) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebakchara[id][0]
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

        const desc = String(
            json.desc
        ).trim()

        const image = String(
            json.image
        ).trim()

        const name = String(
            json.name
        ).trim()

        const caption = `
≡ _GAME TEBAK KARAKTER_

┌─⊷ *SOAL*
▢ Penjelasan: *${desc}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}chrd untuk clue jawaban
▢ *REPLY* pesan ini untuk menjawab
└──────────────
`.trim()

        const pesan =
            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: image
                    },
                    caption: caption
                },
                {
                    quoted: m
                }
            )

        const timer = setTimeout(
            async () => {
                if (conn.tebakchara[id]) {
                    await conn.reply(
                        m.chat,
                        `Waktu habis!\nJawabannya adalah *${name}*`,
                        conn.tebakchara[id][0]
                    )

                    delete conn.tebakchara[id]
                }
            },
            timeout
        )

        conn.tebakchara[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[TEBAKCHARA ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak karakter.',
            m
        )
    }
}

handler.help = [
    'tebakchara'
]

handler.tags = [
    'game'
]

handler.command =
    /^tebakchara$/i

handler.limit = false
handler.group = true

export default handler