//create code Wonge-bot

const prices = {
    // ==============================
    // HASIL LAUT
    // ==============================
    ikan: 1000,
    kepiting: 2000,
    udang: 2500,
    cumi: 4000,
    dory: 6000,
    buntal: 10000,
    lobster: 15000,
    gurita: 20000,
    lumba: 35000,
    hiu: 50000,
    paus: 80000,
    orca: 100000,

    // ==============================
    // DARAT / HUTAN
    // ==============================
    ayam: 1000,
    kambing: 2500,
    sapi: 3500,
    kerbau: 4000,
    babi: 4000,
    babihutan: 6000,
    monyet: 8000,
    buaya: 15000,
    panda: 25000,
    banteng: 30000,
    harimau: 50000,
    gajah: 80000
}

const names = {
    // Hasil Laut
    ikan: 'Ikan',
    kepiting: 'Kepiting',
    udang: 'Udang',
    cumi: 'Cumi',
    dory: 'Ikan Dory',
    buntal: 'Ikan Buntal',
    lobster: 'Lobster',
    gurita: 'Gurita',
    lumba: 'Lumba Lumba',
    hiu: 'Hiu',
    paus: 'Paus',
    orca: 'Paus Orca',

    // Darat / Hutan
    ayam: 'Ayam',
    kambing: 'Kambing',
    sapi: 'Sapi',
    kerbau: 'Kerbau',
    babi: 'Babi',
    babihutan: 'Babi Hutan',
    monyet: 'Monyet',
    buaya: 'Buaya',
    panda: 'Panda',
    banteng: 'Banteng',
    harimau: 'Harimau',
    gajah: 'Gajah'
}

const formatMoney = (number) => {
    return Number(number || 0).toLocaleString('id-ID')
}

let handler = async (m, {
    conn,
    command,
    args,
    usedPrefix,
    DevMode
}) => {
    try {
        // ==============================
        // DATABASE
        // ==============================

        global.db = global.db || {}
        global.db.data = global.db.data || {}
        global.db.data.users = global.db.data.users || {}

        const user = global.db.data.users[m.sender]

        if (!user) {
            return conn.reply(
                m.chat,
                '❌ Data pengguna tidak ditemukan di database.',
                m
            )
        }

        // ==============================
        // PARSING COMMAND
        // ==============================

        let action = ''
        let item = ''
        let countArg = ''

        if (/^(pasar|toko)$/i.test(command)) {
            action = (args[0] || '').toLowerCase()
            item = (args[1] || '').toLowerCase()
            countArg = (args[2] || '').toLowerCase()
        } else if (/^(jual|sell)$/i.test(command)) {
            action = 'jual'
            item = (args[0] || '').toLowerCase()
            countArg = (args[1] || '').toLowerCase()
        }

        // ==============================
        // LIST PASAR
        // ==============================

        const Kchat = `━━━━━━━━━━━━━━━━━
*🌱 Hewan | 💲 Harga Jual*
━━━━━━━━━━━━━━━━━

*🌊 Hasil Laut:*
🐟 Ikan: ${formatMoney(prices.ikan)}
🦀 Kepiting: ${formatMoney(prices.kepiting)}
🦐 Udang: ${formatMoney(prices.udang)}
🦑 Cumi: ${formatMoney(prices.cumi)}
🐠 Dory: ${formatMoney(prices.dory)}
🐡 Buntal: ${formatMoney(prices.buntal)}
🦞 Lobster: ${formatMoney(prices.lobster)}
🐙 Gurita: ${formatMoney(prices.gurita)}
🐬 Lumba: ${formatMoney(prices.lumba)}
🦈 Hiu: ${formatMoney(prices.hiu)}
🐋 Paus: ${formatMoney(prices.paus)}
🐳 Orca: ${formatMoney(prices.orca)}

*🌲 Hasil Hutan & Darat:*
🐔 Ayam: ${formatMoney(prices.ayam)}
🐐 Kambing: ${formatMoney(prices.kambing)}
🐂 Sapi: ${formatMoney(prices.sapi)}
🐃 Kerbau: ${formatMoney(prices.kerbau)}
🐖 Babi: ${formatMoney(prices.babi)}
🐗 Babi Hutan: ${formatMoney(prices.babihutan)}
🐒 Monyet: ${formatMoney(prices.monyet)}
🐊 Buaya: ${formatMoney(prices.buaya)}
🐼 Panda: ${formatMoney(prices.panda)}
🐃 Banteng: ${formatMoney(prices.banteng)}
🐅 Harimau: ${formatMoney(prices.harimau)}
🐘 Gajah: ${formatMoney(prices.gajah)}

━━━━━━━━━━━━━━━━━
🧪 *Format Penggunaan:*

• *${usedPrefix}pasar jual <hewan>*
• *${usedPrefix}pasar jual ayam 10*
• *${usedPrefix}pasar jual ayam all*
• *${usedPrefix}pasar jual all*

━━━━━━━━━━━━━━━━━`.trim()

        // ==============================
        // JIKA BUKAN ACTION JUAL
        // ==============================

        if (action !== 'jual') {
            return conn.reply(m.chat, Kchat, m)
        }

        // ==============================
        // JUAL TANPA ITEM
        // ==============================

        if (!item) {
            return conn.reply(m.chat, Kchat, m)
        }

        // ==============================
        // JUAL SEMUA HEWAN
        // pasar jual all
        // ==============================

        if (item === 'all') {
            let totalUang = 0
            let totalHewan = 0
            let listTerjual = []

            for (const key of Object.keys(prices)) {
                const stok = Number(user[key] || 0)

                if (stok > 0) {
                    const pendapatan = stok * prices[key]

                    user.money = Number(user.money || 0) + pendapatan
                    user[key] = 0

                    totalUang += pendapatan
                    totalHewan += stok

                    listTerjual.push(
                        `• ${names[key]} x${stok} → +${formatMoney(pendapatan)} Money`
                    )
                }
            }

            if (totalUang <= 0) {
                return conn.reply(
                    m.chat,
                    '❌ Kamu tidak memiliki hewan apapun untuk dijual.',
                    m
                )
            }

            return conn.reply(
                m.chat,
                `✅ *Berhasil menjual semua hewan!*

*📦 Total Hewan:* ${totalHewan} ekor

*📋 Rincian:*
${listTerjual.join('\n')}

━━━━━━━━━━━━━━━━━
💰 *Total Pendapatan:* +${formatMoney(totalUang)} Money
💵 *Saldo Sekarang:* ${formatMoney(user.money)} Money`,
                m
            )
        }

        // ==============================
        // VALIDASI ITEM
        // ==============================

        if (!Object.prototype.hasOwnProperty.call(prices, item)) {
            return conn.reply(
                m.chat,
                `❌ Hewan *"${item}"* tidak ditemukan.

Ketik *${usedPrefix}pasar* untuk melihat daftar hewan.`,
                m
            )
        }

        // ==============================
        // JUMLAH PENJUALAN
        // ==============================

        let count = 1

        if (countArg === 'all') {
            count = Number(user[item] || 0)
        } else if (countArg !== '') {
            count = parseInt(countArg)

            if (isNaN(count) || count < 1) {
                return conn.reply(
                    m.chat,
                    '❌ Jumlah harus berupa angka lebih dari 0 atau gunakan *all*.',
                    m
                )
            }

            // Batas keamanan
            if (count > 99999999) {
                count = 99999999
            }
        }

        // ==============================
        // VALIDASI STOK
        // ==============================

        const stok = Number(user[item] || 0)

        if (stok < 1) {
            return conn.reply(
                m.chat,
                `❌ Kamu tidak memiliki *${names[item]}* untuk dijual.`,
                m
            )
        }

        if (stok < count) {
            return conn.reply(
                m.chat,
                `❌ *${names[item]}* kamu tidak cukup.

📦 Stok kamu: *${stok}*
📤 Yang ingin dijual: *${count}*`,
                m
            )
        }

        // ==============================
        // PROSES PENJUALAN
        // ==============================

        const pendapatan = count * prices[item]

        user.money = Number(user.money || 0) + pendapatan
        user[item] = stok - count

        // ==============================
        // HASIL
        // ==============================

        return conn.reply(
            m.chat,
            `✅ *Berhasil menjual!*

🐾 Hewan: *${names[item]}*
📦 Jumlah: *${count} ekor*
💰 Pendapatan: *+${formatMoney(pendapatan)} Money*
📦 Sisa stok: *${user[item]} ekor*
💵 Saldo: *${formatMoney(user.money)} Money*`,
            m
        )

    } catch (e) {
        console.log('[PASAR ERROR]', e)

        conn.reply(
            m.chat,
            '❌ Terjadi kesalahan saat memproses transaksi.',
            m
        )

        if (DevMode) {
            try {
                for (const jid of global.owner
                    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
                    .filter(v => !conn.user || v !== conn.user.jid)) {

                    await conn.sendMessage(jid, {
                        text:
                            'pasar.js error\n' +
                            'No: *' + m.sender.split('@')[0] + '*\n' +
                            'Command: *' + (m.text || '') + '*\n\n' +
                            '*Error:* ' + e
                    })
                }
            } catch (err) {
                console.log('[DEV ERROR]', err)
            }
        }
    }
}

handler.help = [
    'pasar jual <hewan> <jumlah>'
]

handler.tags = ['rpg']

handler.command = /^(pasar|jual|sell)$/i

handler.rpg = true

export default handler