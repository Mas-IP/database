//create code Wonge-bot

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Format salah!\nContoh: .tfmoney 1000 @user'

  let args = text.split(' ')
  let amount = parseInt(args[0])
  let target = m.mentionedJid && m.mentionedJid[0]

  if (!amount || isNaN(amount) || amount < 1)
    throw 'Jumlah money harus berupa angka valid!\nContoh: .tfmoney 1000 @user'

  if (!target)
    throw 'Tag pengguna yang mau kamu kirimi money!\nContoh: .tfmoney 1000 @user'

  let users = global.db.data.users

  if (!users[m.sender]) {
    users[m.sender] = {
      money: 0,
      exp: 0,
      lastclaim: 0
    }
  }

  if (!users[target]) {
    users[target] = {
      money: 0,
      exp: 0,
      lastclaim: 0
    }
  }

  if (users[m.sender].money < amount) {
    return m.reply(
      'Money kamu tidak cukup.\nSaldo: ' +
      users[m.sender].money.toLocaleString('id-ID')
    )
  }

  // proses transfer
  users[m.sender].money -= amount
  users[target].money += amount

  await conn.sendMessage(m.chat, {
    react: {
      text: '💸',
      key: m.key
    }
  })

  return conn.reply(
    m.chat,
    '✨ *TRANSFER BERHASIL!* ✨\n\n' +
    '💰 Jumlah: ' + amount.toLocaleString('id-ID') + '\n' +
    '👤 Dari: @' + m.sender.split('@')[0] + '\n' +
    '🎯 Ke: @' + target.split('@')[0],
    m,
    {
      mentions: [m.sender, target]
    }
  )
}

handler.help = ['tfmoney <jumlah> @user']
handler.tags = ['rpg']
handler.command = /^tfmoney$/i
handler.register = true

export default handler