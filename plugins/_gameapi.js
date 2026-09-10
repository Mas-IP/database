// create code Wonge-bot
// gameapi semua game - target data per API

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(
    process.cwd(),
    'database',
    'game'
)

const STATE_FILE = path.join(
    GAME_DIR,
    '_gameapi_state.json'
)

// =========================================================
// SETTING
// =========================================================

const TARGET = 5
const DELAY = 1000

const GAMES = [
    ['tebaktempat', `https://api.botcahx.eu.org/api/game/tebaktempat?apikey=${btc}`],
    ['tebakpokemon', `https://api.botcahx.eu.org/api/game/tebakpokemon?apikey=${btc}`],
    ['tebakmakanan', `https://api.botcahx.eu.org/api/game/tebakmakanan?apikey=${btc}`],
    ['tebaklagu', `https://api.botcahx.eu.org/api/game/tebaklagu?apikey=${btc}`],
    ['tebakjkt48', `https://api.botcahx.eu.org/api/game/tebakjkt48?apikey=${btc}`],
    ['tebakhewan', `https://api.botcahx.eu.org/api/game/tebakhewan?apikey=${btc}`],
    ['tebakheroml', `https://api.botcahx.eu.org/api/game/tebakheroml?apikey=${btc}`],
    ['tebakclubbola', `https://api.botcahx.eu.org/api/game/tebakclubbola?apikey=${btc}`],
    ['tebakbuah', `https://api.botcahx.eu.org/api/game/tebakbuah?apikey=${btc}`],
    ['tebakanime', `https://api.botcahx.eu.org/api/game/tebakanime?apikey=${btc}`],
    ['tebaktokoh', `https://api.botcahx.eu.org/api/game/tebaknamatokoh?apikey=${btc}`],
    ['tebaklogo', `https://api.botcahx.eu.org/api/game/tebaklogo?apikey=${btc}`],
    ['tebakgenshin', `https://api.botcahx.eu.org/api/game/tebak-genshin?apikey=${btc}`],
    ['tebakgambar', `https://api.botcahx.eu.org/api/game/tebakgambar?apikey=${btc}`],
    ['tebakff', `https://api.botcahx.eu.org/api/game/tebakepep?apikey=${btc}`],
    ['tebakdrakor', `https://api.botcahx.eu.org/api/game/tebakdrakor?apikey=${btc}`],
    ['tebakkpop', `https://api.botcahx.eu.org/api/game/tebakpop?apikey=${btc}`],
    ['tebakmeme', `https://api.botcahx.eu.org/api/game/tebakmeme?apikey=${btc}`],
    ['tebakchara', `https://api.botcahx.eu.org/api/game/tebakchara?apikey=${btc}`]
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function ensureDir() {
    if (!fs.existsSync(GAME_DIR)) {
        fs.mkdirSync(GAME_DIR, {
            recursive: true
        })
    }
}

function readJSON(file, fallback) {
    try {
        if (!fs.existsSync(file)) {
            return fallback
        }

        const raw = fs.readFileSync(
            file,
            'utf8'
        )

        if (!raw.trim()) {
            return fallback
        }

        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2),
        'utf8'
    )
}

function getDBFile(name) {
    return path.join(
        GAME_DIR,
        `${name}.json`
    )
}

function readDB(name) {
    const data = readJSON(
        getDBFile(name),
        []
    )

    if (Array.isArray(data)) {
        return data
    }

    if (
        data &&
        Array.isArray(data.data)
    ) {
        return data.data
    }

    return []
}

function saveDB(name, data) {
    try {
        writeJSON(
            getDBFile(name),
            data
        )
    } catch (e) {
        console.error(
            `[GAMEAPI] ${name}:`,
            e.message
        )
    }
}

/*
 * =========================================================
 * STATE
 * =========================================================
 *
 * Menyimpan API terakhir yang sudah diproses.
 *
 * Setiap command:
 * API 1 → API 19
 *
 * Command berikutnya:
 * API 1 → API 19 lagi
 *
 * Tidak digunakan untuk melewati API.
 */

function getState() {
    const state = readJSON(
        STATE_FILE,
        {
            totalRun: 0
        }
    )

    if (
        !state ||
        typeof state !== 'object'
    ) {
        return {
            totalRun: 0
        }
    }

    return state
}

function saveState(state) {
    writeJSON(
        STATE_FILE,
        state
    )
}

/*
 * =========================================================
 * AMBIL DATA DARI RESPONSE
 * =========================================================
 */

function extractData(json) {

    if (
        json === null ||
        json === undefined
    ) {
        return null
    }

    /*
     * Response langsung array.
     */
    if (Array.isArray(json)) {

        if (!json.length) {
            return null
        }

        return json[
            Math.floor(
                Math.random() * json.length
            )
        ]
    }

    /*
     * Cari container umum.
     */
    const fields = [
        'data',
        'result',
        'results',
        'response',
        'game',
        'games'
    ]

    for (const field of fields) {

        const value =
            json[field]

        if (Array.isArray(value)) {

            if (value.length) {
                return value[
                    Math.floor(
                        Math.random() * value.length
                    )
                ]
            }
        }

        if (
            value &&
            typeof value === 'object'
        ) {
            return value
        }
    }

    /*
     * Jika response langsung object game.
     */
    if (
        typeof json === 'object'
    ) {

        const ignored = [
            'status',
            'success',
            'message',
            'msg',
            'code'
        ]

        const keys =
            Object.keys(json)

        const valid =
            keys.some(
                key =>
                    !ignored.includes(
                        key.toLowerCase()
                    )
            )

        if (valid) {
            return json
        }
    }

    return null
}

/*
 * =========================================================
 * NORMALISASI DATABASE
 * =========================================================
 *
 * Data asli API tetap dipertahankan.
 *
 * Hanya index yang ditambahkan jika belum ada.
 */

function normalizeData(data, db) {

    if (
        !data ||
        typeof data !== 'object'
    ) {
        return null
    }

    /*
     * Jangan mengubah object asli API.
     */
    const result = {
        ...data
    }

    /*
     * Kalau API sudah punya index,
     * pertahankan.
     *
     * Kalau belum ada, buat index.
     */
    if (
        result.index === undefined ||
        result.index === null
    ) {
        result.index =
            db.length + 1
    }

    return result
}

/*
 * =========================================================
 * DUPLICATE
 * =========================================================
 */

function valueString(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return ''
    }

    if (
        typeof value === 'string'
    ) {
        return value
            .trim()
            .toLowerCase()
    }

    try {
        return JSON.stringify(value)
            .toLowerCase()
    } catch {
        return String(value)
            .toLowerCase()
    }
}

function getDataKey(data) {

    if (
        !data ||
        typeof data !== 'object'
    ) {
        return null
    }

    /*
     * Field prioritas untuk mendeteksi duplicate.
     */
    const fields = [
        'id',
        'img',
        'image',
        'fullimg',
        'logo',
        'url',
        'audio',
        'lagu',
        'soal',
        'question',
        'pertanyaan',
        'jawaban',
        'Jawaban',
        'answer',
        'nama',
        'name',
        'judul',
        'title',
        'deskripsi',
        'description',
        'desc',
        'clue',
        'hint'
    ]

    for (const field of fields) {

        if (
            data[field] !== undefined &&
            data[field] !== null
        ) {

            const value =
                valueString(
                    data[field]
                )

            if (value) {
                return `${field}:${value}`
            }
        }
    }

    /*
     * Fallback seluruh object,
     * index dikeluarkan supaya index berbeda
     * tidak dianggap sebagai data berbeda.
     */
    const copy = {
        ...data
    }

    delete copy.index

    try {
        return JSON.stringify(copy)
            .toLowerCase()
    } catch {
        return null
    }
}

function isDuplicate(data, db) {

    const key =
        getDataKey(data)

    if (!key) {
        return false
    }

    return db.some(
        oldData =>
            getDataKey(oldData) === key
    )
}

/*
 * =========================================================
 * REQUEST
 * =========================================================
 */

async function requestGame(name, url) {

    try {

        const response =
            await fetch(
                url,
                {
                    method: 'GET',

                    headers: {
                        'Accept':
                            'application/json',

                        'User-Agent':
                            'Mozilla/5.0'
                    },

                    timeout: 30000
                }
            )

        if (!response.ok) {

            return {
                success: false,
                error:
                    `HTTP ${response.status}`
            }
        }

        const text =
            await response.text()

        if (!text.trim()) {

            return {
                success: false,
                error:
                    'Response kosong'
            }
        }

        let json

        try {

            json =
                JSON.parse(text)

        } catch {

            return {
                success: false,
                error:
                    'Response bukan JSON'
            }
        }

        const data =
            extractData(json)

        if (
            !data ||
            typeof data !== 'object'
        ) {

            return {
                success: false,
                error:
                    'Data game tidak ditemukan'
            }
        }

        return {
            success: true,
            data
        }

    } catch (e) {

        return {
            success: false,
            error:
                e.message ||
                'Request gagal'
        }
    }
}

/*
 * =========================================================
 * HANDLER
 * =========================================================
 */

let handler = async (m, { conn }) => {

    ensureDir()

    /*
     * Cegah dua proses gameapi
     * berjalan bersamaan.
     */
    if (global.gameapiRunning) {

        return conn.reply(
            m.chat,
            `⏳ *GAMEAPI masih berjalan.*`,
            m
        )
    }

    global.gameapiRunning = true

    try {

        const state =
            getState()

        state.totalRun++

        saveState(state)

        /*
         * =================================================
         * DATABASE DAN STATISTIK
         * =================================================
         */

        const games =
            GAMES.map(item => {

                return {
                    name: item[0],
                    url: item[1],

                    request: 0,

                    berhasil: 0,
                    sudahAda: 0,
                    gagal: 0,

                    data:
                        readDB(item[0])
                }
            })

        /*
         * =================================================
         * PESAN AWAL
         * =================================================
         */

        await conn.reply(
            m.chat,

            `⏳ *GAMEAPI sedang berjalan...*\n\n` +

            `▢ Total API: *${GAMES.length}*\n` +
            `▢ Target: *${TARGET} data / API*\n` +
            `▢ Total request: *${GAMES.length * TARGET}*\n` +
            `▢ Delay: *${DELAY / 1000} detik*\n\n` +

            `Mohon tunggu sampai proses selesai.`,

            m
        )

        /*
         * =================================================
         * PROSES API
         * =================================================
         *
         * API 1 → API 19
         * API 1 → API 19
         * API 1 → API 19
         *
         * sampai setiap API mencapai TARGET.
         */

        while (
            games.some(
                game =>
                    game.request < TARGET
            )
        ) {

            for (
                const game of games
            ) {

                /*
                 * Kalau API sudah mencapai
                 * target, lewati.
                 */
                if (
                    game.request >= TARGET
                ) {
                    continue
                }

                /*
                 * Ambil 1 data.
                 */
                const result =
                    await requestGame(
                        game.name,
                        game.url
                    )

                /*
                 * Request bertambah 1.
                 */
                game.request++

                /*
                 * =================================================
                 * GAGAL
                 * =================================================
                 */

                if (!result.success) {

                    game.gagal++

                    console.log(
                        `[GAMEAPI] ❌ ${game.name} | ${result.error}`
                    )

                } else {

                    /*
                     * =================================================
                     * NORMALIZE
                     * =================================================
                     */

                    const data =
                        normalizeData(
                            result.data,
                            game.data
                        )

                    if (!data) {

                        game.gagal++

                        console.log(
                            `[GAMEAPI] ❌ ${game.name} | Data tidak valid`
                        )

                    } else {

                        /*
                         * =================================================
                         * DUPLICATE
                         * =================================================
                         */

                        if (
                            isDuplicate(
                                data,
                                game.data
                            )
                        ) {

                            game.sudahAda++

                            console.log(
                                `[GAMEAPI] ⚠️ ${game.name} | Sudah ada`
                            )

                        } else {

                            /*
                             * =================================================
                             * SIMPAN DATA BARU
                             * =================================================
                             */

                            game.data.push(
                                data
                            )

                            game.berhasil++

                            console.log(
                                `[GAMEAPI] ✅ ${game.name} | Data baru`
                            )
                        }
                    }
                }

                /*
                 * Simpan langsung setelah
                 * setiap request.
                 */
                saveDB(
                    game.name,
                    game.data
                )

                /*
                 * Delay.
                 */
                if (
                    games.some(
                        item =>
                            item.request < TARGET
                    )
                ) {
                    await sleep(DELAY)
                }
            }
        }

        /*
         * =================================================
         * FINAL SAVE
         * =================================================
         */

        for (
            const game of games
        ) {

            saveDB(
                game.name,
                game.data
            )
        }

        /*
         * =================================================
         * HASIL
         * =================================================
         */

        let text =
            `🎮 *GAMEAPI SELESAI*\n\n`

        for (
            const game of games
        ) {

            text +=
                `*${game.name}*\n` +
                `Request: ${game.request}/${TARGET}\n` +
                `Berhasil: ${game.berhasil}\n` +
                `Sudah ada: ${game.sudahAda}\n` +
                `Gagal: ${game.gagal}\n\n`
        }

        const totalRequest =
            games.reduce(
                (total, game) =>
                    total + game.request,
                0
            )

        const totalBerhasil =
            games.reduce(
                (total, game) =>
                    total + game.berhasil,
                0
            )

        const totalDuplicate =
            games.reduce(
                (total, game) =>
                    total + game.sudahAda,
                0
            )

        const totalGagal =
            games.reduce(
                (total, game) =>
                    total + game.gagal,
                0
            )

        text +=
            `━━━━━━━━━━━━━━━━\n` +
            `📊 *TOTAL*\n\n` +
            `📡 Request: *${totalRequest}*\n` +
            `✅ Data baru: *${totalBerhasil}*\n` +
            `♻️ Duplicate: *${totalDuplicate}*\n` +
            `❌ Gagal: *${totalGagal}*\n` +
            `🎮 API: *${GAMES.length}*\n` +
            `📦 Target/API: *${TARGET}*\n` +
            `━━━━━━━━━━━━━━━━`

        await conn.reply(
            m.chat,
            text.trim(),
            m
        )

    } catch (e) {

        console.error(
            '[GAMEAPI ERROR]',
            e
        )

        await conn.reply(
            m.chat,

            `❌ *GAMEAPI ERROR*\n\n` +
            `${e.message || e}`,

            m
        )

    } finally {

        global.gameapiRunning =
            false
    }
}

handler.help = [
    'gameapi'
]

handler.tags = [
    'game'
]

handler.command =
    /^gameapi$/i

handler.limit = false
handler.group = true
handler.owner = true

export default handler