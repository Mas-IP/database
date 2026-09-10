//create code Wonge-bot

import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'animex.json');

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Persiapan Database
    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }

    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // 2. Command List
    if (command === 'animexlist') {
        let keys = Object.keys(db);
        if (keys.length === 0) return m.reply("Database masih kosong.");
        let list = keys.map((key, i) => `${i + 1}. *${key.toUpperCase()}*\n   Season: ${db[key].season} | Ep: ${db[key].ep}`).join('\n\n');
        return m.reply(`📺 *Daftar Anime Terdata:*\n\n${list}`);
    }

    if (!text) return m.reply(`*Format:* ${usedPrefix + command} Judul >Season >Episode\n\n*Contoh:* .animex Judul Anime >1 >12\n*Cek:* .animex Judul Anime`);

    // 3. Logic: Simpan atau Cari
    let parts = text.split('>');
    
    // Mode Simpan (Jika ada format >S >E)
    if (parts.length >= 3) {
        let judul = parts[0].trim().toLowerCase();
        let season = parts[1].trim();
        let episode = parts[2].trim();

        db[judul] = { season, ep: episode };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        await m.reply(`✅ Berhasil dicatat!\n\n*${judul.toUpperCase()}*\nSeason: ${season}\nEpisode: ${episode}`);
    } 
    // Mode Cari (Cek Database)
    else {
        let query = text.trim().toLowerCase();
        
        // A. Cek kecocokan tepat (Exact match)
        if (db[query]) {
            let data = db[query];
            return m.reply(`📺 *Data Anime*\n\n*Judul:* ${query.toUpperCase()}\n*Season:* ${data.season}\n*Episode:* ${data.ep}`);
        }

        // B. Cek berdasarkan potongan judul (Partial Match)
        let keys = Object.keys(db);
        let foundKey = keys.find(k => k.includes(query) || query.includes(k));

        if (foundKey) {
            let data = db[foundKey];
            return m.reply(`✅ Anime ditemukan:\n\n*Judul:* ${foundKey.toUpperCase()}\n*Season:* ${data.season}\n*Episode:* ${data.ep}`);
        }

        // C. Jika tetap tidak ketemu, berikan saran (Levenshtein)
        let suggestion = keys.sort((a, b) => similarity(b, query) - similarity(a, query))[0];
        if (suggestion && similarity(suggestion, query) > 0.3) {
            return m.reply(`Anime "${query}" tidak ditemukan. Apakah maksud Anda: *${suggestion.toUpperCase()}*?`);
        } else {
            return m.reply(`Anime "${query}" tidak ditemukan di database.`);
        }
    }
};

// Fungsi Levenshtein Distance (Diperlukan jika partial match gagal)
const similarity = (s1, s2) => {
    let longer = s1, shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    let longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
};

handler.help = ['animex', 'animexlist'];
handler.tags = ['tools'];
handler.command = ['animex', 'animexlist'];
handler.owner = true; 

export default handler;