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
    'tebakmeme.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebakmeme?apikey=${btc}`

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
        String(json.imgFilter || '').trim() &&
        String(json.Img || '').trim() &&
        String(json.Hint || '').trim() &&
        String(json.Jawaban || '').trim()
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
            imgFilter: String(
                json.imgFilter
            ).trim(),

            Img: String(
                json.Img
            ).trim(),

            Hint: String(
                json.Hint
            ).trim(),

            Jawaban: String(
                json.Jawaban
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
        conn.tebakmeme = conn.tebakmeme
            ? conn.tebakmeme
            : {}

        const id = m.chat

        if (id in conn.tebakmeme) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebakmeme[id][0]
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

        const imgFilter = String(
            json.imgFilter
        ).trim()

        const imgJawaban = String(
            json.Img
        ).trim()

        const hint = String(
            json.Hint
        ).trim()

        const jawaban = String(
            json.Jawaban
        ).trim()

        const caption = `
≡ _GAME TEBAK MEME_

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Hint: ${hint}
▢ *REPLY* pesan ini untuk menjawab
└──────────────
`.trim()

        const pesan =
            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: imgFilter
                    },
                    caption: caption
                },
                {
                    quoted: m
                }
            )

        const timer = setTimeout(
            async () => {
                if (conn.tebakmeme[id]) {
                    try {
                        await conn.sendMessage(
                            m.chat,
                            {
                                image: {
                                    url: imgJawaban
                                },
                                caption:
                                    `Waktu habis!\nJawabannya adalah *${jawaban}*`
                            },
                            {
                                quoted:
                                    conn.tebakmeme[id][0]
                            }
                        )
                    } catch (e) {
                        console.error(
                            '[TEBAKMEME TIMEOUT ERROR]',
                            e
                        )

                        await conn.reply(
                            m.chat,
                            `Waktu habis!\nJawabannya adalah *${jawaban}*`,
                            conn.tebakmeme[id][0]
                        )
                    }

                    delete conn.tebakmeme[id]
                }
            },
            timeout
        )

        conn.tebakmeme[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[TEBAKMEME ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan tebak meme.',
            m
        )
    }
}

handler.help = [
    'tebakmeme'
]

handler.tags = [
    'game'
]

handler.command =
    /^tebakmeme$/i

handler.limit = false
handler.group = true

export default handler