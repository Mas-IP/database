//create code Wonge-bot

let handler = async (m, { conn }) => {
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.users = global.db.data.users || {}
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
        lastngewe: 0,
        ngewe: 0,
        warn: 0,
        money: 0,
        exp: 0
    }

    let user = global.db.data.users[m.sender]

    // Cooldown khusus fitur ngewe
    const NGEWE_COOLDOWN = 300000
    const now = Date.now()

    // Pastikan data lastngewe valid dan hanya milik fitur ini
    if (typeof user.lastngewe !== 'number') {
        user.lastngewe = 0
    }

    let __timers = now - user.lastngewe
    let _timers = NGEWE_COOLDOWN - __timers
    let order = user.ngewe || 0
    let timers = ngeweClockString(_timers)
    let name = await conn.getName(m.sender).catch(() => 'User')

    if (__timers > NGEWE_COOLDOWN) {
        let randomaku1 = Math.floor(Math.random() * 10)
        let randomaku2 = Math.floor(Math.random() * 10)
        let randomaku4 = Math.floor(Math.random() * 5)
        let randomaku3 = Math.floor(Math.random() * 10)
        let randomaku5 = Math.floor(Math.random() * 10)

        let rbrb1 = (randomaku1 * 2)
        let rbrb2 = (randomaku2 * 10)
        let rbrb3 = (randomaku3 * 1)
        let rbrb4 = (randomaku4 * 15729)
        let rbrb5 = (randomaku5 * 20000)

        let zero4 = rbrb4
        let zero5 = rbrb5

        let arr = [
            "✔️ Mendapatkan pelanggan....",
            "🥵 Mulai mengocok.....",
            `🥵Ahhhh, Sakitttt!! >////<\n 💦Crotttt.....`,
            "🥵💦💦Ahhhhhh😫",
            `—[ Hasil Ngewe ${name} ]—\n➕ 💹 Uang = [ ${zero4.toLocaleString('id-ID')} ]\n➕ ✨ Exp = [ ${zero5.toLocaleString('id-ID')} ] \n➕ 📛 Warn = +1		 \n➕ 😍 Order Selesai = +1\n➕ 📥 Total Order Sebelumnya : ${order}\n${global.wm || ''}`
        ]

        let { key } = await conn.sendMessage(m.chat, {
            text: '🔍 Mencari pelanggan.....'
        })

        for (let i = 0; i < arr.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000))

            await conn.sendMessage(m.chat, {
                text: arr[i],
                edit: key
            }).catch(async () => {
                await conn.reply(m.chat, arr[i], m)
            })
        }

        user.warn += 1
        user.money += rbrb4
        user.exp += rbrb5
        user.ngewe += 1

        // Timestamp cooldown khusus fitur ngewe
        user.lastngewe = Date.now()

    } else {
        conn.reply(
            m.chat,
            `Kamu sudah ngewe dengan seseorang\nHarap tunggu ${timers} untuk kembali ngewe`,
            m
        )
    }
}

handler.help = ['ngewe']
handler.tags = ['rpg']
handler.command = /^(ngewe|anu)$/i
handler.register = true
handler.premium = true
handler.rpg = true

export default handler

// Helper khusus fitur ngewe agar tidak bentrok dengan fitur lain
function ngeweClockString(ms) {
    if (ms < 0) ms = 0

    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60

    return [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}