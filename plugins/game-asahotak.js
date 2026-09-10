//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

let timeout = 100000
let poin = 10000

const gameDir = path.join(process.cwd(), 'database', 'game')
const gameFile = path.join(gameDir, 'asahotak.json')

function ensureDatabase() {
    if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir, { recursive: true })
    }

    if (!fs.existsSync(gameFile)) {
        fs.writeFileSync(gameFile, '[]')
    }
}

function readDatabase() {
    ensureDatabase()

    try {
        let data = fs.readFileSync(gameFile, 'utf8')
        let json = JSON.parse(data)

        if (!Array.isArray(json)) return []

        return json
    } catch {
        return []
    }
}

function saveDatabase(data) {
    ensureDatabase()

    fs.writeFileSync(
        gameFile,
        JSON.stringify(data, null, 2)
    )
}

async function getSoal() {
    let database = readDatabase()

    // DATABASE ADALAH SUMBER UTAMA
    if (database.length > 0) {
        let index = Math.floor(Math.random() * database.length)
        let soal = database[index]

        // Hapus soal yang sudah dipakai
        database.splice(index, 1)
        saveDatabase(database)

        return soal
    }

    // DATABASE KOSONG → FALLBACK KE API
    try {
        let response = await fetch(
            `https://api.botcahx.eu.org/api/game/asahotak?apikey=${btc}`
        )

        if (!response.ok) {
            return null
        }

        let json = await response.json()

        if (!json.soal || !json.jawaban) {
            return null
        }

        // Simpan soal API ke database
        // supaya database tetap menjadi sumber utama
        saveDatabase([json])

        // Karena soal ini langsung dipakai,
        // hapus kembali dari database
        let data = readDatabase()

        if (data.length > 0) {
            data.shift()
            saveDatabase(data)
        }

        return json

    } catch (e) {
        console.error('[ASAHOTAK API]', e)
        return null
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    conn.asahotak = conn.asahotak
        ? conn.asahotak
        : {}

    let id = m.chat

    if (id in conn.asahotak) {
        conn.reply(
            m.chat,
            'Masih ada soal belum terjawab di chat ini',
            conn.asahotak[id][0]
        )

        throw false
    }

    let json = await getSoal()

    if (!json) {
        return conn.reply(
            m.chat,
            `❌ Soal tidak tersedia.\n\nDatabase soal kosong dan API gagal mengambil soal.`,
            m
        )
    }

    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}toka untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ Reply soal ini untuk menjawab*
└──────────────
`.trim()

    conn.asahotak[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {
            if (conn.asahotak[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawabannya adalah *${json.jawaban}*`,
                    conn.asahotak[id][0]
                )

                delete conn.asahotak[id]
            }
        }, timeout)
    ]
}

handler.help = ['asahotak']
handler.tags = ['game']
handler.command = /^asahotak/i
handler.register = false
handler.group = true

export default handler