//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'family100.json')

const API_URL = `https://api.botcahx.eu.org/api/game/family100-2?apikey=${btc}`

const winScore = 500
const rewardAmount = 100
const TIMEOUT = 180000

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

function validQuestion(json) {
    return (
        json &&
        json.soal &&
        Array.isArray(json.jawaban) &&
        json.jawaban.length > 0
    )
}

function randomQuestion(database) {
    return database[
        Math.floor(Math.random() * database.length)
    ]
}

function addToDatabase(json) {
    const database = readDatabase()

    const soal = String(json.soal)
        .trim()
        .toLowerCase()

    const duplicate = database.some(item => {
        return String(item.soal || '')
            .trim()
            .toLowerCase() === soal
    })

    if (!duplicate) {
        database.push({
            soal: String(json.soal).trim(),
            jawaban: json.jawaban.map(v => String(v).trim())
        })

        saveDatabase(database)
    }
}

let handler = async (m) => {
    conn.family = conn.family ? conn.family : {}

    const id = m.chat

    if (id in conn.family) {
        if (conn.family[id].id !== undefined) {
            return conn.reply(
                m.chat,
                'Masih ada kuis yang belum terjawab di chat ini\n' +
                'Tunggu 3 menit untuk mengakhiri',
                conn.family[id].msg
            )
        }

        delete conn.family[id]
        throw false
    }

    let database = readDatabase()
    let json = null

    // Ambil dari database
    if (database.length > 0) {
        json = randomQuestion(database)
    }

    // Fallback API kalau database kosong
    if (!json) {
        try {
            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error('API Error')
            }

            const apiData = await response.json()

            if (!validQuestion(apiData)) {
                throw new Error('Format API tidak sesuai')
            }

            json = {
                soal: String(apiData.soal).trim(),
                jawaban: apiData.jawaban.map(v =>
                    String(v).trim()
                )
            }

            // Simpan hasil API ke database
            addToDatabase(json)

        } catch (e) {
            console.error('[FAMILY100]', e)

            return conn.reply(
                m.chat,
                '❌ Gagal mengambil soal.',
                m
            )
        }
    }

    const caption = `
┌─⊷ *SOAL*
▢ *Soal:* ${json.soal}
▢ Terdapat *${json.jawaban.length}* jawaban
▢ Beberapa jawaban mungkin terdapat spasi
▢ Tunggu 3 menit untuk mengakhiri
▢ Ketik *nyerah* untuk menyelesaikan permainan
└──────────────

+${rewardAmount} kredit sosial! tiap jawaban benar
`.trim()

    const msg = await m.reply(caption)

    conn.family[id] = {
        id,
        msg,
        soal: json.soal,
        jawaban: json.jawaban,
        terjawab: Array.from(
            json.jawaban,
            () => false
        ),
        winScore,
        rewardAmount,
        timeout: setTimeout(() => {
            if (conn.family[id]) {
                conn.reply(
                    m.chat,
                    'Waktu habis! Game berakhir.',
                    conn.family[id].msg
                )

                delete conn.family[id]
            }
        }, TIMEOUT)
    }
}

handler.help = ['family100']
handler.tags = ['game']
handler.group = true
handler.command = /^family100$/i

handler.nyerah = async function (m) {
    const id = m.chat

    if (id in conn.family) {
        conn.reply(
            m.chat,
            'Permainan berakhir karena menyerah.',
            conn.family[id].msg
        )

        clearTimeout(conn.family[id].timeout)
        delete conn.family[id]
    } else {
        conn.reply(
            m.chat,
            'Tidak ada permainan yang sedang berlangsung.',
            m
        )
    }
}

export default handler