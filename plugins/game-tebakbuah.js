//create code Wonge-bot
//tebakbuah

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
    'tebakbuah.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebakbuah?apikey=${btc}`

const timeout = 100000
const poin = 10000

function ensureDatabase() {
    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, { recursive: true })
    }

    if (!fs.existsSync(GAME_FILE)) {
        fs.writeFileSync(
            GAME_FILE,
            JSON.stringify([], null, 2)
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

        return Array.isArray(json) ? json : []
    } catch {
        return []
    }
}

function saveDatabase(data) {
    ensureDatabase()

    fs.writeFileSync(
        GAME_FILE,
        JSON.stringify(data, null, 2)
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
        const response = await fetch(API_URL)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const json = await response.json()

        if (!isValidQuestion(json)) {
            throw new Error('Format data API tidak valid')
        }

        return {
            img: String(json.img).trim(),
            jawaban: String(json.jawaban).trim(),
            deskripsi: String(json.deskripsi).trim()
        }
    } catch (e) {
        console.error(
            '[TEKBAKBUAH API ERROR]',
            e.message
        )

        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    try {
        conn.tebakbuah = conn.tebakbuah || {}

        const id = m.chat

        if (id in conn.tebakbuah) {
            conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebakbuah[id][0]
            )
            return
        }

        let database = readDatabase()

        const validQuestions = database.filter(
            isValidQuestion
        )

        let json

        // Ambil soal dari database terlebih dahulu
        if (validQuestions.length > 0) {
            json =
                validQuestions[
                    Math.floor(
                        Math.random() *
                        validQuestions.length
                    )
                ]
        } else {
            // Database kosong, ambil dari API
            json = await getApiQuestion()

            if (json) {
                database.push(json)
                saveDatabase(database)
            }
        }

        if (!json) {
            await conn.reply(
                m.chat,
                '❌ Database kosong dan API gagal mengambil soal.',
                m
            )
            return
        }

        const caption = `
≡ _GAME TEBAK BUAH_ ≡

┌─⊷ *SOAL*
▢ Deskripsi Buah: *${json.deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tbau untuk clue jawaban
▢ *REPLY* pesan ini untuk
menjawab
└──────────────
        `.trim()

        const pesan = await conn.sendMessage(
            m.chat,
            {
                image: {
                    url: json.img
                },
                caption
            },
            {
                quoted: m
            }
        )

        const timer = setTimeout(() => {
            if (conn.tebakbuah[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    conn.tebakbuah[id][0]
                )

                delete conn.tebakbuah[id]
            }
        }, timeout)

        conn.tebakbuah[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[TEBAKBUAH ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Terjadi kesalahan saat mengambil soal.',
            m
        )
    }
}

handler.help = ['tebakbuah']
handler.tags = ['game']
handler.command = /^tebakbuah$/i
handler.limit = false
handler.group = true

export default handler