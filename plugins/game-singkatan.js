//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'singkatan.json')

const timeout = 100000
const poin = 10000

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
    } catch (e) {
        console.error('[SINGKATAN] Database error:', e)
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
            `https://api.botcahx.eu.org/api/game/singkatan?apikey=${btc}`
        )

        if (!response.ok) {
            return null
        }

        const src = await response.json()

        if (
            !src ||
            !src.singkatan ||
            !src.kepanjangan
        ) {
            return null
        }

        return {
            singkatan: String(src.singkatan).trim(),
            kepanjangan: String(src.kepanjangan).trim(),
            deskripsi: src.deskripsi
                ? String(src.deskripsi).trim()
                : ''
        }

    } catch (e) {
        console.error(
            '[SINGKATAN API ERROR]',
            e.message
        )

        return null
    }
}

let handler = async (
    m,
    { conn, usedPrefix }
) => {
    try {
        if (!conn.singkatan) {
            conn.singkatan = {}
        }

        const id = m.chat

        // Masih ada soal aktif
        if (id in conn.singkatan) {
            return conn.reply(
                m.chat,
                'Masih ada soal belum terjawab di chat ini',
                conn.singkatan[id][0]
            )
        }

        let database = readDatabase()
        let json = null

        // ==========================================
        // DATABASE SEBAGAI SUMBER UTAMA
        // ==========================================

        if (database.length > 0) {
            json = randomSoal(database)

            console.log(
                `[SINGKATAN] Mengambil soal dari database (${database.length} soal)`
            )
        }

        // ==========================================
        // DATABASE KOSONG → API
        // ==========================================

        if (!json) {
            console.log(
                '[SINGKATAN] Database kosong, mengambil dari API...'
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
                `[SINGKATAN] Soal API disimpan. Total database: ${database.length}`
            )
        }

        // ==========================================
        // SOAL
        // ==========================================

        const caption = `
┌─⊷ *SOAL*
▢ Singkatan nya: ${json.singkatan}, Tebak kepanjangannya apa?
▢ Deskripsi: ${json.deskripsi || '-'}
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}sktn untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/reply soal ini untuk menjawab*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        // ==========================================
        // TIMER
        // ==========================================

        const timer = setTimeout(() => {
            if (!conn.singkatan[id]) return

            conn.reply(
                m.chat,
                `Waktu habis!\nJawabannya adalah *${json.kepanjangan}*`,
                conn.singkatan[id][0]
            )

            delete conn.singkatan[id]

        }, timeout)

        // ==========================================
        // SIMPAN SOAL AKTIF
        // ==========================================

        conn.singkatan[id] = [
            pesan,
            json,
            poin,
            timer
        ]

    } catch (e) {
        console.error(
            '[SINGKATAN ERROR]',
            e
        )

        await conn.reply(
            m.chat,
            '❌ Terjadi kesalahan saat menjalankan game singkatan.',
            m
        )
    }
}

handler.help = ['singkatan']
handler.tags = ['game']
handler.command = /^singkatan$/i
handler.register = false
handler.group = true

export default handler