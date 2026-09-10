//create code Wonge-bot

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const QUOTES_DIR = path.join(
    process.cwd(),
    'database',
    'quotes'
)

const QUOTES_FILE = path.join(
    QUOTES_DIR,
    'anime.json'
)

const MAX_REQUEST = 10
const DELAY = 3000

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function ensureDatabase() {
    if (!fs.existsSync(QUOTES_DIR)) {
        fs.mkdirSync(QUOTES_DIR, {
            recursive: true
        })
    }

    if (!fs.existsSync(QUOTES_FILE)) {
        fs.writeFileSync(
            QUOTES_FILE,
            '[]',
            'utf8'
        )
    }
}

function loadQuotes() {
    try {
        const data = fs.readFileSync(
            QUOTES_FILE,
            'utf8'
        )

        if (!data.trim()) {
            return []
        }

        const json = JSON.parse(data)

        if (!Array.isArray(json)) {
            return []
        }

        return json

    } catch (e) {
        return []
    }
}

function saveQuotes(quotes) {
    const temp = `${QUOTES_FILE}.tmp`

    fs.writeFileSync(
        temp,
        JSON.stringify(
            quotes,
            null,
            2
        ),
        'utf8'
    )

    fs.renameSync(
        temp,
        QUOTES_FILE
    )
}

function isSameQuote(a, b) {
    if (!a || !b) {
        return false
    }

    return (
        a.quotes === b.quotes &&
        a.karakter === b.karakter &&
        a.anime === b.anime &&
        a.episode === b.episode
    )
}

async function fetchAnime() {
    try {

        const response = await fetch(
            `https://api.botcahx.eu.org/api/random/quotesanime?apikey=${btc}`
        )

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (
            !data ||
            !Array.isArray(data.result) ||
            data.result.length === 0
        ) {
            return null
        }

        /*
         * API mengembalikan banyak data.
         * Pilih satu secara random.
         */
        const item =
            data.result[
                Math.floor(
                    Math.random() *
                    data.result.length
                )
            ]

        if (
            !item ||
            typeof item !== 'object' ||
            typeof item.quotes !== 'string' ||
            !item.quotes.trim()
        ) {
            return null
        }

        return {
            quotes: item.quotes.trim(),
            karakter: item.karakter || '',
            anime: item.anime || '',
            episode: item.episode || '',
            gambar: item.gambar || ''
        }

    } catch (e) {
        return null
    }
}

let handler = async (m, { conn }) => {

    if (handler.running) {
        return m.reply(
            '⚠️ *API 2* masih berjalan.'
        )
    }

    handler.running = true

    ensureDatabase()

    let quotes = loadQuotes()

    let berhasil = 0
    let sudahAda = 0
    let gagal = 0

    try {

        await m.reply(
            `⏳ *API 2 dimulai*\n\n` +
            `API: quotesanime\n` +
            `Request: ${MAX_REQUEST}x\n` +
            `Jeda: 3 detik`
        )

        for (
            let i = 0;
            i < MAX_REQUEST;
            i++
        ) {

            const anime =
                await fetchAnime()

            if (!anime) {

                gagal++

            } else if (
                quotes.some(item => {
                    return isSameQuote(
                        item,
                        anime
                    )
                })
            ) {

                sudahAda++

            } else {

                quotes.push(anime)

                berhasil++
            }

            if (
                i < MAX_REQUEST - 1
            ) {
                await sleep(DELAY)
            }
        }

        saveQuotes(quotes)

        console.log('')
        console.log('*quotes*')
        console.log(
            `berhasil ${String(berhasil).padStart(2, '0')}`
        )
        console.log(
            `sudah ada ${String(sudahAda).padStart(2, '0')}`
        )
        console.log(
            `gagal ${String(gagal).padStart(2, '0')}`
        )
        console.log('')

        await m.reply(
            `✅ *API 2 selesai*\n\n` +
            `Berhasil: ${berhasil}\n` +
            `Sudah ada: ${sudahAda}\n` +
            `Gagal: ${gagal}\n\n` +
            `Data tersimpan di database/quotes/anime.json`
        )

    } catch (e) {

        console.log('')
        console.log('*quotes*')
        console.log(
            `berhasil ${String(berhasil).padStart(2, '0')}`
        )
        console.log(
            `sudah ada ${String(sudahAda).padStart(2, '0')}`
        )
        console.log(
            `gagal ${String(gagal).padStart(2, '0')}`
        )
        console.log('')

        await m.reply(
            '⚠️ *API 2 berhenti karena error.*'
        )

    } finally {
        handler.running = false
    }
}

handler.help = ['api2']
handler.tags = ['quotes']
handler.command = /^api2$/i

handler.owner = true
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.register = false

handler.admin = false
handler.botAdmin = false
handler.fail = null

export default handler