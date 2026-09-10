//create code Wonge-bot

const free = 500
const prem = 1000
const limitfree = 5
const limitprem = 10
const moneyfree = 100000
const moneyprem = 300000

const handler = async (m, { conn, isPrems }) => {
  const user = global.db.data.users[m.sender]
  const time = user.lastdaily + 86400000

  if (Date.now() - user.lastdaily < 86400000) {
    throw `Kamu sudah klaim daily hari ini\nTunggu ${msToTime(time - Date.now())} lagi`
  }

  user.exp += isPrems ? prem : free
  user.money += isPrems ? moneyprem : moneyfree
  user.limit += isPrems ? limitprem : limitfree

  await conn.reply(
    m.chat,
    `Selamat kamu mendapatkan:\n\n+${isPrems ? prem : free} Exp\n+${isPrems ? moneyprem : moneyfree} Money\n+${isPrems ? limitprem : limitfree} Limit`,
    m
  )

  user.lastdaily = Date.now()
}

handler.help = ['harian']
handler.tags = ['rpgabsen']
handler.command = /^(harian)$/i
handler.limit = false
handler.rpg = true
handler.fail = null

export default handler

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  return `${hours} jam ${minutes} menit ${seconds} detik`
}