//create code Wonge-bot

const free = 4000
const prem = 8000
const limitfree = 20
const limitprem = 50
const moneyfree = 5000000
const moneyprem = 15000000
const timeout = 2592000000

let handler = async function (m, { conn, isPrems }) {
    let time = global.db.data.users[m.sender].lastmonthly + timeout

    if (new Date() - global.db.data.users[m.sender].lastmonthly < timeout) {
        throw 'Anda sudah mengklaim, klaim bulanan ini\ntunggu selama ' + msToTime(time - new Date()) + ' lagi'
    }

    global.db.data.users[m.sender].exp += isPrems ? prem : free
    global.db.data.users[m.sender].money += isPrems ? moneyprem : moneyfree
    global.db.data.users[m.sender].limit += isPrems ? limitprem : limitfree
    // global.db.data.users[m.sender].pet += 3

    conn.reply(
        m.chat,
        'Selamat kamu mendapatkan:\n\n+' +
            (isPrems ? prem : free) +
            ' Exp\n+' +
            (isPrems ? moneyprem : moneyfree) +
            ' Money\n+' +
            (isPrems ? limitprem : limitfree) +
            ' Limit',
        m
    )

    global.db.data.users[m.sender].lastmonthly = new Date().getTime()
}

handler.help = ['bulanan']
handler.tags = ['rpgabsen']
handler.command = /^(bulanan)$/i
handler.limit = false
handler.rpg = true
handler.fail = null

export default handler

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
    var seconds = Math.floor((duration / 1000) % 60)
    var minutes = Math.floor((duration / (1000 * 60)) % 60)
    var hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    var monthly = Math.floor((duration / (1000 * 60 * 60 * 24)) % 720)

    monthly = monthly < 10 ? '0' + monthly : monthly
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds

    return monthly + ' hari ' + hours + ' jam ' + minutes + ' menit'
}