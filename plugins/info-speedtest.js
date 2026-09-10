//create code Wonge-bot

import cp from 'child_process'
import { promisify } from 'util'

const exec = promisify(cp.exec).bind(cp)

let handler = async (m, { conn }) => {
  await conn.reply(m.chat, 'Please Wait', m)

  let o
  try {
    o = await exec('python3 speed.py --share --secure')
  } catch (e) {
    o = e
  } finally {
    let { stdout = '', stderr = '' } = o

    if (stdout.trim()) {
      // Ambil URL gambar hasil speedtest
      const imageUrl = stdout.match(/https?:\/\/\S+\.(?:png|jpg|jpeg)/i)?.[0]

      if (imageUrl) {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: imageUrl },
            caption: stdout.trim(),
            mentions: [m.sender]
          },
          { quoted: m }
        )
      } else {
        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: 'https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg'
            },
            caption: stdout.trim(),
            mentions: [m.sender]
          },
          { quoted: m }
        )
      }
    }

    if (stderr.trim()) m.reply(stderr)
  }
}

handler.help = ['speedtest']
handler.tags = ['info']
handler.command = /^(speedtest|ookla)$/i
handler.premium = false
handler.admin = true

export default handler