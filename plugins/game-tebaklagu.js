//create code Wonge-bot
//tebaklagu

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
    'tebaklagu.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebaklagu?apikey=${btc}`

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
        String(json.lagu || '').trim() &&
        String(json.judul || '').trim() &&
        String(json.artis || '').trim()
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
            lagu: String(json.lagu).trim(),
            judul: String(json.judul).trim(),
            artis: String(json.artis).trim()
        }
    } catch (e) {
        console.error(
            '[TEBAKLAGU API ERROR]',
            e.message
        )

        return null
    }
}

let handler = async (m, { conn, command, usedPrefix }) => {
    try {
        conn.tebaklagu = conn.tebaklagu || {}

        const id = m.chat

        if (id in conn.tebaklagu) {
            conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebaklagu[id][0]
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

        const caption = `*${command.toUpperCase()}*
Penyanyi: ${json.artis}

┌─⊷ *SOAL*
▢Timeout *${(timeout / 1000).toFixed(2)} detik*
▢Ketik *${usedPrefix}lag* untuk bantuan
▢Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (conn.tebaklagu[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.judul}*`,
                    conn.tebaklagu[id][0]
                )

                delete conn.tebaklagu[id]
            }
        }, timeout)

        conn.tebaklagu[id] = [
            pesan,
            json,
            poin,
            timer
        ]

        await conn.sendFile(
            m.chat,
            json.lagu,
            'tebaklagu.mp3',
            '',
            pesan
        )

    } catch (e) {
        console.error(
            '[TEBAKLAGU ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Terjadi kesalahan saat mengambil soal.',
            m
        )
    }
}

handler.help = ['tebaklagu']
handler.tags = ['game']
handler.command = /^tebaklagu$/i
handler.limit = true

export default handler