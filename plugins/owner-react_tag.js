//create code Wonge-bot

import fs from 'fs'
import path from 'path'

export default {
  before: async function (m, { conn }) {
    if (!m.isGroup) return
    if (!m.sender) return

    const botNumber = conn.user?.jid
    if (!botNumber) return

    // =========================
    // OWNER
    // =========================
    const owners = (global.owner || []).map(v => {
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })

    // =========================
    // CEK MENTION
    // =========================
    if (!m.mentionedJid?.length) return

    const taggedOwners = m.mentionedJid
      .filter(jid => jid !== botNumber)
      .filter(jid => owners.includes(jid))

    if (!taggedOwners.length) return

    console.log('OWNER KE TAG KEDETEK ✅')

    // =========================
    // TEXT
    // =========================
    const teks =
      taggedOwners
        .map(jid => '@' + jid.split('@')[0])
        .join(' ') +
      ' Sayang ada fans nyariin tuh 👀'

    // =========================
    // CEK VIDEO CONFIG
    // =========================
    const videoConfig = global.reactOwner

    let videoReady = false

    if (videoConfig) {
      // Jika berupa URL
      if (
        typeof videoConfig === 'string' &&
        /^https?:\/\//i.test(videoConfig)
      ) {
        videoReady = true
      }

      // Jika berupa path file lokal
      else if (typeof videoConfig === 'string') {
        const filePath = path.isAbsolute(videoConfig)
          ? videoConfig
          : path.resolve(process.cwd(), videoConfig)

        if (fs.existsSync(filePath)) {
          videoReady = true
        }
      }
    }

    // =========================
    // JIKA VIDEO TIDAK ADA
    // =========================
    if (!videoReady) {
      console.log('VIDEO reactOwner tidak ditemukan, kirim text saja')

      await conn.sendMessage(
        m.chat,
        {
          text: teks,
          mentions: taggedOwners
        },
        {
          quoted: m
        }
      )

      return
    }

    // =========================
    // KIRIM VIDEO NOTE
    // =========================
    try {
      await conn.sendMessage(
        m.chat,
        {
          video: {
            url: videoConfig
          },
          mimetype: 'video/mp4',
          ptv: true
        },
        {
          quoted: m
        }
      )
    } catch (e) {
      console.error('Gagal mengirim Video Note:', e)

      // Kalau video gagal dikirim,
      // tetap kirim text
      await conn.sendMessage(
        m.chat,
        {
          text: teks,
          mentions: taggedOwners
        },
        {
          quoted: m
        }
      )

      return
    }

    // =========================
    // TEXT SETELAH VIDEO
    // =========================
    await conn.sendMessage(
      m.chat,
      {
        text: teks,
        mentions: taggedOwners
      },
      {
        quoted: m
      }
    )
  }
}