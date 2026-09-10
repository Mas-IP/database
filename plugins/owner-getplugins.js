//create code Wonge-bot
// Plugin: owner-getplugins.js

import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname

function getPluginPath(filename) {
    if (!filename) return null

    filename = path.basename(filename)

    if (!/\.js$/i.test(filename)) {
        filename += '.js'
    }

    return path.join(__dirname, filename)
}

function getPluginList() {
    return fs.readdirSync(__dirname)
        .filter(v => /\.js$/i.test(v))
        .map(v => v.replace(/\.js$/i, ''))
        .sort()
}

let handler = async (m, { usedPrefix, command, text }) => {
    const args = (text || '').trim()

    // ==============================
    // GET PLUGIN
    // ==============================
    if (/^(getplugin|get ?plugin|gp)$/i.test(command)) {
        if (!args) {
            throw `where is the filename?\n\nExample:\n${usedPrefix + command} menu.js`
        }

        const filename = getPluginPath(args)

        if (!fs.existsSync(filename)) {
            return m.reply(`
'${path.basename(filename)}' not found!

Available plugins:
${getPluginList().join('\n')}
`.trim())
        }

        // Ambil kode apa adanya.
        // Tidak menambahkan watermark otomatis.
        const code = fs.readFileSync(filename, 'utf8')

        return m.reply(code)
    }

    // ==============================
    // DELETE PLUGIN
    // ==============================
    if (/^delplugin$/i.test(command)) {
        if (!args) {
            throw `where is the filename?\n\nExample:\n${usedPrefix + command} menu.js`
        }

        const filename = getPluginPath(args)

        if (!fs.existsSync(filename)) {
            return m.reply(
                `❌ Plugin '${path.basename(filename)}' not found!`
            )
        }

        fs.unlinkSync(filename)

        return m.reply(
            `✅ Plugin berhasil dihapus!\n\n` +
            `📁 File: ${path.basename(filename)}`
        )
    }

    // ==============================
    // UPDATE / UPLOAD PLUGIN
    // ==============================
    if (/^upplugin$/i.test(command)) {
        if (!args) {
            throw `where is the filename?\n\nExample:\n${usedPrefix + command} menu.js`
        }

        /*
         * Format:
         *
         * .upplugin nama.js <kode>
         *
         * atau reply pesan berisi kode:
         *
         * .upplugin nama.js
         */

        const parts = args.split(/\s+/)
        const filenameInput = parts.shift()
        let code = parts.join(' ').trim()

        // ==============================
        // AMBIL KODE DARI QUOTED MESSAGE
        // ==============================
        if (!code && m.quoted) {
            try {
                code = m.quoted.text || ''
            } catch (e) {
                code = ''
            }
        }

        if (!code) {
            throw `
❌ Kode plugin tidak ditemukan!

Gunakan salah satu:

${usedPrefix}upplugin menu.js <kode>

atau reply pesan berisi kode dengan:

${usedPrefix}upplugin menu.js
`.trim()
        }

        const filename = getPluginPath(filenameInput)

        // ==============================
        // SIMPAN PLUGIN
        // ==============================
        /*
         * Kode disimpan PERSIS seperti yang dikirim.
         *
         * Tidak ada watermark otomatis.
         * Jika ingin watermark, tambahkan sendiri
         * di dalam kode sebelum upload.
         */
        fs.writeFileSync(filename, code, 'utf8')

        return m.reply(
            `✅ Plugin berhasil diupload/update!\n\n` +
            `📁 File: ${path.basename(filename)}\n` +
            `📦 Size: ${Buffer.byteLength(code, 'utf8')} bytes`
        )
    }
}

handler.help = [
    'getplugin [filename]',
    'upplugin [filename]',
    'delplugin [filename]'
]

handler.tags = ['owner']

handler.command = /^(getplugin|get ?plugin|gp|upplugin|delplugin)$/i

handler.rowner = true

export default handler