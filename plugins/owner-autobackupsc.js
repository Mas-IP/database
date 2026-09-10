//create code Wonge-bot

import fs from 'fs'
import cp from 'child_process'
import { promisify } from 'util'
import moment from 'moment-timezone'

const exec = promisify(cp.exec)
const timeZone = 'Asia/Jakarta'

let backupRunning = false

// ========================================
// DAPATKAN WAKTU WIB
// ========================================

const getWIBTime = () => {
    return moment().tz(timeZone).format('YYYY-MM-DD_HH-mm-ss')
}

// ========================================
// FUNGSI BACKUP
// ========================================

const performBackup = async (conn) => {
    if (backupRunning) {
        console.log('[AUTO BACKUP] Backup masih berjalan, dilewati.')
        return
    }

    backupRunning = true

    let zipFileName = null

    try {
        const time = getWIBTime()
        zipFileName = `BackupScript_${time}.zip`

        console.log(`[AUTO BACKUP] Memulai backup: ${zipFileName}`)

        // ========================================
        // BUAT ZIP
        // ========================================

        const zipCommand =
            `zip -r "${zipFileName}" * -x "node_modules/*" "${zipFileName}"`

        await exec(zipCommand)

        // ========================================
        // CEK FILE
        // ========================================

        if (!fs.existsSync(zipFileName)) {
            console.error('[AUTO BACKUP] File ZIP tidak ditemukan.')
            return
        }

        const file = fs.readFileSync(zipFileName)

        // ========================================
        // AMBIL DATA OWNER
        // ========================================

        const owners = global.owner || []

        if (!owners.length) {
            console.error('[AUTO BACKUP] global.owner kosong.')
            return
        }

        // ========================================
        // KIRIM KE SEMUA OWNER
        // ========================================

        let berhasil = 0

        for (const number of owners) {
            try {
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
                        `📦 *BACKUP SCRIPT*\n\n` +
                        `🕒 Waktu WIB: ${time}\n` +
                        `📁 File: ${zipFileName}\n\n` +
                        `🤖 Wonge-bot Auto Backup`
                })

                berhasil++

                console.log(
                    `[AUTO BACKUP] Berhasil dikirim ke: ${cleanNumber}`
                )

            } catch (err) {
                console.error(
                    `[AUTO BACKUP] Gagal mengirim ke ${number}:`,
                    err
                )
            }
        }

        // ========================================
        // SIMPAN TIMESTAMP
        // ========================================

        if (global.db && global.db.data) {
            global.db.data.settings =
                global.db.data.settings || {}

            global.db.data.settings.lastBackupSC = Date.now()
        }

        console.log(
            `[AUTO BACKUP] Backup sukses: ${time} | Owner: ${berhasil}/${owners.length}`
        )

    } catch (err) {
        console.error('[AUTO BACKUP] Error:', err)

    } finally {

        // ========================================
        // HAPUS FILE ZIP
        // ========================================

        try {
            if (zipFileName && fs.existsSync(zipFileName)) {
                fs.unlinkSync(zipFileName)

                console.log(
                    `[AUTO BACKUP] File dihapus: ${zipFileName}`
                )
            }
        } catch (err) {
            console.error(
                '[AUTO BACKUP] Gagal menghapus file ZIP:',
                err
            )
        }

        backupRunning = false
    }
}

// ========================================
// COMMAND AUTOBACKUPSC
// ========================================

let handler = async function (m, { conn, args, isOwner }) {

    if (!isOwner) {
        throw '❌ Khusus owner!'
    }

    if (!args[0]) {
        throw 'Gunakan: autobackupsc on/off'
    }

    const setting = args[0].toLowerCase()

    // Pastikan database tersedia
    global.db = global.db || {}
    global.db.data = global.db.data || {}
    global.db.data.settings =
        global.db.data.settings || {}

    // ========================================
    // AUTO BACKUP ON
    // ========================================

    if (setting === 'on') {

        global.db.data.settings.autoBackupSC = true

        // Reset timestamp supaya backup langsung dilakukan
        global.db.data.settings.lastBackupSC = 0

        await conn.sendMessage(
            m.chat,
            {
                text:
                    '⏳ *Mengaktifkan Auto Backup...*\n\n' +
                    '📦 Backup pertama sedang dibuat.'
            },
            { quoted: m }
        )

        // Backup pertama langsung
        await performBackup(conn)

        await conn.sendMessage(
            m.chat,
            {
                text:
                    '✅ *Auto Backup SC Aktif*\n\n' +
                    '📦 Backup pertama sudah diproses.\n' +
                    '⏱️ Backup berikutnya: setiap 24 jam.\n' +
                    '🌐 Zona waktu: WIB (Asia/Jakarta)'
            },
            { quoted: m }
        )

        return
    }

    // ========================================
    // AUTO BACKUP OFF
    // ========================================

    if (setting === 'off') {

        global.db.data.settings.autoBackupSC = false

        await conn.sendMessage(
            m.chat,
            {
                text:
                    '❌ *Auto Backup SC Dimatikan*\n\n' +
                    'Backup otomatis tidak akan dijalankan lagi.'
            },
            { quoted: m }
        )

        return
    }

    throw '❌ Parameter harus on/off'
}

// ========================================
// SCHEDULER AUTO BACKUP
// ========================================
//
// Mengecek setiap 1 menit.
// Jika sudah lewat 24 jam dari backup terakhir,
// backup otomatis dijalankan.
//

setInterval(async () => {

    try {

        // Cek koneksi
        if (!global.conn) return

        // Pastikan database tersedia
        global.db = global.db || {}
        global.db.data = global.db.data || {}
        global.db.data.settings =
            global.db.data.settings || {}

        const settings = global.db.data.settings

        // Auto backup harus aktif
        if (!settings.autoBackupSC) return

        // Jangan menjalankan backup ketika masih proses
        if (backupRunning) return

        const lastBackup =
            settings.lastBackupSC || 0

        const now = Date.now()

        // ========================================
        // 24 JAM
        // ========================================

        const DAY = 24 * 60 * 60 * 1000

        if (now - lastBackup >= DAY) {

            console.log(
                '[AUTO BACKUP] Waktu backup otomatis telah tiba.'
            )

            await performBackup(global.conn)
        }

    } catch (err) {

        console.error(
            '[AUTO BACKUP] Scheduler error:',
            err
        )

    }

}, 60 * 1000)

// ========================================
// HANDLER CONFIG
// ========================================

handler.help = [
    'autobackupsc on',
    'autobackupsc off'
]

handler.tags = ['owner']

handler.command = /^autobackupsc$/i

handler.owner = true

export default handler