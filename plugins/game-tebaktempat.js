//create code Wonge-bot
//tebaktempat

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
    'tebaktempat.json'
)

const API_URL =
    `https://api.botcahx.eu.org/api/game/tebaktempat?apikey=${btc}`

const timeout = 100000
const poin = 10000

function ensureDatabase() {
    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, { recursive: true })
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

        return Array.isArray(json) ? json : []
    } catch (e) {
        console.log('[TEBAKTEMPAT DB READ ERROR]', e)
        return []
    }
}

function saveDatabase(data) {
    ensureDatabase()

    try {
        fs.writeFileSync(
            GAME_FILE,
            JSON.stringify(data, null, 2),
            'utf8'
        )
    } catch (e) {
        console.log('[TEBAKTEMPAT DB SAVE ERROR]', e)
    }
}

function isValidQuestion(json) {
    return (
        json &&
        typeof json === 'object' &&
        String(json.soal || '').trim() &&
        Array.isArray(json.pilihan) &&
        json.pilihan.length > 0 &&
        json.pilihan.every(opt => String(opt || '').trim()) &&
        String(json.jawaban || '').trim() &&
        String(json.img || '').trim() &&
        String(json.deskripsi || '').trim()
    )
}

async function getApiQuestion() {
    try {
        const res = await fetch(API_URL)

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }

        const result = await res.json()

        if (!isValidQuestion(result)) {
            throw new Error('Format soal dari API tidak valid')
        }

        return {
            soal: String(result.soal).trim(),
            pilihan: result.pilihan.map(opt =>
                String(opt).trim()
            ),
            jawaban: String(result.jawaban).trim(),
            img: String(result.img).trim(),
            deskripsi: String(result.deskripsi).trim()
        }
    } catch (e) {
        console.log('[TEBAKTEMPAT API ERROR]', e.message)
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    try {
        conn.tebaktempat = conn.tebaktempat || {}

        const id = m.chat

        if (id in conn.tebaktempat) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.tebaktempat[id][0]
            )
        }

        let database = readDatabase()

        const validQuestions = database.filter(
            isValidQuestion
        )

        let json

        // Ambil dari database terlebih dahulu
        if (validQuestions.length > 0) {
            json = validQuestions[
                Math.floor(
                    Math.random() * validQuestions.length
                )
            ]
        } else {
            // Database kosong -> ambil dari API
            json = await getApiQuestion()

            if (json) {
                database.push(json)
                saveDatabase(database)
            }
        }

        if (!json) {
            return conn.reply(
                m.chat,
                '❌ Database kosong dan API gagal mengambil soal.',
                m
            )
        }

        const options = json.pilihan
            .map(
                (opt, i) =>
                    `${String.fromCharCode(65 + i)}. ${opt}`
            )
            .join('\n')

        const caption = `
${json.soal}

${options}

┌─⊷ *SOAL*
▢ Timeout: *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tpc untuk clue jawaban
▢ *Balas/reply soal ini untuk menjawab dengan A, B, C, atau D*
└──────────────
`.trim()

        const pesan = await conn.sendMessage(
            m.chat,
            {
                image: {
                    url: json.img
                },
                caption: caption
            },
            {
                quoted: m
            }
        )

        const timer = setTimeout(() => {
            if (conn.tebaktempat[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*\n\nDeskripsi: ${json.deskripsi}`,
                    conn.tebaktempat[id][0]
                )

                delete conn.tebaktempat[id]
            }
        }, timeout)

        conn.tebaktempat[id] = [
            pesan,
            json,
            poin,
            timer
        ]
    } catch (e) {
        console.log('[TEBAKTEMPAT ERROR]', e)

        return conn.reply(
            m.chat,
            '❌ Gagal membuat soal tebak tempat.',
            m
        )
    }
}

handler.help = ['tebaktempat']
handler.tags = ['game']
handler.command = /^tebaktempat$/i
handler.register = false
handler.group = true

export default handler