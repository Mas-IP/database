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
    'tekateki.json'
)

const timeout = 100000
const poin = 10000

const API_URL =
    `https://api.botcahx.eu.org/api/game/tekateki?apikey=${btc}`

function ensureDatabase() {

    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(
            GAME_DIR,
            {
                recursive: true
            }
        )
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

        const data =
            fs.readFileSync(
                GAME_FILE,
                'utf8'
            )

        const json =
            JSON.parse(data)

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
        JSON.stringify(
            data,
            null,
            2
        ),
        'utf8'
    )
}

async function getApiQuestion() {

    try {

        const response =
            await fetch(API_URL)

        if (!response.ok) {
            return null
        }

        const json =
            await response.json()

        if (
            !json ||
            !json.data ||
            !json.data.pertanyaan ||
            !json.data.jawaban
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
    {
        conn,
        usedPrefix
    }
) => {

    try {

        conn.tekateki =
            conn.tekateki
                ? conn.tekateki
                : {}

        const id =
            m.chat

        if (
            id in
            conn.tekateki
        ) {

            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tekateki[id][0]
            )
        }

        let database =
            readDatabase()

        let json = null

        // =========================
        // AMBIL DARI DATABASE
        // =========================

        if (
            database.length > 0
        ) {

            json =
                database[
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
            !json.data ||
            !json.data.pertanyaan ||
            !json.data.jawaban
        ) {

            json =
                await getApiQuestion()

            if (!json) {

                return conn.reply(
                    m.chat,
                    '❌ Database kosong dan API gagal mengambil soal.',
                    m
                )
            }

            database.push(
                json
            )

            saveDatabase(
                database
            )
        }

        const pertanyaan =
            String(
                json.data.pertanyaan
            ).trim()

        const jawaban =
            String(
                json.data.jawaban
            ).trim()

        const caption = `
*TEKA TEKI*

${pertanyaan}

┌─⊷ *SOAL*
▢ Waktu jawab *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Bantuan ${usedPrefix}tete
▢ *Balas / REPLY soal ini untuk menjawab*
└──────────────
`.trim()

        const pesan =
            await conn.reply(
                m.chat,
                caption,
                m
            )

        const timer =
            setTimeout(() => {

                if (
                    conn.tekateki[id]
                ) {

                    conn.reply(
                        m.chat,
                        `Waktu habis!\nJawabannya adalah *${jawaban}*`,
                        conn.tekateki[id][0]
                    )
                }

                delete conn.tekateki[id]

            }, timeout)

        // Tetap memakai struktur lama
        conn.tekateki[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {

        console.error(
            '[TEKATEKI ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Gagal menjalankan teka teki.',
            m
        )
    }
}

handler.help = [
    'tekateki'
]

handler.tags = [
    'game'
]

handler.command =
    /^tekateki$/i

handler.group = true

export default handler