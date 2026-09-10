//create code Wonge-bot

let handler = async (m, { args, command, isOwner }) => {
  if (!global.db.data.donasi) {
    global.db.data.donasi = []
  }

  if (command == 'donasi') {
    if (global.db.data.donasi.length == 0) {
      return m.reply('Belum ada list donasi')
    }

    let sorted = [...global.db.data.donasi].sort((a, b) => {
      return Number(b.nominal) - Number(a.nominal)
    })

    let teks = '┏━━━〔 LIST DONASI 〕━━━┓\n\n'

    sorted.forEach((d, i) => {
      teks += `${i + 1}. ${d.nama} (Rp${Number(d.nominal).toLocaleString()})\n`
    })

    teks += '\n┗━━━━━━━━━━━━━━━━┛'

    teks += `\n\n> Yang mau donasi buat dukung bot ini, bisa hubungi owner ya.
> Premium / sewa juga bisa membantu biar bot tetap aktif dan terus update.
> Terima kasih buat yang sudah support 🙏`

    // Hanya kirim teks
    return m.reply(teks)
  }

  if (command == 'adddonasi') {
    if (!isOwner) {
      return m.reply('Khusus owner')
    }

    if (args.length < 2) {
      return m.reply(
        'Format: .adddonasi nama nominal\nContoh: .adddonasi Dana 10000'
      )
    }

    let nama = args[0]
    let nominal = args[1]

    if (isNaN(nominal)) {
      return m.reply('Nominal harus angka')
    }

    global.db.data.donasi.push({
      nama: nama,
      nominal: Number(nominal)
    })

    return m.reply(
      `Berhasil tambah:\n${nama} (Rp${Number(nominal).toLocaleString()})`
    )
  }

  if (command == 'deldonasi') {
    if (!isOwner) {
      return m.reply('Khusus owner')
    }

    if (!args[0]) {
      return m.reply(
        'Format: .deldonasi nomor\nContoh: .deldonasi 1'
      )
    }

    let sorted = [...global.db.data.donasi].sort((a, b) => {
      return Number(b.nominal) - Number(a.nominal)
    })

    let index = parseInt(args[0]) - 1

    if (isNaN(index) || index < 0 || index >= sorted.length) {
      return m.reply('Nomor tidak valid')
    }

    let target = sorted[index]

    let realIndex = global.db.data.donasi.findIndex(d => {
      return d.nama === target.nama && d.nominal === target.nominal
    })

    if (realIndex === -1) {
      return m.reply('Data donasi tidak ditemukan')
    }

    let removed = global.db.data.donasi.splice(realIndex, 1)

    return m.reply(`Berhasil hapus ${removed[0].nama}`)
  }
}

handler.help = ['donasi', 'adddonasi', 'deldonasi']
handler.tags = ['shop']
handler.command = /^(donasi|adddonasi|deldonasi)$/i

export default handler