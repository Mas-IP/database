//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')
const GAME_FILE = path.join(GAME_DIR, 'math.json')

const API_URL = `https://api.botcahx.eu.org/api/game/math?apikey=${btc}`

const modes = {
    noob: { bonus: 10, time: 20000, money: 500 },
    easy: { bonus: 20, time: 30000, money: 1000 },
    medium: { bonus: 40, time: 40000, money: 2500 },
    hard: { bonus: 100, time: 60000, money: 5000 },
    master: { bonus: 250, time: 70000, money: 10000 },
    grandmaster: { bonus: 500, time: 90000, money: 25000 },
    legendary: { bonus: 1000, time: 120000, money: 50000 },
    mythic: { bonus: 3000, time: 150000, money: 75000 },
    god: { bonus: 5000, time: 200000, money: 100000 }
}

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

async function getApiData() {
    try {
        const response = await fetch(API_URL)

        if (!response.ok) return []

        const json = await response.json()

        return Array.isArray(json) ? json : []
    } catch {
        return []
    }
}

function isValid(data) {
    return (
        data &&
        data.soal &&
        data.jawaban &&
        Array.isArray(data.jawabanGanda) &&
        data.jawabanGanda.length > 0 &&
        data.level
    )
}

let handler = async (m, { conn, args, usedPrefix }) => {
    conn.math = conn.math
        ? conn.math
        : {}

    const modeList = Object.keys(modes)

    if (args.length < 1) {
        return conn.reply(
            m.chat,
            `Silakan pilih tingkat kesulitan.\n\n` +
            `${modeList.join(' | ')}\n\n` +
            `Contoh:\n${usedPrefix}math medium`,
            m
        )
    }

    const mode = String(args[0]).toLowerCase()

    if (!(mode in modes)) {
        return conn.reply(
            m.chat,
            `Mode tidak ditemukan!\n\n${modeList.join(' | ')}`,
            m
        )
    }

    const id = m.chat

    if (id in conn.math) {
        return conn.reply(
            m.chat,
            'Masih ada soal yang belum terjawab di chat ini.',
            conn.math[id][0]
        )
    }

    try {
        let database = readDatabase()

        // Cari soal sesuai level dari database
        let soalDitemukan = database.filter(q => {
            return (
                q &&
                q.level &&
                String(q.level).toLowerCase() === mode &&
                q.soal &&
                q.jawaban &&
                Array.isArray(q.jawabanGanda)
            )
        })

        // Fallback API jika database kosong / tidak ada level tersebut
        if (soalDitemukan.length === 0) {
            const apiData = await getApiData()

            const validData = apiData.filter(isValid)

            if (validData.length > 0) {
                for (const item of validData) {
                    const duplicate = database.some(old => {
                        return (
                            String(old.soal || '').trim().toLowerCase() ===
                            String(item.soal || '').trim().toLowerCase()
                        )
                    })

                    if (!duplicate) {
                        database.push(item)
                    }
                }

                saveDatabase(database)

                soalDitemukan = database.filter(q => {
                    return (
                        q &&
                        q.level &&
                        String(q.level).toLowerCase() === mode &&
                        q.soal &&
                        q.jawaban &&
                        Array.isArray(q.jawabanGanda)
                    )
                })
            }
        }

        if (soalDitemukan.length === 0) {
            return conn.reply(
                m.chat,
                `❌ Tidak ada soal Math untuk level *${mode}*.\n` +
                `Database juga gagal mengambil soal dari API.`,
                m
            )
        }

        // Random 1 soal
        const data = soalDitemukan[
            Math.floor(Math.random() * soalDitemukan.length)
        ]

        const { bonus, time, money } = modes[mode]

        const pilihan = data.jawabanGanda.map(opt =>
            String(opt).trim()
        )

        const options = pilihan
            .map((opt, i) => {
                return `${String.fromCharCode(65 + i)}. ${opt}`
            })
            .join('\n')

        const indexJawaban = pilihan.findIndex(opt => {
            return opt.toLowerCase() ===
                String(data.jawaban).trim().toLowerCase()
        })

        if (indexJawaban < 0) {
            return conn.reply(
                m.chat,
                '❌ Jawaban soal tidak ditemukan di pilihan.',
                m
            )
        }

        const hurufJawaban = String.fromCharCode(
            65 + indexJawaban
        )

        const caption = `
Berapa jawaban dari *${data.soal}*?

${options}

┌─⊷ *SOAL*
▢ Level: *${data.level}*
▢ Timeout: ${(time / 1000).toFixed(2)} detik
▢ Bonus: +${bonus} XP & +${money} Money
▢ *Balas/reply soal ini untuk menjawab dengan a, b, c, atau d*
└──────────────
`.trim()

        const pesan = await conn.reply(
            m.chat,
            caption,
            m
        )

        const timer = setTimeout(() => {
            if (conn.math[id]) {
                conn.reply(
                    m.chat,
                    `Waktu habis!\nJawaban: *${hurufJawaban} (${data.jawaban})*`,
                    conn.math[id][0]
                )

                delete conn.math[id]
            }
        }, time)

        conn.math[id] = [
            pesan,
            {
                jawaban: hurufJawaban,
                jawabanAsli: data.jawaban,
                pilihan: pilihan,
                bonus: bonus,
                money: money,
                time: time
            },
            4,
            timer
        ]

    } catch (e) {
        console.error('[MATH ERROR]', e)

        await conn.reply(
            m.chat,
            '❌ Error mengambil soal Math.',
            m
        )
    }
}

handler.help = ['math <mode>']
handler.tags = ['game']
handler.command = /^math$/i

export default handler