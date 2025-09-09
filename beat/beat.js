/**
 * BEAT - Behavioral Event Analytics Transform
 * Copyright (c) 2025 Aidgn
 * AGPL-3.0-or-later - See LICENSE file for details
 * 
 * A domain-specific language that serializes 3D behavioral data (time, action, depth)
 * into linear sequences. It compresses complex user journeys into single-line strings
 * that both humans and AI can read and understand without parsing overhead. Where
 * traditional data formats place individual notes as dots on a page, BEAT connects
 * those dots into one flowing melody. While serving as Rhythm's core data format,
 * it maintains the versatility to work with other systems.
 */

const BEAT = {
	TIC: 100,	// Time (default: 100ms)
	TOK: {		// Actions (examples: P:@, E:#, T:> A:& L:+ ) // Free variations possible, but cookie-safe strings without encoding recommended
		P: '!',			// Page
		E: '*',			// Element
		T: '~',			// Time
		A: '.',			// Again
		L: '.'			// Loop
	},
	MAP: {				// Manual mapping (default: automatic)
		P: {					// Page URL paths
			'/': 'home', 		// Homepage reserved word (result: !home)
			'/english/': 'en' 	// Multilingual path example (result: !en)
		},
		E: {					// Element id or class selectors
			'#close-button': 'close',	// Close button example (result: *close)
			'.open-modal': 'm'			// Modal button example (result: *m)
		}
	}
};

class Beat { // Behavioral Event Analytics Transform
	constructor(config = {}) {
		this.config = { timeUnit: BEAT.TIC, ...config };
		this.sequence = [];
		this.hashTable = {};
		this.mappings = { pages: { ...BEAT.MAP.P }, elements: { ...BEAT.MAP.E } };
		this.lastTime = Date.now();
		this.lastElement = null;

		// this.scrolling = false; // Scroll recording // uncomment to enable
		// document.addEventListener('scroll', () => (!this.scrolling && this.scroll(), clearTimeout(this.s), this.s = setTimeout(() => this.scrolling = false, 150)), {capture: true, passive: true});

	}
	time() { // Record elapsed time
		const now = Date.now(), elapsed = Math.floor((now - this.lastTime) / this.config.timeUnit);
		if (elapsed > 0) {
			this.sequence.push(BEAT.TOK.T + elapsed);
			this.lastTime = now;
		}
	}
	page(p) { // Generate and record page hash
		this.time();
		if (this.mappings.pages[p]) return void this.sequence.push(BEAT.TOK.P + this.mappings.pages[p]); // Pre-mapped pages applied immediately
		let hash = 5381; // DJB2 hash algorithm
		for (let i = 0; i < p.length; i++) hash = ((hash << 5) + hash) + p.charCodeAt(i);
		const chars = '0123456789abcdefghijklmnopqrstuvwxyz', limit = p.length <= 7 ? 3 : p.length <= 14 ? 4 : 5; // Dynamic hash by URL length
		let result = '', n = Math.abs(hash);
		for (let i = 0; i < limit; i++) result += chars[n % 36], n = Math.floor(n / 36); // Base36 encoding
		let token = BEAT.TOK.P + result, dots = ''; // Hash collision handling: add dots(.) in front to ensure uniqueness
		while (this.hashTable[token] && this.hashTable[token] !== p) dots += BEAT.TOK.L, token = BEAT.TOK.P + dots + result;
		this.hashTable[token] = p;
		this.sequence.push(token);
	}

	/*
	scroll() { // Scroll recording // uncomment to enable
		if (!this.scrolling) {
			this.time();
			this.sequence.push('^' + Math.round(window.scrollY)); // Scroll start position px recording option (example: ^450)
			this.scrolling = true;
		}
	}
	*/

	note(n) { // Compress repetitive elements
		const len = this.sequence.length;
		if (len > 1 && this.sequence[len - 1].startsWith(BEAT.TOK.T)) { // Time-based compression
			const t = this.sequence[len - 1].substring(1), prev = this.sequence[len - 2];
			if (prev.endsWith(n)) {
				this.sequence[len - 2] = prev.substring(0, prev.length - n.length) + BEAT.TOK.A + t + n;
				this.sequence.pop(); // Remove time token
				this.lastElement = n;
				return;
			}
		}
		this.sequence.push(n);
		this.lastElement = n;
	}
	element(e) { // Record element clicks - list DOM depth as 3D linear string
		if (!e || e.nodeType === 3 && !(e = e.parentElement)) return;
		this.time();
		const key = e.id ? '#' + e.id : typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : null;
		if (key && this.mappings.elements[key]) return void this.note(BEAT.TOK.E + this.mappings.elements[key]); // Pre-mapped elements applied immediately
		let depth = 0, el = e; // Calculate DOM depth
		while (el && el !== document.body) depth++, el = el.parentElement;
		const tag = e.tagName.toLowerCase();
		let index = 1, prev = e.previousElementSibling;
		while (prev) prev.tagName.toLowerCase() === tag && index++, prev = prev.previousElementSibling;
		this.note(BEAT.TOK.E + depth + tag + index);
	}
	flow() { return this.sequence.join(''); } // Generate final BEAT string
}
