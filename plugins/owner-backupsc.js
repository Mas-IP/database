//create code Wonge-bot

import fs from 'fs'
import { exec } from 'child_process'
import cp from 'child_process'
import { promisify } from 'util'

const exec_ = promisify(exec).bind(cp)

// ==============================
// FORMAT ANGKA
// ==============================

const pad = n => n.toString().padStart(2, '0')

// ==============================
// WAKTU WIB
// ==============================

const getWIBTime = () => {
  const sekarang = new Date()
  const wib = new Date(sekarang.getTime() + 7 * 60 * 60 * 1000)

  const tahun = wib.getUTCFullYear()
  const bulan = pad(wib.getUTCMonth() + 1)
  const tanggal = pad(wib.getUTCDate())
  const jam = pad(wib.getUTCHours())
  const menit = pad(wib.getUTCMinutes())
  const detik = pad(wib.getUTCSeconds())

  return `${tahun}-${bulan}-${tanggal}_${jam}-${menit}-${detik}`
}

// ==============================
// HANDLER
// ==============================

let handler = async function (m, { conn }) {
  try {
    const time = getWIBTime()
    const zipFileName = `BackupScript_${time}.zip`

    // Pesan awal
    const msg = await conn.sendMessage(
      m.chat,
      {
        text: '📦 Sedang memulai proses backup. Harap tunggu...'
      },
      { quoted: m }
    )

    // Proses ZIP langsung tanpa delay
    const zipCommand = `zip -r "${zipFileName}" * -x "node_modules/*"`
    await exec_(zipCommand)

    // Update status setelah zip selesai
    await conn.sendMessage(m.chat, {
      text: '📤 Backup selesai dibuat. Sedang mengirim file ke owner...',
      edit: msg.key
    })

    // Kirim file segera setelah zip selesai, tanpa delay 3 detik
    if (!fs.existsSync(zipFileName)) {
      await conn.sendMessage(m.chat, {
        text: '❌ File ZIP tidak ditemukan.',
        edit: msg.key
      })
      return
    }

    const file = fs.readFileSync(zipFileName)
    const owners = global.owner || []

    if (!owners.length) {
      await conn.sendMessage(m.chat, {
        text: '❌ Data owner tidak ditemukan.',
        edit: msg.key
      })
      return
    }

    // Kirim ke semua owner
    for (const number of owners) {
      const cleanNumber = number
        .toString()
        .replace(/[^0-9]/g, '')

      if (!cleanNumber) continue

      const jid = `${cleanNumber}@s.whatsapp.net`

      await conn.sendMessage(jid, {
        document: file,
        mimetype: 'application/zip',
        fileName: zipFileName,
        caption:
          `📦 *Backup Script*\n\n` +
          `🕒 Waktu WIB: ${time}\n` +
          `📁 File: ${zipFileName}`
      })
    }

    // Update status sukses
    await conn.sendMessage(m.chat, {
      text: '✅ Backup berhasil dibuat dan dikirim ke semua owner.',
      edit: msg.key
    })

    // Hapus file backup segera setelah terkirim (tanpa delay 1 detik)
    if (fs.existsSync(zipFileName)) {
      fs.unlinkSync(zipFileName)

      await conn.sendMessage(m.chat, {
        text: '🗑️ File backup telah dihapus dari server.',
        edit: msg.key
      })
    }

  } catch (error) {
    console.error('Error backup:', error)

    await conn.sendMessage(
      m.chat,
      {
        text: '❌ Terjadi kesalahan saat melakukan backup.'
      },
      { quoted: m }
    )
  }
}

// ==============================
// COMMAND
// ==============================

handler.help = ['backupsc']
handler.tags = ['owner']
handler.command = ['backupsc']
handler.owner = true

export default handler