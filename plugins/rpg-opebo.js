//create code Wonge-bot

let handler = async (m, {
	conn
}) => {
	global.db = global.db || {}
	global.db.data = global.db.data || {}
	global.db.data.users = global.db.data.users || {}
	global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
		lastopenbo: 0,
		koin: 0,
		exp: 0,
		limit: 0
	}

	let user = global.db.data.users[m.sender]

	// ==============================
	// COOLDOWN KHUSUS OPENBO
	// ==============================

	if (typeof user.lastopenbo !== 'number') {
		user.lastopenbo = 0
	}

	const now = Date.now()
	const cooldown = 500000
	const elapsed = now - user.lastopenbo
	const remaining = cooldown - elapsed

	let timers = clockString(remaining)

	if (elapsed > cooldown) {
		let hsl = `Kamu Terbaring Lemas Karna Melakukan Skidipapap 24 Jam Tetapi Kamu Mendapatkan:
3000 Koin
1000 Exp
10 Limit
Dan Gratis Boba + Nasi Padang`

		global.db.data.users[m.sender].koin += 3000
		global.db.data.users[m.sender].exp += 1000
		global.db.data.users[m.sender].limit += 10

		let msg = await conn.reply(
			m.chat,
			`Sedang Mencari Pelanggan`,
			m
		)

		let key = msg && msg.key ? msg.key : m.key

		setTimeout(async () => {
			try {
				await conn.sendMessage(
					m.chat,
					{
						text: `Kamu Mendapatkan Pelanggan Dan Pergi Ke Hotel`,
						edit: key
					}
				)
			} catch {
				await conn.reply(
					m.chat,
					`Kamu Mendapatkan Pelanggan Dan Pergi Ke Hotel`,
					m
				)
			}
		}, 14000)

		setTimeout(async () => {
			try {
				await conn.sendMessage(
					m.chat,
					{
						text: `Kamu Mulai Melakukan Skidipapap Dengannya`,
						edit: key
					}
				)
			} catch {
				await conn.reply(
					m.chat,
					`Kamu Mulai Melakukan Skidipapap Dengannya`,
					m
				)
			}
		}, 15000)

		setTimeout(async () => {
			try {
				await conn.sendMessage(
					m.chat,
					{
						text: `Kamu Di Paksa Untuk Melayaninya 24 Jam`,
						edit: key
					}
				)
			} catch {
				await conn.reply(
					m.chat,
					`Kamu Di Paksa Untuk Melayaninya 24 Jam`,
					m
				)
			}
		}, 18000)

		setTimeout(async () => {
			try {
				await conn.sendMessage(
					m.chat,
					{
						text: hsl,
						edit: key
					}
				)
			} catch {
				await conn.reply(
					m.chat,
					hsl,
					m
				)
			}
		}, 20000)

		// ==============================
		// SIMPAN LAST TIME KHUSUS OPENBO
		// ==============================

		user.lastopenbo = Date.now()

	} else {
		conn.reply(
			m.chat,
			`*Kamu Sudah Kecapekan*\n*Silahkan Istirahat Dulu Selama* ${timers}`,
			m
		)
	}
}

handler.help = ['openbo']
handler.tags = ['rpg']
handler.command = /^(openbo)$/i
handler.group = true
handler.rpg = true
handler.premium = true

export default handler

// ==============================
// FORMAT WAKTU KHUSUS OPENBO
// ==============================

function clockString(ms) {
	let d = isNaN(ms)
		? '--'
		: Math.floor(ms / 86400000)

	let h = isNaN(ms)
		? '--'
		: Math.floor(ms / 3600000) % 24

	let m = isNaN(ms)
		? '--'
		: Math.floor(ms / 60000) % 60

	let s = isNaN(ms)
		? '--'
		: Math.floor(ms / 1000) % 60

	return [
		'\n' + d,
		' *Hari*\n ',
		h,
		' *Jam*\n ',
		m,
		' *Menit*\n ',
		s,
		' *Detik* '
	].map(function (v) {
		return v.toString().padStart(2, 0)
	}).join('')
}