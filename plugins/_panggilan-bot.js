//create code Wonge-bot

// 🤖 Auto response pemanggil bot (teks + sound + cooldown + on/off)

import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname || process.cwd()

// status grup
const groupStatus = new Map()

// cooldown anti spam
const cooldown = new Map()
const COOLDOWN_TIME = 15 * 1000 // 15 detik

let handler = async (m, { usedPrefix, command, text }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Fitur ini hanya untuk grup.')

  const status = groupStatus.get(m.chat)

  if (!text) {
    return m.reply(
      `🤖 *Auto Response Bot*\n\nStatus: *${
        status === false ? 'Nonaktif' : 'Aktif'
      }*\n\nGunakan:\n• ${usedPrefix + command} on\n• ${usedPrefix + command} off`
    )
  }

  let action = text.toLowerCase()

  if (['on', 'enable', '1'].includes(action)) {
    groupStatus.set(m.chat, true)
    return m.reply('✅ *Auto response diaktifkan!*')
  }

  if (['off', 'disable', '0'].includes(action)) {
    groupStatus.set(m.chat, false)
    return m.reply('❌ *Auto response dimatikan!*')
  }

  return m.reply(`❌ Format salah!\nGunakan: ${usedPrefix + command} on/off`)
}

/* ================= AUTO RESPONSE ================= */

handler.before = async (m, { conn }) => {
  try {
    if (m.isBaileys || !m.text) return true

    // cek status grup
    const status = groupStatus.get(m.chat)
    if (m.isGroup && status === false) return true

    const text = m.text.toLowerCase()

    const callRegex =
      /(^|\s)(bot|.bothalo|hai|hi|hii|sepi|tumben sepi)(\s|$)/i

    if (!callRegex.test(text)) return true

    // ===== COOLDOWN =====
    const now = Date.now()
    const last = cooldown.get(m.chat) || 0

    if (now - last < COOLDOWN_TIME) return true
    cooldown.set(m.chat, now)

    // delay natural
    await new Promise(res =>
      setTimeout(res, Math.random() * 1500 + 800)
    )

    // ===== TEXT ASLI =====
    const response = `
🤖 *WONG-BOT*

Kenapa? Aku dipanggil ya 😳
Aku selalu standby kok buat kamu~

📌 Ketik:
.menu / .menuall
buat pakai bot nyaa 💕
    `.trim()

    // kirim teks + mention
    await conn.sendMessage(
      m.chat,
      {
        text: response,
        mentions: [m.sender]
      },
      { quoted: m }
    )

    // kirim sound langsung dari URL config
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: global.reactBot },
        mimetype: 'audio/mpeg',
        ptt: true
      },
      { quoted: m }
    )

    return true
  } catch (e) {
    console.error('Auto Response Error:', e)
    return true
  }
}

/* ================= METADATA ================= */

handler.help = ['arbot on/off']
handler.tags = ['group']
handler.command = /^arbot$/i

export default handler