//create code Wonge-bot

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const QUOTES_DIR = path.join(
    process.cwd(),
    'database',
    'quotes'
)

const MAX_REQUEST = 10
const DELAY = 3000

const API_LIST = [
    {
        name: 'galau',
        url: () =>
            `https://api.botcahx.eu.org/api/random/katasenja?apikey=${btc}`,
        type: 'string',
        get: data => data && data.senja
    },

    {
        name: 'anime',
        url: () =>
            `https://api.botcahx.eu.org/api/random/quotesanime?apikey=${btc}`,
        type: 'anime'
    },

    {
        name: 'bacot',
        url: () =>
            `https://api.botcahx.eu.org/api/random/bacot?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'bijak',
        url: () =>
            `https://api.botcahx.eu.org/api/random/bijak?apikey=${btc}`,
        type: 'string',
        get: data => data && data.result
    },

    {
        name: 'motivasi',
        url: () =>
            `https://api.botcahx.eu.org/api/random/motivasi?&apikey=${btc}`,
        type: 'string',
        get: data => data && data.result
    },

    {
        name: 'bucin',
        url: () =>
            `https://api.botcahx.eu.org/api/random/katabucin?apikey=${btc}`,
        type: 'string',
        get: data => data && data.bucin
    },

    {
        name: 'fiersa',
        url: () =>
            `https://api.botcahx.eu.org/api/random/fiersa?apikey=${btc}`,
        type: 'string',
        get: data => data && data.fiersa
    },

    {
        name: 'fakta',
        url: () =>
            `https://api.botcahx.eu.org/api/random/fakta?apikey=${btc}`,
        type: 'string',
        get: data => data && data.result
    },

    {
        name: 'nyindir',
        url: () =>
            `https://api.botcahx.eu.org/api/random/nyindir?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'ngawur',
        url: () =>
            `https://api.botcahx.eu.org/api/random/ngawur?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'jawa',
        url: () =>
            `https://api.botcahx.eu.org/api/random/quotesjawa?apikey=${btc}`,
        type: 'string',
        get: data => data && data.quotes
    },

    {
        name: 'quotes',
        url: () =>
            `https://api.botcahx.eu.org/api/random/quotes?apikey=${btc}`,
        type: 'string',
        get: data => data && data.quotes
    },

    {
        name: 'sunda',
        url: () =>
            `https://api.botcahx.eu.org/api/random/sunda?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'batak',
        url: () =>
            `https://api.botcahx.eu.org/api/random/batak?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'aceh',
        url: () =>
            `https://api.botcahx.eu.org/api/random/aceh?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'cina',
        url: () =>
            `https://api.botcahx.eu.org/api/random/china?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'minangkabau',
        url: () =>
            `https://api.botcahx.eu.org/api/random/minangkabau?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasl
    },

    {
        name: 'ilham',
        url: () =>
            `https://api.botcahx.eu.org/api/random/katailham?apikey=${btc}`,
        type: 'string',
        get: data => data && data.hasil
    },

    {
        name: 'dilan',
        url: () =>
            `https://api.botcahx.eu.org/api/random/katadilan?apikey=${btc}`,
        type: 'string',
        get: data => data && data.dilan
    }
]

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function ensureDirectory() {
    if (!fs.existsSync(QUOTES_DIR)) {
        fs.mkdirSync(QUOTES_DIR, {
            recursive: true
        })
    }
}

function getFilePath(name) {
    return path.join(
        QUOTES_DIR,
        `${name}.json`
    )
}

function loadQuotes(name) {
    const file = getFilePath(name)

    if (!fs.existsSync(file)) {
        return []
    }

    try {
        const data = fs.readFileSync(
            file,
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

function saveQuotes(name, quotes) {
    const file = getFilePath(name)
    const temp = `${file}.tmp`

    try {

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
            file
        )

    } catch (e) {

        try {
            if (fs.existsSync(temp)) {
                fs.unlinkSync(temp)
            }
        } catch {}

        throw e
    }
}

function parseAnime(data) {

    if (
        !data ||
        !Array.isArray(data.result) ||
        data.result.length === 0
    ) {
        return null
    }

    const validItems =
        data.result.filter(item => {

            return (
                item &&
                typeof item === 'object' &&
                typeof item.quotes === 'string' &&
                item.quotes.trim()
            )
        })

    if (validItems.length === 0) {
        return null
    }

    const item =
        validItems[
            Math.floor(
                Math.random() *
                validItems.length
            )
        ]

    return {
        quotes: item.quotes.trim(),

        karakter:
            typeof item.karakter === 'string'
                ? item.karakter.trim()
                : '',

        anime:
            typeof item.anime === 'string'
                ? item.anime.trim()
                : '',

        episode:
            item.episode !== undefined &&
            item.episode !== null
                ? String(item.episode)
                : '',

        gambar:
            typeof item.gambar === 'string'
                ? item.gambar.trim()
                : ''
    }
}

function isSameAnime(a, b) {

    if (
        !a ||
        !b ||
        typeof a !== 'object' ||
        typeof b !== 'object'
    ) {
        return false
    }

    return (
        a.quotes === b.quotes &&
        a.karakter === b.karakter &&
        a.anime === b.anime &&
        a.episode === b.episode
    )
}

async function fetchQuote(api) {

    try {

        const response =
            await fetch(
                api.url()
            )

        if (!response.ok) {
            return null
        }

        const data =
            await response.json()

        if (api.type === 'anime') {
            return parseAnime(data)
        }

        const value =
            api.get(data)

        if (
            typeof value !== 'string' ||
            !value.trim()
        ) {
            return null
        }

        return value.trim()

    } catch (e) {

        return null
    }
}

/*
 * Membuat queue.
 *
 * Setiap API dimasukkan sebanyak 10 kali.
 *
 * Contoh:
 *
 * galau x10
 * anime x10
 * bacot x10
 * dst.
 *
 * Setelah itu seluruh queue diacak.
 *
 * Jadi request tidak akan selalu:
 *
 * galau x10 -> anime x10 -> bacot x10
 *
 * tetapi bisa:
 *
 * anime -> galau -> quotes -> anime -> jawa -> ...
 */

function createQueue() {

    const queue = []

    for (
        let i = 0;
        i < API_LIST.length;
        i++
    ) {

        const api = API_LIST[i]

        for (
            let j = 0;
            j < MAX_REQUEST;
            j++
        ) {

            queue.push(api)
        }
    }

    /*
     * Fisher-Yates shuffle.
     */

    for (
        let i = queue.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (i + 1)
            )

        const temp = queue[i]

        queue[i] =
            queue[randomIndex]

        queue[randomIndex] =
            temp
    }

    return queue
}

function printFinalLog(
    berhasil,
    sudahAda,
    gagal,
    apiGagal
) {

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

    if (
        apiGagal.length > 0
    ) {

        console.log(
            `api gagal ${apiGagal.join(', ')}`
        )
    }

    console.log('')
}

let handler = async (m, { conn }) => {

    if (handler.running) {

        return m.reply(
            '⚠️ *Quotes API* masih berjalan.'
        )
    }

    handler.running = true

    ensureDirectory()

    let berhasil = 0
    let sudahAda = 0
    let gagal = 0

    const apiGagal = []

    try {

        const queue =
            createQueue()

        const totalRequest =
            queue.length

        await m.reply(
            `⏳ *Quotes API dimulai*\n\n` +
            `API: ${API_LIST.length}\n` +
            `Request/API: ${MAX_REQUEST}\n` +
            `Total request: ${totalRequest}\n` +
            `Jeda: 3 detik\n\n` +
            `Mohon tunggu...`
        )

        console.log('')
        console.log('*quotes*')
        console.log(
            `mulai ${API_LIST.length} API`
        )
        console.log(
            `request per API ${MAX_REQUEST}`
        )
        console.log(
            `total request ${totalRequest}`
        )
        console.log(
            `jeda ${DELAY / 1000} detik`
        )
        console.log('')

        for (
            let i = 0;
            i < queue.length;
            i++
        ) {

            const api =
                queue[i]

            const nomorRequest =
                i + 1

            console.log(
                `[${nomorRequest}/${totalRequest}] Request API: ${api.name}`
            )

            const quote =
                await fetchQuote(api)

            /*
             * API gagal.
             */

            if (!quote) {

                gagal++

                /*
                 * Simpan nama API gagal
                 * hanya satu kali.
                 */

                if (
                    apiGagal.indexOf(
                        api.name
                    ) === -1
                ) {

                    apiGagal.push(
                        api.name
                    )
                }

                console.log(
                    `[${nomorRequest}/${totalRequest}] ${api.name} ERROR`
                )

            } else {

                const quotes =
                    loadQuotes(
                        api.name
                    )

                /*
                 * Anime.
                 */

                if (
                    api.type === 'anime'
                ) {

                    const exists =
                        quotes.some(item => {

                            return isSameAnime(
                                item,
                                quote
                            )
                        })

                    if (exists) {

                        sudahAda++

                        console.log(
                            `[${nomorRequest}/${totalRequest}] ${api.name} DUPLIKAT`
                        )

                    } else {

                        quotes.push(
                            quote
                        )

                        saveQuotes(
                            api.name,
                            quotes
                        )

                        berhasil++

                        console.log(
                            `[${nomorRequest}/${totalRequest}] ${api.name} OK`
                        )
                    }

                /*
                 * API string.
                 */

                } else {

                    if (
                        quotes.indexOf(
                            quote
                        ) !== -1
                    ) {

                        sudahAda++

                        console.log(
                            `[${nomorRequest}/${totalRequest}] ${api.name} DUPLIKAT`
                        )

                    } else {

                        quotes.push(
                            quote
                        )

                        saveQuotes(
                            api.name,
                            quotes
                        )

                        berhasil++

                        console.log(
                            `[${nomorRequest}/${totalRequest}] ${api.name} OK`
                        )
                    }
                }
            }

            /*
             * Jeda 3 detik setelah setiap request.
             *
             * Request terakhir tidak perlu menunggu.
             */

            if (
                i < queue.length - 1
            ) {

                console.log(
                    `menunggu ${DELAY / 1000} detik...`
                )

                await sleep(DELAY)
            }
        }

        /*
         * LOG AKHIR
         */

        printFinalLog(
            berhasil,
            sudahAda,
            gagal,
            apiGagal
        )

        let hasilGagal = ''

        if (
            apiGagal.length > 0
        ) {

            hasilGagal =
                `\nAPI gagal: ${apiGagal.join(', ')}`
        }

        await m.reply(
            `✅ *Quotes API selesai*\n\n` +
            `API: ${API_LIST.length}\n` +
            `Request/API: ${MAX_REQUEST}\n` +
            `Total request: ${totalRequest}\n` +
            `Berhasil: ${berhasil}\n` +
            `Sudah ada: ${sudahAda}\n` +
            `Gagal: ${gagal}` +
            hasilGagal +
            `\n\nData tersimpan di database/quotes/`
        )

    } catch (e) {

        console.error(
            '[QUOTES API ERROR]',
            e
        )

        printFinalLog(
            berhasil,
            sudahAda,
            gagal,
            apiGagal
        )

        try {

            await m.reply(
                `⚠️ *Quotes API berhenti karena error.*\n\n` +
                `Berhasil: ${berhasil}\n` +
                `Sudah ada: ${sudahAda}\n` +
                `Gagal: ${gagal}\n\n` +
                `Data yang sudah masuk tetap aman.`
            )

        } catch {}
        
    } finally {

        handler.running = false
    }
}

handler.help = ['quotesapi']
handler.tags = ['quotes']
handler.command = /^quotesapi$/i

handler.owner = true
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.register = false

handler.admin = true
handler.botAdmin = false
handler.fail = null

export default handler