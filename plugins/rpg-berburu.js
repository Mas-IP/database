//create code Wonge-bot

// ==============================
// SISTEM RARITY BERBURU
// ==============================
// Semakin kecil weight = semakin langka.
//
// Common    = sangat mudah
// Uncommon  = cukup mudah
// Rare      = sulit
// Epic      = sangat sulit
// Legendary = sangat langka

const HUNT_TABLE = [

    // ==============================
    // COMMON
    // ==============================

    {
        id: 'ayam',
        name: 'Ayam',
        emoji: '🐔',
        rarity: 'Common',
        min: 2,
        max: 15,
        weight: 300
    },

    {
        id: 'kambing',
        name: 'Kambing',
        emoji: '🐐',
        rarity: 'Common',
        min: 1,
        max: 10,
        weight: 240
    },

    {
        id: 'sapi',
        name: 'Sapi',
        emoji: '🐂',
        rarity: 'Common',
        min: 1,
        max: 8,
        weight: 200
    },

    {
        id: 'kerbau',
        name: 'Kerbau',
        emoji: '🐃',
        rarity: 'Common',
        min: 1,
        max: 7,
        weight: 170
    },

    {
        id: 'babi',
        name: 'Babi',
        emoji: '🐖',
        rarity: 'Common',
        min: 1,
        max: 8,
        weight: 160
    },

    // ==============================
    // UNCOMMON
    // ==============================

    {
        id: 'babihutan',
        name: 'Babi Hutan',
        emoji: '🐗',
        rarity: 'Uncommon',
        min: 1,
        max: 5,
        weight: 110
    },

    {
        id: 'monyet',
        name: 'Monyet',
        emoji: '🐒',
        rarity: 'Uncommon',
        min: 1,
        max: 4,
        weight: 85
    },

    // ==============================
    // RARE
    // ==============================

    {
        id: 'buaya',
        name: 'Buaya',
        emoji: '🐊',
        rarity: 'Rare',
        min: 1,
        max: 3,
        weight: 50
    },

    {
        id: 'panda',
        name: 'Panda',
        emoji: '🐼',
        rarity: 'Rare',
        min: 1,
        max: 2,
        weight: 35
    },

    {
        id: 'banteng',
        name: 'Banteng',
        emoji: '🐃',
        rarity: 'Rare',
        min: 1,
        max: 2,
        weight: 25
    },

    // ==============================
    // EPIC
    // ==============================

    {
        id: 'harimau',
        name: 'Harimau',
        emoji: '🐅',
        rarity: 'Epic',
        min: 1,
        max: 1,
        weight: 10
    },

    // ==============================
    // LEGENDARY
    // ==============================

    {
        id: 'gajah',
        name: 'Gajah',
        emoji: '🐘',
        rarity: 'Legendary',
        min: 1,
        max: 1,
        weight: 3
    }
]

// ==============================
// CONFIG BERBURU
// ==============================

// Durability yang digunakan
const HUNT_DURABILITY_USE = 10

// Durability maksimum
const HUNT_MAX_DURABILITY = 50

// Cooldown = 10 menit
const HUNT_COOLDOWN = 10 * 60 * 1000

// Durasi proses berburu = 15 detik
const HUNT_PROCESS_TIME = 15 * 1000

// ==============================
// RANDOM HEWAN
// ==============================

function randomAnimal() {

    let totalWeight = 0

    for (const animal of HUNT_TABLE) {
        totalWeight += animal.weight
    }

    let random =
        Math.random() * totalWeight

    for (const animal of HUNT_TABLE) {

        random -= animal.weight

        if (random <= 0) {
            return animal
        }
    }

    return HUNT_TABLE[0]
}

// ==============================
// RANDOM JUMLAH
// ==============================

function randomAmount(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min
}

// ==============================
// FORMAT WAKTU
// ==============================

function berburuClockString(ms) {

    if (ms < 0) {
        ms = 0
    }

    let seconds =
        Math.floor(ms / 1000)

    let minutes =
        Math.floor(seconds / 60)

    let hours =
        Math.floor(minutes / 60)

    seconds %= 60
    minutes %= 60

    return [
        hours,
        minutes,
        seconds
    ]
        .map(v =>
            v.toString().padStart(2, '0')
        )
        .join(':')
}

// ==============================
// DELAY
// ==============================

function delay(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

// ==============================
// EDIT PESAN
// ==============================

async function editMessage(
    conn,
    chat,
    key,
    text
) {

    try {

        if (!key) {
            return null
        }

        return await conn.sendMessage(
            chat,
            {
                text: text
            },
            {
                edit: key
            }
        )

    } catch (e) {

        console.log(
            '[BERBURU EDIT ERROR]',
            e
        )

        return null
    }
}

// ==============================
// LOCK BERBURU
// ==============================

global.berburuLocks =
    global.berburuLocks ||
    new Map()

// ==============================
// HANDLER
// ==============================

let handler = async (m, {
    conn
}) => {

    const user =
        global.db?.data?.users?.[m.sender]

    if (!user) {
        throw '❌ Data pengguna tidak ditemukan di database.'
    }

    const userId = m.sender

    // ==============================
    // CEK LOCK
    // ==============================

    if (
        global.berburuLocks.has(userId)
    ) {

        throw (
            '⏳ Kamu masih sedang dalam proses berburu.'
        )
    }

    // ==============================
    // DATABASE DEFAULT
    // ==============================

    if (
        typeof user.bow !== 'number'
    ) {
        user.bow = 0
    }

    if (
        typeof user.bowdurability !== 'number'
    ) {
        user.bowdurability = 0
    }

    if (
        typeof user.lastberburu !== 'number'
    ) {
        user.lastberburu = 0
    }

    // ==============================
    // NORMALISASI DURABILITY
    // ==============================

    if (
        user.bowdurability < 0
    ) {
        user.bowdurability = 0
    }

    if (
        user.bowdurability >
        HUNT_MAX_DURABILITY
    ) {

        user.bowdurability =
            HUNT_MAX_DURABILITY
    }

    // ==============================
    // 1. CEK BOW
    // ==============================

    if (user.bow <= 0) {

        throw (
            `❌ *Kamu tidak memiliki Bow.* 🏹\n\n` +
            `Buat terlebih dahulu menggunakan:\n` +
            `*craft bow*`
        )
    }

    // ==============================
    // 2. CEK DURABILITY
    // ==============================

    if (
        user.bowdurability <
        HUNT_DURABILITY_USE
    ) {

        throw (
            `❌ *Durability Bow tidak cukup!*\n\n` +
            `🏹 Bow : *Ada*\n` +
            `🛠️ Durability : *${user.bowdurability}/${HUNT_MAX_DURABILITY}*\n` +
            `⚒️ Dibutuhkan : *${HUNT_DURABILITY_USE} durability*\n\n` +
            `Gunakan *craft bow* untuk menambah durability.`
        )
    }

    // ==============================
    // 3. CEK COOLDOWN
    // ==============================

    const now =
        Date.now()

    const lastHunt =
        Number(
            user.lastberburu || 0
        )

    const timeDiff =
        now - lastHunt

    if (
        lastHunt > 0 &&
        timeDiff < HUNT_COOLDOWN
    ) {

        const remainingTime =
            HUNT_COOLDOWN -
            timeDiff

        throw (
            `⏳ *Kamu baru saja berburu!*\n\n` +
            `🏹 Tunggu selama:\n` +
            `*${berburuClockString(remainingTime)}*\n\n` +
            `⏰ Cooldown: *10 menit*`
        )
    }

    // ==============================
    // AKTIFKAN LOCK
    // ==============================

    global.berburuLocks.set(
        userId,
        now
    )

    try {

        // ==============================
        // DATA AWAL
        // ==============================

        const durabilityBefore =
            user.bowdurability

        const durabilityAfter =
            Math.max(
                0,
                durabilityBefore -
                HUNT_DURABILITY_USE
            )

        // ==============================
        // PESAN AWAL
        // ==============================

        const msg =
            await conn.reply(
                m.chat,
                `╭━━〔 🏹 *BERBURU* 〕━━╮
│
│ 🏹 Kamu berangkat berburu...
│
│ 🛠️ Durability:
│    *${durabilityBefore} → ${durabilityAfter}/50*
│
│ 🌲 Memasuki hutan...
│
╰━━━━━━━━━━━━━━━━━━╯`,
                m
            )

        const messageKey =
            msg && msg.key
                ? msg.key
                : null

        // ==============================
        // 5 DETIK
        // ==============================

        await delay(5000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 🏹 *BERBURU* 〕━━╮
│
│ 🌲 Kamu sedang mencari
│    mangsa...
│
│ 👀 Memeriksa jejak hewan...
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==============================
        // 10 DETIK
        // ==============================

        await delay(5000)

        await editMessage(
            conn,
            m.chat,
            messageKey,
            `╭━━〔 🏹 *BERBURU* 〕━━╮
│
│ 👀 *MANGSA TERDETEKSI!*
│
│ 🎯 Bersiap membidik...
│
│ 🏹 Menarik tali busur...
│
╰━━━━━━━━━━━━━━━━━━╯`
        )

        // ==============================
        // 15 DETIK
        // ==============================

        await delay(5000)

        // ==============================
        // RANDOM HEWAN
        // ==============================

        const caught = {}

        const numberOfTypes =
            Math.floor(
                Math.random() * 4
            ) + 3

        for (
            let i = 0;
            i < numberOfTypes;
            i++
        ) {

            const animal =
                randomAnimal()

            const amount =
                randomAmount(
                    animal.min,
                    animal.max
                )

            caught[animal.id] =
                (
                    caught[animal.id] ||
                    0
                ) + amount
        }

        // ==============================
        // TOTAL HASIL
        // ==============================

        let totalCatch = 0

        for (
            const key of Object.keys(caught)
        ) {

            totalCatch +=
                caught[key]
        }

        // ==============================
        // SIMPAN HASIL
        // ==============================

        for (
            const animalId of Object.keys(caught)
        ) {

            const amount =
                caught[animalId]

            user[animalId] =
                Number(
                    user[animalId] || 0
                ) + amount
        }

        // ==============================
        // TOTAL BERBURU
        // ==============================

        user.totalBerburu =
            Number(
                user.totalBerburu || 0
            ) + totalCatch

        // ==============================
        // DURABILITY
        // ==============================

        user.bowdurability =
            durabilityAfter

        // ==============================
        // COOLDOWN
        // ==============================

        // Cooldown dimulai setelah
        // proses berburu berhasil.
        user.lastberburu =
            Date.now()

        // ==============================
        // HASIL
        // ==============================

        const result = []

        for (
            const animal of HUNT_TABLE
        ) {

            const amount =
                caught[animal.id] || 0

            if (amount > 0) {

                result.push(
                    `${animal.emoji} ${animal.name}: ${amount} *[${animal.rarity}]*`
                )
            }
        }

        // ==============================
        // PESAN HASIL
        // ==============================

        const hasil =
            `╭━━〔 🏹 *HASIL BERBURU* 〕━━╮
│
${result.map(v => `│ ${v}`).join('\n')}
│
├──────────────────
│ 🎯 Total: *${totalCatch} ekor*
│ 🏹 Durability:
│    *${user.bowdurability}/50*
│
│ ⏰ Cooldown:
│    *10 Menit*
│
╰━━━━━━━━━━━━━━━━━━╯`

        // ==============================
        // EDIT HASIL
        // ==============================

        const edited =
            await editMessage(
                conn,
                m.chat,
                messageKey,
                hasil
            )

        // ==============================
        // FALLBACK
        // ==============================

        if (!edited) {

            await conn.reply(
                m.chat,
                hasil,
                m
            )
        }

    } catch (err) {

        console.log(
            '[BERBURU ERROR]',
            err
        )

        // Proses gagal.
        // Jangan aktifkan cooldown.
        // Jangan anggap command berhasil.

        throw err

    } finally {

        // ==============================
        // HAPUS LOCK
        // ==============================

        global.berburuLocks.delete(
            userId
        )
    }
}

// ==============================
// COMMAND
// ==============================

handler.help = [
    'berburu'
]

handler.tags = [
    'rpg'
]

handler.command =
    /^(berburu|hunt)$/i

handler.group = true
handler.rpg = true

// ==============================
// LIMIT
// ==============================

// Limit ditangani oleh handler utama.
// Premium otomatis bebas limit.
handler.limit = true

export default handler