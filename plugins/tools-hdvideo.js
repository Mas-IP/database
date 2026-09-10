//create code Wonge-bot

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

import uploadImage from '../lib/uploadImage.js';

const execFileAsync = promisify(execFile);

// ==================================================
// CONFIG
// ==================================================

const TMP_DIR = path.join(
    os.tmpdir(),
    'wonge-hdvideo'
);

const API_URL =
    'https://api.botcahx.eu.org/api/tools/hdvideo';


// ==================================================
// HELPER
// ==================================================

function randomName(ext = '.mp4') {
    return crypto
        .randomBytes(8)
        .toString('hex') + ext;
}


async function deleteFile(file) {
    if (!file) return;

    try {
        await fs.promises.unlink(file);
    } catch {}
}


async function runFFprobe(file) {
    const { stdout } = await execFileAsync(
        'ffprobe',
        [
            '-v',
            'error',
            '-select_streams',
            'v:0',
            '-show_entries',
            'stream=width,height',
            '-of',
            'json',
            file
        ],
        {
            maxBuffer: 1024 * 1024
        }
    );

    const data = JSON.parse(stdout);

    if (
        !data.streams ||
        !data.streams[0]
    ) {
        throw new Error(
            'FFprobe tidak menemukan video stream.'
        );
    }

    const width = Number(
        data.streams[0].width
    );

    const height = Number(
        data.streams[0].height
    );

    if (
        !width ||
        !height
    ) {
        throw new Error(
            'Ukuran video tidak valid.'
        );
    }

    return {
        width,
        height
    };
}


// ==================================================
// DOWNLOAD
// ==================================================

async function downloadVideo(url, file) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Download hasil API gagal: HTTP ${response.status}`
        );
    }

    const buffer = Buffer.from(
        await response.arrayBuffer()
    );

    if (!buffer.length) {
        throw new Error(
            'Hasil video dari API kosong.'
        );
    }

    await fs.promises.writeFile(
        file,
        buffer
    );

    return file;
}


// ==================================================
// NORMALIZE RATIO
// ==================================================

async function fixRatio(
    input,
    output,
    width,
    height
) {
    /*
     * Ukuran output dibuat sama dengan ukuran
     * video asli.
     *
     * Contoh:
     *
     * Original:
     * 1080x1920
     *
     * Output:
     * 1080x1920
     *
     * Jadi rasio:
     * 9:16
     *
     * tetap sama.
     */

    await execFileAsync(
        'ffmpeg',
        [
            '-y',

            '-i',
            input,

            // ==================================================
            // VIDEO
            // ==================================================

            '-vf',
            `scale=${width}:${height}`,

            '-c:v',
            'libx264',

            '-preset',
            'veryfast',

            '-crf',
            '18',

            '-pix_fmt',
            'yuv420p',

            // ==================================================
            // AUDIO
            // ==================================================

            '-c:a',
            'aac',

            '-b:a',
            '128k',

            // ==================================================
            // ROTATION
            // ==================================================

            '-metadata:s:v:0',
            'rotate=0',

            // ==================================================
            // MP4
            // ==================================================

            '-movflags',
            '+faststart',

            output
        ],
        {
            maxBuffer: 20 * 1024 * 1024
        }
    );

    return output;
}


// ==================================================
// HANDLER
// ==================================================

let handler = async (
    m,
    {
        conn,
        usedPrefix,
        command
    }
) => {

    const q = m.quoted
        ? m.quoted
        : m;

    const mime =
        (q.msg || q).mimetype ||
        q.mediaType ||
        '';

    // ==================================================
    // CHECK VIDEO
    // ==================================================

    if (!/^video/.test(mime)) {
        return m.reply(
            `Kirim Video dengan caption *${usedPrefix + command}* atau tag Video yang sudah dikirim.`
        );
    }

    let originalFile = null;
    let hdFile = null;
    let finalFile = null;

    try {

        // ==================================================
        // TEMP DIRECTORY
        // ==================================================

        await fs.promises.mkdir(
            TMP_DIR,
            {
                recursive: true
            }
        );

        // ==================================================
        // WAIT
        // ==================================================

        await conn.reply(
            m.chat,
            wait,
            m
        );

        // ==================================================
        // DOWNLOAD ORIGINAL
        // ==================================================

        console.log(
            '[HDVIDEO] Download video asli...'
        );

        const originalBuffer =
            await q.download();

        if (
            !originalBuffer ||
            !originalBuffer.length
        ) {
            throw new Error(
                'Video asli gagal didownload.'
            );
        }

        originalFile = path.join(
            TMP_DIR,
            randomName('.mp4')
        );

        await fs.promises.writeFile(
            originalFile,
            originalBuffer
        );

        // ==================================================
        // GET ORIGINAL SIZE
        // ==================================================

        console.log(
            '[HDVIDEO] Membaca ukuran video asli...'
        );

        const original =
            await runFFprobe(
                originalFile
            );

        console.log(
            `[HDVIDEO] Original: ${original.width}x${original.height}`
        );

        // ==================================================
        // UPLOAD
        // ==================================================

        console.log(
            '[HDVIDEO] Upload video...'
        );

        const uploadUrl =
            await uploadImage(
                originalBuffer
            );

        if (!uploadUrl) {
            throw new Error(
                'Upload video gagal.'
            );
        }

        console.log(
            '[HDVIDEO] Upload berhasil.'
        );

        // ==================================================
        // API HD
        // ==================================================

        console.log(
            '[HDVIDEO] Memproses HD...'
        );

        const apiResponse =
            await fetch(
                `${API_URL}?url=${encodeURIComponent(uploadUrl)}&apikey=${btc}`
            );

        if (!apiResponse.ok) {
            throw new Error(
                `API HD error: HTTP ${apiResponse.status}`
            );
        }

        const result =
            await apiResponse.json();

        console.log(
            '[HDVIDEO] API response:',
            result
        );

        if (
            !result ||
            !result.url
        ) {
            throw new Error(
                'API tidak memberikan URL video.'
            );
        }

        // ==================================================
        // DOWNLOAD RESULT API
        // ==================================================

        console.log(
            '[HDVIDEO] Download hasil HD...'
        );

        hdFile = path.join(
            TMP_DIR,
            randomName('.mp4')
        );

        await downloadVideo(
            result.url,
            hdFile
        );

        // ==================================================
        // FIX RATIO
        // ==================================================

        console.log(
            `[HDVIDEO] Menyamakan ukuran ke ${original.width}x${original.height}...`
        );

        finalFile = path.join(
            TMP_DIR,
            randomName('.mp4')
        );

        await fixRatio(
            hdFile,
            finalFile,
            original.width,
            original.height
        );

        // ==================================================
        // VERIFY
        // ==================================================

        const final =
            await runFFprobe(
                finalFile
            );

        console.log(
            `[HDVIDEO] Final: ${final.width}x${final.height}`
        );

        console.log(
            `[HDVIDEO] Ratio: ${original.width}:${original.height} -> ${final.width}:${final.height}`
        );

        // ==================================================
        // SEND
        // ==================================================

        console.log(
            '[HDVIDEO] Mengirim video...'
        );

        await conn.sendFile(
            m.chat,
            finalFile,
            'hdvideo.mp4',
            wm,
            m,
            false,
            {
                mimetype: 'video/mp4'
            }
        );

        console.log(
            '[HDVIDEO] Selesai.'
        );

    } catch (error) {

        console.error(
            '================================'
        );

        console.error(
            '[HDVIDEO ERROR]'
        );

        console.error(
            error
        );

        console.error(
            '================================'
        );

        await m.reply(
            `Identifikasi gagal.\n\nError: ${error.message || error}`
        );

    } finally {

        // ==================================================
        // CLEANUP
        // ==================================================

        await deleteFile(
            originalFile
        );

        await deleteFile(
            hdFile
        );

        await deleteFile(
            finalFile
        );
    }
};


// ==================================================
// HANDLER CONFIG
// ==================================================

handler.help = [
    'hdvideo',
    'hdvid'
];

handler.tags = [
    'tools'
];

handler.command = [
    'hdvideo',
    'hdvid'
];

handler.premium = false;
handler.limit = true;

export default handler;