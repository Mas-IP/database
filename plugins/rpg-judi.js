//create code Wonge-bot

let handler = async (m, { conn, text }) => {
  global.db.data.users ||= {}

  let users = global.db.data.users
  let user = users[m.sender]

  // cek user
  if (!user) {
    users[m.sender] = {
      money: 0,
      exp: 0,
      lastclaim: 0
    }
    user = users[m.sender]
  }

  if (!text) {
    throw 'Masukkan jumlah taruhan.\nContoh: *.judi 1000* atau *.judi all*'
  }

  let taruhan
  if (text.toLowerCase() === 'all') {
    taruhan = user.money
  } else {
    taruhan = parseInt(text)
  }

  if (isNaN(taruhan) || taruhan <= 0) {
    throw 'Taruhan harus berupa angka yang valid.'
  }

  if (user.money < taruhan) {
    throw 'Money kamu tidak cukup 😢'
  }

  // animasi reaksi
  await conn.sendMessage(m.chat, {
    react: {
      text: '🎰',
      key: m.key
    }
  })

  // sistem menang / kalah (50:50) = 0.5
  let win = Math.random() < 0.3

  if (win) {
    let hadiah = taruhan * 2
    user.money += taruhan // untung = +taruhan

    conn.reply(
      m.chat,
      `🎉 *MENANG!* 🎉\n` +
      `Kamu menang judi sebesar *${hadiah.toLocaleString('id-ID')} money*\n` +
      `Saldo sekarang: *${user.money.toLocaleString('id-ID')}*`,
      m
    )
  } else {
    user.money -= taruhan

    conn.reply(
      m.chat,
      `💀 *KALAH!* 💀\n` +
      `Money kamu berkurang *${taruhan.toLocaleString('id-ID')}*\n` +
      `Saldo sekarang: *${user.money.toLocaleString('id-ID')}*`,
      m
    )
  }
}

handler.help = ['judi <jumlah|all>']
handler.tags = ['rpg']
handler.command = /^judi$/i
handler.rpg = true

export default handler