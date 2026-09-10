//create code Wonge-bot

let handler = async (m, { conn }) => {
    let __timers = (new Date - global.db.data.users[m.sender].lasttaxi)
    let _timers = (3600000 - __timers)
    let order = global.db.data.users[m.sender].taxi
    let timers = clockString(_timers)
    let name = await conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    let id = m.sender
    let kerja = 'taxi'
    conn.misi = conn.misi ? conn.misi : {}

    if (id in conn.misi) {
        conn.reply(m.chat, `Selesaikan orderan taxi kamu ${conn.misi[id][0]} Terlebih Dahulu`, m)
        throw false
    }

    if (new Date - user.lasttaxi > 3600000) {
        let randomaku1 = Math.floor(Math.random() * 1000000)
        let randomaku2 = Math.floor(Math.random() * 10000)

        var njir = `
🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🏘️🏘️🏘️🏘️🌳  🌳 🏘️       🚕


✔️ Mendapatkan orderan....
`.trim()

        var njirr = `
🚶⬛⬛⬛⬛⬛🚐⬛⬛⬛🚓🚚
🚖⬜⬜⬜⬛⬜⬜⬜🚓⬛🚑
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚙
🏘️🏘️🏢️🌳  🌳 🏘️  🏘️🏡


🚖 Mengantar Ke tujuan.....
`.trim()

        var njirrr = `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🚓
⬛⬜🚗⬜⬜⬛⬜🚐⬜⬜⬛🚙🚚🚑
⬛⬛⬛⬛🚒⬛⬛⬛⬛⬛⬛🚚
🏘️🏘️🏘️🏘️🌳  🌳 🏘️


🚖 Selesai Mengantar Pelanggan....
`.trim()

        var njirrrr = `
➕ 💹Menerima gaji....
`.trim()

        var hasil = `
*—[ Hasil taxi ${name} ]—*
➕ 💹 Uang = [ ${randomaku1} ]
➕ ✨ Exp = [ ${randomaku2} ]
➕ 😍 Order Selesai = +1
➕ 📥Total Order Sebelumnya : ${order}
`.trim()

        user.money += randomaku1
        user.exp += randomaku2
        user.taxi += 1

        conn.misi[id] = [
            kerja,
            setTimeout(() => {
                delete conn.misi[id]
            }, 27000)
        ]

        // Pesan awal yang nantinya akan terus diedit
        let msg = await m.reply('🔍Mencari orderan buat kamu.....')

        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                text: njir
            }, {
                edit: msg.key
            })
        }, 10000)

        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                text: njirr
            }, {
                edit: msg.key
            })
        }, 15000)

        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                text: njirrr
            }, {
                edit: msg.key
            })
        }, 20000)

        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                text: njirrrr
            }, {
                edit: msg.key
            })
        }, 25000)

        setTimeout(async () => {
            await conn.sendMessage(m.chat, {
                text: hasil
            }, {
                edit: msg.key
            })
        }, 27000)

        user.lasttaxi = new Date * 1
    } else {
        m.reply(`kamu kecapean, istirahat dulu selama ${timers}, baru gas ngorder lagi`)
    }
}

handler.help = ['taxi']
handler.tags = ['rpg']
handler.command = /^(taxi)$/i
handler.register = true
handler.group = true
handler.rpg = true

export default handler


function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}