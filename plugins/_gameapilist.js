// create code Wonge-bot
// gamelist.js

import fs from 'fs'
import path from 'path'

const GAME_DIR = path.join(process.cwd(), 'database', 'game')

function isObject(value) {
    return value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
}

/*
 * Scan seluruh struktur JSON.
 *
 * Setiap object { ... } dihitung sebagai 1 data.
 * Array hanya sebagai container dan tidak dihitung.
 *
 * Tidak bergantung pada:
 * - soal
 * - jawaban
 * - img
 * - logo
 * - index
 * - deskripsi
 * atau nama property tertentu.
 */
function countAllObjects(data) {
    let count = 0

    function scan(value) {
        if (Array.isArray(value)) {
            for (const item of value) {
                scan(item)
            }

            return
        }

        if (isObject(value)) {
            count++

            for (const child of Object.values(value)) {
                if (Array.isArray(child) || isObject(child)) {
                    scan(child)
                }
            }
        }
    }

    /*
     * Root array adalah container.
     * Object di dalamnya dihitung.
     *
     * Root object juga dihitung karena sesuai aturan:
     * setiap { ... } = 1 data.
     */
    scan(data)

    return count
}

/*
 * Menghitung data record utama.
 *
 * Untuk format JSON game normal:
 *
 * [
 *   { ... },
 *   { ... }
 * ]
 *
 * hasil = jumlah object.
 *
 * Jika root object hanya wrapper:
 *
 * {
 *   "data": [ ... ]
 * }
 *
 * wrapper tidak dihitung apabila memiliki
 * container object/array di dalamnya.
 */
function countGameData(data) {
    /*
     * Format paling umum:
     *
     * [
     *   {...},
     *   {...}
     * ]
     */
    if (Array.isArray(data)) {
        return countArrayRecords(data)
    }

    /*
     * Root object:
     * cari seluruh array yang berisi data.
     */
    if (isObject(data)) {
        const arrays = findDataArrays(data)

        if (arrays.length > 0) {
            return arrays.reduce((total, array) => {
                return total + countArrayRecords(array)
            }, 0)
        }

        /*
         * Jika tidak ada array,
         * gunakan jumlah object seluruh struktur.
         */
        return countAllObjects(data)
    }

    return 0
}

/*
 * Menghitung seluruh item object dalam array,
 * termasuk nested array.
 */
function countArrayRecords(array) {
    let count = 0

    function scanArray(value) {
        if (!Array.isArray(value)) return

        for (const item of value) {
            if (isObject(item)) {
                count++

                /*
                 * Jika record memiliki nested array,
                 * scan juga.
                 */
                for (const child of Object.values(item)) {
                    if (Array.isArray(child)) {
                        scanArray(child)
                    }
                }
            }

            if (Array.isArray(item)) {
                scanArray(item)
            }
        }
    }

    scanArray(array)

    return count
}

/*
 * Cari array data di seluruh struktur object.
 *
 * Object hanya sebagai pembungkus.
 */
function findDataArrays(data) {
    const arrays = []

    function scan(value) {
        if (!isObject(value)) return

        for (const child of Object.values(value)) {
            if (Array.isArray(child)) {
                arrays.push(child)

                continue
            }

            if (isObject(child)) {
                scan(child)
            }
        }
    }

    scan(data)

    return arrays
}

function createBar(value, max, length = 10) {
    if (value <= 0 || max <= 0) {
        return '░'.repeat(length)
    }

    let filled = Math.ceil((value / max) * length)

    if (filled < 1) filled = 1
    if (filled > length) filled = length

    return (
        '█'.repeat(filled) +
        '░'.repeat(length - filled)
    )
}

function getGameFiles() {
    if (!fs.existsSync(GAME_DIR)) {
        return []
    }

    return fs.readdirSync(GAME_DIR)
        .filter(file => file.toLowerCase().endsWith('.json'))

        /*
         * File internal/state tidak dianggap game.
         *
         * Contoh:
         * _gameapi_state.json
         */
        .filter(file => !file.startsWith('_'))

        .sort((a, b) =>
            a.localeCompare(b, 'id')
        )
}

function scanGames() {
    const files = getGameFiles()

    const games = []

    for (const file of files) {
        const filePath = path.join(GAME_DIR, file)
        const gameName = path.basename(file, '.json')

        let count = 0

        try {
            const raw = fs.readFileSync(filePath, 'utf8')

            if (raw.trim()) {
                const data = JSON.parse(raw)

                /*
                 * Gunakan scanner struktur penuh.
                 */
                count = countGameData(data)
            }
        } catch (error) {
            /*
             * JSON rusak tetap ditampilkan.
             * Jumlah = 0.
             */
            count = 0
        }

        games.push({
            name: gameName,
            count
        })
    }

    return games
}

let handler = async (m, { conn }) => {
    const games = scanGames()

    const totalData = games.reduce(
        (total, game) => total + game.count,
        0
    )

    const maxData = games.length
        ? Math.max(...games.map(game => game.count))
        : 0

    const gameCount = games.length

    let text = `🎮 *GAME DATABASE LIST*
━━━━━━━━━━━━━━━━━━━━
📁 Folder : database/game
🔄 Scan   : REALTIME
🎮 Game   : ${gameCount}
📄 File   : ${gameCount}
📦 Data   : ${totalData.toLocaleString('id-ID')}
━━━━━━━━━━━━━━━━━━━━
📚 *DAFTAR GAME*
`

    for (const game of games) {
        const name = game.name.padEnd(18, ' ')
        const bar = createBar(game.count, maxData)

        text += `│ ${name} ${bar} ${game.count.toLocaleString('id-ID')} data\n`
    }

    text += `━━━━━━━━━━━━━━━━━━━━
📌 Data dibaca langsung dari database.
📌 Tidak menggunakan cache.
📌 Struktur JSON dipindai secara rekursif.`

    await conn.reply(
        m.chat,
        text.trim(),
        m
    )
}

handler.help = ['gamelist']
handler.tags = ['game']
handler.command = /^(gamelist|listgame|games)$/i

export default handler