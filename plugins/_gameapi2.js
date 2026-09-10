//create code Wonge-bot

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')

const TARGET = 10
const DELAY = 1000

const GAMES = [
    ['asahotak', `https://api.botcahx.eu.org/api/game/asahotak?apikey=${btc}`],
    ['dare', `https://api.botcahx.eu.org/api/random/dare?apikey=${btc}`],
    ['tebakemoji', `https://api.botcahx.eu.org/api/game/tebakemoji?apikey=${btc}`],
    ['family100', `https://api.botcahx.eu.org/api/game/family100-2?apikey=${btc}`],
    ['fisika', `https://api.botcahx.eu.org/api/game/fisika?apikey=${btc}`],
    ['kuismerdeka', `https://api.botcahx.eu.org/api/game/kuismerdeka?apikey=${btc}`],
    ['tebaklirik', `https://api.botcahx.eu.org/api/game/tebaklirik?apikey=${btc}`],
    ['math', `https://api.botcahx.eu.org/api/game/math?apikey=${btc}`],
    ['siapakahaku', `https://api.botcahx.eu.org/api/game/siapakahaku?apikey=${btc}`],
    ['singkatan', `https://api.botcahx.eu.org/api/game/singkatan?apikey=${btc}`],
    ['susunkata', `https://api.botcahx.eu.org/api/game/susunkata?apikey=${btc}`],
    ['kuisislami', `https://api.botcahx.eu.org/api/game/kuisislami?apikey=${btc}`],
    ['tebakpemainbola', `https://api.botcahx.eu.org/api/game/tebakpemainbola?apikey=${btc}`],
    ['tebakpresiden', `https://api.botcahx.eu.org/api/game/tebakpresiden?apikey=${btc}`],
    ['tebakwallet', `https://api.botcahx.eu.org/api/game/tebakwallet?apikey=${btc}`],
    ['tebakbendera', `https://api.botcahx.eu.org/api/game/tebakbendera?apikey=${btc}`],
    ['tebakjenaka', `https://api.botcahx.eu.org/api/game/tebakjenaka?apikey=${btc}`],
    ['tebakkalimat', `https://api.botcahx.eu.org/api/game/tebakkalimat?apikey=${btc}`],
    ['tebakkata', `https://api.botcahx.eu.org/api/game/tebakkata?apikey=${btc}`],
    ['tebakkimia', `https://api.botcahx.eu.org/api/game/tebakkimia?apikey=${btc}`],
    ['tebakkode', `https://api.botcahx.eu.org/api/game/tebakkode?apikey=${btc}`],
    ['tebaknegara', `https://api.botcahx.eu.org/api/game/tebaknegara?apikey=${btc}`],
    ['tebaktebakan', `https://api.botcahx.eu.org/api/game/tebaktebakan?apikey=${btc}`],
    ['tekateki', `https://api.botcahx.eu.org/api/game/tekateki?apikey=${btc}`],
    ['truth', `https://api.botcahx.eu.org/api/random/truth?apikey=${btc}`]
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

function getFile(name) {
    return path.join(GAME_DIR, `${name}.json`)
}

function readDB(name) {
    try {
        const file = getFile(name)

        if (!fs.existsSync(file)) {
            return []
        }

        const raw = fs.readFileSync(file, 'utf8')

        if (!raw.trim()) {
            return []
        }

        const data = JSON.parse(raw)

        if (Array.isArray(data)) {
            return data
        }

        if (data && Array.isArray(data.data)) {
            return data.data
        }

        return []
    } catch {
        return []
    }
}

function saveDB(name, data) {
    try {
        fs.writeFileSync(
            getFile(name),
            JSON.stringify(data, null, 2),
            'utf8'
        )
    } catch {}
}

function getKey(data) {
    if (!data || typeof data !== 'object') {
        return null
    }

    const keys = [
        'soal',
        'question',
        'pertanyaan',
        'result',
        'nama',
        'bendera',
        'deskripsi',
        'clue',
        'singkatan'
    ]

    for (const key of keys) {
        if (
            data[key] !== undefined &&
            data[key] !== null
        ) {
            const value = String(data[key])
                .trim()
                .toLowerCase()

            if (value) {
                return value
            }
        }
    }

    if (
        data.data &&
        typeof data.data === 'object'
    ) {
        return getKey(data.data)
    }

    try {
        return JSON.stringify(data)
            .trim()
            .toLowerCase()
    } catch {
        return null
    }
}

async function getAPI(game) {
    try {
        const response = await fetch(game.url)

        if (!response.ok) {
            return {
                status: 'gagal',
                data: null
            }
        }

        const json = await response.json()

        if (
            json === null ||
            json === undefined
        ) {
            return {
                status: 'gagal',
                data: null
            }
        }

        if (Array.isArray(json)) {
            if (!json.length) {
                return {
                    status: 'gagal',
                    data: null
                }
            }

            return {
                status: 'success',
                data: json[
                    Math.floor(
                        Math.random() * json.length
                    )
                ]
            }
        }

        if (
            json.data &&
            Array.isArray(json.data)
        ) {
            if (!json.data.length) {
                return {
                    status: 'gagal',
                    data: null
                }
            }

            return {
                status: 'success',
                data: json.data[
                    Math.floor(
                        Math.random() * json.data.length
                    )
                ]
            }
        }

        return {
            status: 'success',
            data: json
        }

    } catch {
        return {
            status: 'gagal',
            data: null
        }
    }
}

let handler = async (m, { conn }) => {
    ensureDir()

    /*
     * Cegah gameapi2 dijalankan
     * berkali-kali secara bersamaan.
     */
    if (global.gameapi2Running) {
        return conn.reply(
            m.chat,
            '⏳ *GAMEAPI2 masih berjalan.*\nTunggu sampai proses sebelumnya selesai.',
            m
        )
    }

    global.gameapi2Running = true

    try {
        /*
         * Pesan awal.
         */
        await conn.reply(
            m.chat,
            `⏳ *GAMEAPI2 sedang berjalan...*\n\n` +
            `▢ Total API: *${GAMES.length}*\n` +
            `▢ Target: *${TARGET} data / API*\n` +
            `▢ Total request: *${GAMES.length * TARGET}*\n` +
            `▢ Jeda antar API: *${DELAY / 1000} detik*\n\n` +
            `Mohon tunggu sampai proses selesai.`,
            m
        )

        /*
         * Buat status masing-masing API.
         */
        const games = GAMES.map(item => {
            return {
                name: item[0],
                url: item[1],

                request: 0,

                berhasil: 0,
                sudahAda: 0,
                gagal: 0,

                data: readDB(item[0])
            }
        })

        /*
         * Proses berjalan sampai
         * semua API mencapai 10 request.
         */
        while (
            games.some(
                game => game.request < TARGET
            )
        ) {

            /*
             * Hanya API yang belum
             * mencapai target yang dipilih.
             */
            const available = games.filter(
                game => game.request < TARGET
            )

            if (!available.length) {
                break
            }

            /*
             * Pilih API secara RANDOM.
             *
             * Contoh:
             *
             * A
             * B
             * D
             * A
             * C
             * B
             * dst...
             */
            const game =
                available[
                    Math.floor(
                        Math.random() *
                        available.length
                    )
                ]

            /*
             * Ambil 1 data dari API.
             */
            const result = await getAPI(game)

            /*
             * Setiap API hanya dihitung
             * 1 request setiap giliran.
             */
            game.request++

            if (
                result.status === 'success' &&
                result.data
            ) {
                const key = getKey(result.data)

                if (!key) {
                    game.gagal++
                } else {

                    /*
                     * Cek apakah data sudah ada.
                     */
                    const duplicate =
                        game.data.some(
                            oldData =>
                                getKey(oldData) === key
                        )

                    if (duplicate) {
                        game.sudahAda++
                    } else {
                        game.data.push(
                            result.data
                        )

                        game.berhasil++
                    }
                }

            } else {
                game.gagal++
            }

            /*
             * Simpan langsung.
             */
            saveDB(
                game.name,
                game.data
            )

            /*
             * Jeda 1 detik sebelum
             * memilih API berikutnya.
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

        /*
         * Pastikan semua database tersimpan.
         */
        for (const game of games) {
            saveDB(
                game.name,
                game.data
            )
        }

        /*
         * Hasil akhir.
         */
        let text =
            `🎮 *GAMEAPI2 SELESAI*\n\n`

        for (const game of games) {
            text +=
                `*${game.name}*\n` +
                `berhasil ${game.berhasil}\n` +
                `sudah ada ${game.sudahAda}\n` +
                `gagal ${game.gagal}\n\n`
        }

        await conn.reply(
            m.chat,
            text.trim(),
            m
        )

    } catch (e) {
        console.error('[GAMEAPI2]', e)

        await conn.reply(
            m.chat,
            '❌ *GAMEAPI2 gagal menjalankan proses.*',
            m
        )

    } finally {
        global.gameapi2Running = false
    }
}

handler.help = ['gameapi2']
handler.tags = ['game']
handler.command = /^gameapi2$/i
handler.group = true
handler.owner = true


export default handler