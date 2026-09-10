//create code Wonge-bot

let handler = async (m, { conn, args, usedPrefix }) => {

    // ==============================
    // DATABASE
    // ==============================
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}

    const users = global.db.data.users
    const user = users[m.sender]

    if (!user) {
        return m.reply(
            '❌ Data user tidak ditemukan di database.'
        )
    }

    // ==============================
    // TYPE
    // ==============================
    const type = (args[0] || '').toLowerCase()

    // ==============================
    // SEMUA ITEM
    // ==============================
    // Setiap craft:
    // +10 durability
    // Max:
    // 50 durability = 100%
    //
    // Harga TIDAK DIUBAH
    // ==============================

    const items = {

        pickaxe: {
            name: 'Pickaxe',
            price: 50000,
            emoji: '⛏️',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'pickaxedurability'
        },

        sword: {
            name: 'Sword',
            price: 70000,
            emoji: '⚔️',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'sworddurability'
        },

        pisau: {
            name: 'Pisau',
            price: 60000,
            emoji: '🔪',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'pisaudurability'
        },

        axe: {
            name: 'Axe',
            price: 65000,
            emoji: '🪓',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'axedurability'
        },

        fishingrod: {
            name: 'Fishingrod',
            price: 55000,
            emoji: '🎣',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'fishingroddurability'
        },

        bow: {
            name: 'Bow',
            price: 60000,
            emoji: '🏹',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'bowdurability'
        },

        armor: {
            name: 'Armor',
            price: 100000,
            emoji: '🥼',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'armordurability'
        },

        katana: {
            name: 'Katana',
            price: 150000,
            emoji: '🦯',
            durability: 10,
            maxDurability: 50,
            durabilityKey: 'katanadurability'
        }
    }

    // ==============================
    // MENU
    // ==============================

    const caption = `
*B L A C K S M I T H*

> *PRICE LIST*

⛏️ Pickaxe : 50.000 money
⚔️ Sword : 70.000 money
🔪 Pisau : 60.000 money
🪓 Axe : 65.000 money
🎣 Fishingrod : 55.000 money
🏹 Bow : 60.000 money
🥼 Armor : 100.000 money
🦯 Katana : 150.000 money

> *CARA CRAFT*

Contoh:
${usedPrefix}craft axe
${usedPrefix}craft pickaxe
${usedPrefix}craft fishingrod
${usedPrefix}craft bow

> *SISTEM DURABILITY*

• Setiap pembelian = +10 durability
• Maksimal = 50 durability
• 50 durability = 100%
• Bisa craft berkali-kali
• Harga setiap craft tetap sama
`.trim()

    // ==============================
    // TAMPILKAN MENU
    // ==============================

    if (!type) {
        return conn.reply(
            m.chat,
            caption,
            m
        )
    }

    // ==============================
    // VALIDASI ITEM
    // ==============================

    const item = items[type]

    if (!item) {
        return conn.reply(
            m.chat,
            `❌ Item *${type}* tidak tersedia.\n\n${caption}`,
            m
        )
    }

    try {

        // ==============================
        // MONEY
        // ==============================

        if (typeof user.money !== 'number') {
            user.money = 0
        }

        // ==============================
        // ITEM
        // ==============================

        if (typeof user[type] !== 'number') {
            user[type] = 0
        }

        // ==============================
        // DURABILITY
        // ==============================

        if (
            typeof user[item.durabilityKey] !== 'number'
        ) {
            user[item.durabilityKey] = 0
        }

        // ==============================
        // NORMALISASI
        // ==============================

        if (user[item.durabilityKey] < 0) {
            user[item.durabilityKey] = 0
        }

        if (
            user[item.durabilityKey] >
            item.maxDurability
        ) {
            user[item.durabilityKey] =
                item.maxDurability
        }

        // ==============================
        // CEK DURABILITY MAX
        // ==============================

        if (
            user[item.durabilityKey] >=
            item.maxDurability
        ) {

            return m.reply(
                `❌ *${item.name} sudah penuh!*\n\n` +
                `${item.emoji} Durability : ` +
                `*${user[item.durabilityKey]}/${item.maxDurability}*\n` +
                `📊 Kondisi : *100%*`
            )
        }

        // ==============================
        // CEK MONEY
        // ==============================

        if (user.money < item.price) {

            const kurang =
                item.price - user.money

            return m.reply(
                `❌ *Money tidak cukup!*\n\n` +
                `💰 Money kamu : *${user.money.toLocaleString('id-ID')}*\n` +
                `💵 Harga craft : *${item.price.toLocaleString('id-ID')}*\n` +
                `📉 Kekurangan : *${kurang.toLocaleString('id-ID')}*`
            )
        }

        // ==============================
        // DURABILITY SEBELUM
        // ==============================

        const durabilityBefore =
            user[item.durabilityKey]

        // ==============================
        // HITUNG DURABILITY
        // ==============================

        let durabilityAdded =
            item.durability

        let durabilityAfter =
            durabilityBefore +
            durabilityAdded

        // ==============================
        // BATASI MAX 50
        // ==============================

        if (
            durabilityAfter >
            item.maxDurability
        ) {

            durabilityAfter =
                item.maxDurability

            durabilityAdded =
                durabilityAfter -
                durabilityBefore
        }

        // ==============================
        // BAYAR
        // ==============================

        user.money -= item.price

        // ==============================
        // AKTIFKAN ITEM
        // ==============================

        user[type] = 1

        // ==============================
        // SIMPAN DURABILITY
        // ==============================

        user[item.durabilityKey] =
            durabilityAfter

        // ==============================
        // PERSENTASE
        // ==============================

        const percent =
            Math.floor(
                (
                    durabilityAfter /
                    item.maxDurability
                ) * 100
            )

        // ==============================
        // STATUS
        // ==============================

        let status = '🟢'

        if (percent <= 20) {
            status = '🔴'
        } else if (percent <= 50) {
            status = '🟡'
        }

        // ==============================
        // SUCCESS
        // ==============================

        return m.reply(
            `✅ *CRAFT BERHASIL*\n\n` +

            `${item.emoji} Item : *${item.name}*\n\n` +

            `➕ Durability : *+${durabilityAdded}*\n` +

            `🛠️ Sebelum : ` +
            `*${durabilityBefore}/${item.maxDurability}*\n` +

            `🛠️ Sekarang : ` +
            `*${durabilityAfter}/${item.maxDurability}*\n` +

            `${status} Kondisi : *${percent}%*\n\n` +

            `💵 Harga : ` +
            `*${item.price.toLocaleString('id-ID')}*\n` +

            `💰 Sisa Money : ` +
            `*${user.money.toLocaleString('id-ID')}*`
        )

    } catch (e) {

        console.error(
            '[CRAFT ERROR]',
            e
        )

        return m.reply(
            `❌ Terjadi error:\n${e.message || e}`
        )
    }
}

// ==============================
// HANDLER CONFIG
// ==============================

handler.help = [
    'craft'
]

handler.tags = [
    'rpg'
]

handler.command =
    /^(craft|blacksmith)$/i

handler.register = true
handler.group = true
handler.rpg = true

export default handler