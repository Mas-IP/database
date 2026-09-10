//create code Wonge-bot

const handler = async (m, { conn, args, command, usedPrefix }) => {

  if (!global.db.data.users) global.db.data.users = {}
  let user = global.db.data.users[m.sender]
  if (!user.money) user.money = 0

  // 🔧 SETTING SELL (ubah di sini doang)
  const SELL_PERCENT = 0.10 // 50% = setengah

  const prices = {
    limit: 1000000,
    pet: 150000,

    bibitpisang: 550,
    bibitanggur: 550,
    bibitmangga: 550,
    bibitjeruk: 550,
    bibitapel: 550,

    potion: 20000,
    diamond: 100000,
    emerald: 500000,
    iron: 20000,
    berlian: 150000,
    emas: 150000,
    coal: 1500,
    common: 100000,
    uncommon: 100000,
    mythic: 100000,
    legendary: 200000,
    sampah: 120,
    string: 50000,
    botol: 300,
    kaleng: 400,
    kardus: 400,
    kayu: 1000,
    batu: 500,

    pisang: 5500,
    anggur: 5500,
    mangga: 4600,
    jeruk: 6000,
    apel: 5500,

    makananpet: 50000,
    makanannaga: 150000,
    makanankyubi: 150000,
    makanangriffin: 80000,
    makananphonix: 80000,
    makanancentaur: 150000,

    aqua: 5000,
    umpan: 1500
  }

  // 🔧 FUNCTION SELL (pakai persen)
  const sellPrice = function (buy) {
    return Math.floor(buy * SELL_PERCENT)
  }

  if (command === 'shop') {
    const action = args[0] ? args[0].toLowerCase() : null

    if (!action) {
      let teks = `
╸╸━━━「 *Harga Beli* 」━━━╺╺

> Kebutuhan
🏷️Limit: ${prices.limit}
🐉Pet: ${prices.pet}

> Bibit Buah
🍌BibitPisang: ${prices.bibitpisang}
🍇BibitAnggur: ${prices.bibitanggur}
🥭BibitMangga: ${prices.bibitmangga}
🍊BibitJeruk: ${prices.bibitjeruk}
🍎BibitApel: ${prices.bibitapel}

> Barang
🥤Potion: ${prices.potion}
💎Diamond: ${prices.diamond}
❇️Emerald: ${prices.emerald}
⛓Iron: ${prices.iron}
💎Berlian: ${prices.berlian}
🪙Emas: ${prices.emas}
🪨Coal: ${prices.coal}
📨Common: ${prices.common}
📨Uncommon: ${prices.uncommon}
🎁Mythic: ${prices.mythic}
🗃Legendary: ${prices.legendary}
🗑Sampah: ${prices.sampah}
🧵String: ${prices.string}
🍾Botol: ${prices.botol}
🥫Kaleng: ${prices.kaleng}
📦Kardus: ${prices.kardus}
🪵Kayu: ${prices.kayu}
🪨Batu: ${prices.batu}

> Makanan
🍌Pisang: ${prices.pisang}
🍇Anggur: ${prices.anggur}
🥭Mangga: ${prices.mangga}
🍊Jeruk: ${prices.jeruk}
🍎Apel: ${prices.apel}
🫔MakananPet: ${prices.makananpet}
🥩MakananNaga: ${prices.makanannaga}
🥩MakananKyubi: ${prices.makanankyubi}
🥩MakananGriffin: ${prices.makanangriffin}
🥩MakananPhonix: ${prices.makananphonix}
🥩MakananCentaur: ${prices.makanancentaur}

> Minuman
🫗Aqua: ${prices.aqua}

> Fishing
🪤Umpan: ${prices.umpan}

Gunakan:
${usedPrefix}shop buy <item> <jumlah>
${usedPrefix}shop sell <item> <jumlah|all>

Contoh:
${usedPrefix}shop buy potion 1
${usedPrefix}shop sell potion all
      `.trim()

      return conn.reply(m.chat, teks, m)
    }

    // BUY
    if (action === 'buy') {
      let item = args[1] ? args[1].toLowerCase() : null
      let jumlah = parseInt(args[2]) || 1

      if (!item) throw `Format: ${usedPrefix}shop buy <item> <jumlah>`

//     // ❌ BLOCK LIMIT
//     if (item === 'limit') throw 'Limit sold out.'

      if (!(item in prices)) throw 'Item tidak tersedia.'

      let total = prices[item] * jumlah
      if (user.money < total) throw 'Uang tidak cukup.'

      user.money -= total
      user[item] = (user[item] || 0) + jumlah

      return conn.reply(m.chat, `Berhasil beli ${jumlah} ${item}\nTotal: ${total}`, m)
   }

    // SELL
    if (action === 'sell') {
      let item = args[1] ? args[1].toLowerCase() : null
      let jumlahArg = args[2]

      if (!item) throw `Format: ${usedPrefix}shop sell <item> <jumlah|all>`

      // ❌ BLOCK LIMIT
      if (item === 'limit') throw 'Limit tidak bisa dijual.'

      if (!(item in prices)) throw 'Item tidak tersedia.'
      if (!user[item]) throw 'Item tidak ada di inventory.'

      let jumlah = jumlahArg === 'all' ? user[item] : parseInt(jumlahArg) || 1
      if (user[item] < jumlah) throw 'Item tidak cukup.'

      let total = sellPrice(prices[item]) * jumlah

      user[item] -= jumlah
      user.money += total

      return conn.reply(m.chat, `Berhasil menjual ${jumlah} ${item}\nDapat uang: ${total}`, m)
    }
  }
}

handler.help = ['shop']
handler.tags = ['rpg']
handler.command = /^shop$/i

export default handler