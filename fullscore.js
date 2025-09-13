/**
 * Full Score - Web's Native Analytics
 * Copyright (c) 2025 Aidgn
 * GPL-3.0-or-later - See LICENSE file for details
 *
 * Inside a piano lie over 230 strings. Strike one, and others with the same
 * frequency resonate naturally. This is sympathetic resonance.
 * 
 * Web cookies resonate too. With every page request, cookies travel automatically
 * in HTTP headers. No code needed, no instructions required - this resonance has
 * existed since 1994. While traditional analytics ignored this natural phenomenon
 * to build complex synthesizers, Full Score simply tunes the resonance.
 * 
 * Tempo aligns the beat of touches and clicks. Rhythm records behavior in the
 * browser. Beat encodes it all into musical notation. The resulting rhythm
 * resonates through cookies, and Edge interprets it instantly.
 * 
 * Data isn't collected - it's music already playing in the air, waiting to be heard.
 * 
 * Everything is contained within this small Full Score.
 * Will you join the performance?
 */

const RHYTHM = { // Real-time Hybrid Traffic History Monitor
	PIN: [				// Session endpoint (default: '/rhythm/ping')
		'/rhythm/ping',	// Edge can access cookies directly without webhooks - completely safe, no exposure
		// 'https://n8n.yourdomain.com/webhook/yourcode' // Secondary: Webhook endpoint (optional fallback)
		// ⚠️ CAUTION: Webhook URLs are public. Configure IP whitelist on webhook service
		// 💡 RECOMMENDED: Use reverse proxy (nginx/caddy) or internal API for better security
	],
	HIT: '/rhythm',		// Session activation and Edge transmission (default: '/rhythm') // Path isolation enhances Edge network
	TAP: 3,				// Session refresh cycle (default: 3 clicks)
	THR: 30,			// Session refresh throttle (default: 30ms)
	AGE: 259200,		// Session retention period (default: 3 days)
	MAX: 6,				// Maximum session count (default: 6)
	CAP: 3500,			// Maximum session capacity (default: 3500 bytes)
	ACT: 600,			// Session recovery time (default: 10 minutes) // Session recovery on reconnection after abnormal termination
	DEL: 0,				// Session deletion criteria (default: 0 clicks) // Below threshold not transmitted, 0 clicks means unlimited transmission
	DEF: '/404',		// Bot blocking path (default: /404 page) - Path isolation between Edge and cookies temporarily prevents escape
	REF: {				// Referrer mapping (0=direct, 1=internal, 2=unknown, 3-255=specific domains)
		'google.com': 3,
		'youtube.com': 4,
		'cloudflare.com': 5,
		'claude.ai': 6,
		'chatgpt.com': 7,
		'meta.com': 8,
	},
	ADD: { 		// Addon features
		TAB: true,		// BEAT Tab switch tracking addon (default: true)
		SCR: false,		// BEAT Scroll position tracking addon (default: false)
		SPA: false,		// Single Page Application addon (default: false)
	}
};

const BEAT = { 	// Behavioral Event Analytics Transform
	TIC: 100,	// Time (default: 100ms)
	TOK: {		// Actions (examples: P:@, E:#, T:> A:& L:+ ) // Free variations possible, but cookie-safe strings without encoding recommended
		P: '!',			// Page
		E: '*',			// Element
		T: '~',			// Time
		A: '.',			// Again
		L: '.',			// Loop
	},
	MAP: {				// Manual mapping (default: automatic)
		P: {					// Page URL paths
			'/': 'home', 		// Homepage reserved word (result: !home)
			'/english/': 'en', 	// Multilingual path example (result: !en)
		},
		E: {					// Element id or class selectors
			'#close-button': 'close',	// Close button example (result: *close)
			'.open-modal': 'm',			// Modal button example (result: *m)
		}
	}
};

function tempo(rhythm) { // Touch Event Maestro Performance Optimizer
	if (document.tempo) return;
	document.tempo = true;
	if ("ontouchstart" in window || navigator.maxTouchPoints > 0) { // Mobile environment detection
		const pending = new Set(); // Track pending native click blockers
		let moved = false;
		document.addEventListener("touchstart", () => {
		    moved = false; for (const b of pending) document.removeEventListener("click", b, true); pending.clear(); // Reset moved
		}, {capture: true, passive: true});
		document.addEventListener("touchmove", () => moved = true, {capture: true, passive: true}); // Mark as moved
		document.addEventListener("touchcancel", () => moved = true, {capture: true, passive: true}); // Mark as cancelled
		document.addEventListener("touchend", (e) => {
			if (moved || !e.changedTouches?.[0]) return; // Skip if moved or no touch
			let once = true;
			const block = (ev) => { // Block native click once
				if (once && ev.isTrusted) {
					ev.preventDefault();
					ev.stopImmediatePropagation();
					once = false;
					document.removeEventListener("click", block, true);
					pending.delete(block);
				}
			};
			pending.add(block);
			document.addEventListener("click", block, {capture: true}); // Register blocker
			let t = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY); // Get target at touch point
			const label = t?.closest('label');
			t = label?.control || label?.querySelector('input,textarea,select,button') || t; // Label to control redirect
			rhythm && (t = rhythm.click(t, e)); // Rhythm integration, null blocks click
			if (t) for (let i = 0; i < 8; i++) { // Find clickable parent, max 8 levels
				if (typeof t.click === "function") {t.click(); break;} // Native click method
				if (t.onclick) {t.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true})); break;} // Onclick handler
				if (!(t = t.parentElement)) break; // Move to parent or exit
			}
		}, {capture: true, passive: true});
	} else if (rhythm) { // Desktop environment detection
		let used = false; // Gesture already used
		document.addEventListener("mousedown", () => used = false, {capture: true}); // Reset on mouse down
		document.addEventListener("keydown", e => !e.repeat && (e.key === "Enter" || e.key === " ") && (used = false), {capture: true}); // Reset on Enter/Space
		document.addEventListener("click", e => {
			if (used) return; // Skip if already used
			used = true, rhythm.click(e.target.closest('label')?.control || e.target, e); // Process once, label to control redirect
		}, {capture: true});
	}
}
// tempo(); // Uncomment for standalone use
class Beat { // Behavioral Event Analytics Transform
	constructor(config = {}) {
		this.config = { timeUnit: BEAT.TIC, ...config };
		this.sequence = [];
		this.hashTable = {};
		this.mappings = { pages: { ...BEAT.MAP.P }, elements: { ...BEAT.MAP.E } };
		this.lastTime = Date.now();
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
		for (let j = 0; j < limit; j++) result += chars[n % 36], n = Math.floor(n / 36); // Base36 encoding
		let token = BEAT.TOK.P + result, dots = ''; // Hash collision handling: add dots(.) in front to ensure uniqueness
		while (this.hashTable[token] && this.hashTable[token] !== p) dots += BEAT.TOK.L, token = BEAT.TOK.P + dots + result;
		this.hashTable[token] = p;
		this.sequence.push(token);
	}
	note(n) { // Compress repetitive elements
		const len = this.sequence.length;
		if (len > 1 && this.sequence[len - 1].startsWith(BEAT.TOK.T)) { // Time-based compression
			const t = this.sequence[len - 1].substring(1), prev = this.sequence[len - 2];
			if (prev.endsWith(n)) {
				this.sequence[len - 2] = prev.substring(0, prev.length - n.length) + BEAT.TOK.A + t + n;
				this.sequence.pop(); // Remove time token
				return;
			}
		}
		this.sequence.push(n);
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

class Rhythm {
	get(g) { // Get cookie or localStorage value
		const c = '; ' + document.cookie; // Prepend '; ' to handle first cookie edge case - ensures consistent split pattern
		const p = c.split('; ' + g + '=');
		if (p.length === 2) return p[1].split(';')[0];
		if (RHYTHM.HIT !== '/') try { return localStorage.getItem(g); } catch { return null; } // Path-based fallback
		return null;
	}
	clean(force = false) { // Delete ping=1 sessions + force reset
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			const name = 'rhythm_' + i;
			const raw = this.get(name);
			if (raw && raw[0] === '1') {
				document.cookie = name + '=; Max-Age=0; Path=' + RHYTHM.HIT + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') try { localStorage.removeItem(name); } catch {} // Remove session backup
			}
		}
		if (force) {
			try { localStorage.setItem('rhythm_reset', Date.now()); } catch {} // Broadcast to other tabs
			this.data = null; // Standby mode
			sessionStorage.removeItem('session');
		}
	}
	batch(force = false) { // Convert all sessions ping 0→1 and permit Edge transmission
		const batch = [];
		let localCleaned = false;
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			const name = 'rhythm_' + i;
			const raw = this.get(name);
			if (raw && raw[0] === '0') {
				const parts = raw.split('_'); // Keep session ping=0 if detected as abnormal termination pattern within RHYTHM.ACT time
				if (!force) {
					if (Math.floor(Date.now() / 1000) - (+parts[5] + +parts[6]) <= RHYTHM.ACT) return; // ACT window check // preserve sessions that may still reconnect
				}
				if (!localCleaned) { // Remove localStorage for all sessions if detected as abnormal termination pattern
					try { for (let j = localStorage.length - 1; j >= 0; j--) { 
						const k = localStorage.key(j); 
						if (k?.startsWith('t')) try { localStorage.removeItem(k); } catch {} // Clean tab marker
					}} catch {} // Prevent localStorage access failures
					localCleaned = true;
				}
				const copy = '1' + raw.substring(1);
				document.cookie = name + '=' + copy + '; Path=' + RHYTHM.HIT + this.cookieAttrs; // Normal termination changes ping=1
				if (RHYTHM.HIT !== '/') {
					try {
						localStorage.setItem(name, copy); // Try localStorage update
						if (this.rootFallback) document.cookie = name + '=' + copy + '; Path=/' + this.cookieAttrs; // Sync root if needed
					} catch {
						this.rootFallback = true; // Activate fallback
						document.cookie = name + '=' + copy + '; Path=/' + this.cookieAttrs; // Root fallback
					}
				}
				batch.push(copy);
			}
		}
		if (!batch.length) return; // Abort if no sessions to send
		const payload = batch.join('\n');
		for (const pin of RHYTHM.PIN) { // Send to all configured endpoints
			const url = new URL(pin, location.origin).href; // Relative path gets current origin, absolute URL stays as-is
			const sent = navigator.sendBeacon && navigator.sendBeacon(url, payload); // sendBeacon returns boolean
			if (!sent) fetch(url, {method: 'POST', body: payload, keepalive: true}).catch(() => {}); // Immediate fallback if sendBeacon fails
		}
		this.clean(force); // Completely delete transmitted ping=1 sessions
	}
	save() { // Save data with automatic fallback
		if (RHYTHM.ADD?.TAB && this.hasBeat && this.beat && (this.data.clicks + this.data.scrolls > 0)) { // Tab switch tracking
			let prevName = '', prevActivity = -1; // Find most recently active tab
			for (let i = 1; i <= RHYTHM.MAX; i++) {
				const name = 'rhythm_' + i;
				if (name === this.data.name) continue; // Skip current tab
				const raw = this.get(name);
				if (raw?.[0] === '0') {
					const parts = raw.split('_');
					const activity = +parts[5] + +parts[6]; // Start time + duration
					if (activity > prevActivity) prevName = name, prevActivity = activity;
				}
			}
			if (prevName) {
				const prevRaw = this.get(prevName);
				const marker = '___' + this.data.name.slice(7);
				if (!prevRaw.endsWith(marker)) { // Prevent duplicate markers
					const newSave = prevRaw + marker; // Append to BEAT field
					if (newSave.length <= RHYTHM.CAP) {
						document.cookie = prevName + '=' + newSave + '; Path=' + RHYTHM.HIT + this.cookieAttrs;
						if (RHYTHM.HIT !== '/') try { localStorage.setItem(prevName, newSave); } catch {}
						try { localStorage.setItem('rhythm_sync_' + prevName, Date.now()); } catch {} // Tab sync signal
					}
				}
			}
		}
		const save = [0, 0, 0, this.data.device, this.data.referrer, this.data.time, Math.floor(Date.now() / 1000) - this.data.time, this.data.clicks, this.data.scrolls, this.beat?.flow() || ''].join('_'); // Build session string
		document.cookie = this.data.name + '=' + save + '; Path=' + RHYTHM.HIT + this.cookieAttrs;
		if (RHYTHM.HIT !== '/') { // Path isolation backup
			try {
				localStorage.setItem(this.data.name, save);
				if (this.rootFallback) document.cookie = this.data.name + '=' + save + '; Path=/' + this.cookieAttrs;
			} catch {
				this.rootFallback = true; // Activate fallback mode
				document.cookie = this.data.name + '=' + save + '; Path=/' + this.cookieAttrs;
			}
		}
		if (save.length > RHYTHM.CAP) return void this.session(true); // Rotate session if capacity exceeded
	}
	session(force = false) { // Session management
		const storage = typeof sessionStorage !== 'undefined';
		if (!force && storage) { // Page restoration using session storage
			const stored = sessionStorage.getItem('session');
			if (stored) {
				const raw = this.get(stored);
				if (raw && raw[0] === '0') { // Start script restoration if ping=0 session
					const parts = raw.split('_');
					const beatStr = parts.slice(9).join('_'); // Safe BEAT restoration
					this.data = { // Convert string to object
						name: stored,
						time: +parts[5],
						device: +parts[3],
						referrer: +parts[4],
						clicks: +parts[7],
						scrolls: +parts[8]
					};
					if (this.hasBeat) {
						this.beat = new Beat();
						if (beatStr) {
							this.beat.sequence = [beatStr];
							this.beat.lastTime = Date.now(); // Initialize timing
						}
						this.beat.page(location.pathname); // Add current page to BEAT
					}
					this.save(); // Save updated session
					return;
				}
				sessionStorage.removeItem('session'); // Clean invalid session
			}
		}
		let name = null; // Available session slot finder
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			if (!this.get('rhythm_' + i)) {
				name = 'rhythm_' + i;
				break;
			}
		}
		if (!name) { // If all sessions in use
			this.batch(true); // batch automatically calls clean()
			name = 'rhythm_1';
		}
		if (storage) { try { sessionStorage.setItem('session', name); } catch {} } // Save session to storage
		const ua = navigator.userAgent; // User agent for device detection
		const r = document.referrer; // Referrer URL for traffic source analysis
		let ref = !r ? 0 : r.indexOf(location.hostname) > -1 ? 1 : 2; // Calculate base referrer type
		if (r && ref === 2) {
			const domain = r.match(/\/\/([^\/]+)/)?.[1];
			if (domain) {
				for (const key in RHYTHM.REF) {
					if (domain === key || domain.endsWith('.' + key)) {
						ref = RHYTHM.REF[key];
						break;
					}
				}
			}
		}
		this.data = { // Create new session
			name: name,
			time: Math.floor(Date.now() / 1000),
			device: /mobi/i.test(ua) ? 1 : /tablet|ipad/i.test(ua) ? 2 : 0, // Device type: 0=desktop, 1=mobile, 2=tablet
			referrer: ref,
			clicks: 0,
			scrolls: 0
		};
		if (this.hasBeat) {
			this.beat = new Beat(); // Create new BEAT instance
			this.beat.page(location.pathname); // Add current page to BEAT
		}
		this.save(); // Save new session
	}
	click(el, e) { // Click action and cookie refresh // customizable considering trade-offs
		this.data || this.session();
		this.data.clicks++;
		if (this.hasBeat && this.beat) this.beat.element(el);
		this.save();
		if (this.data.clicks % RHYTHM.TAP === 0) { // Option 1: Performance type // cookie refresh rarely fails but consumes almost no network bandwidth
			const c = new AbortController();
			const refreshUrl = new URL(RHYTHM.HIT + '/?liveStreaming', location.origin);
			fetch(refreshUrl.href, {method: 'HEAD', signal: c.signal, credentials: 'include', redirect: 'manual'}).catch(() => {});
			setTimeout(() => c.abort(), RHYTHM.THR);
		}
		return el; // Block click if null returned
	}
	spa() { // SPA only
		const rhythm = this;
		const originalPush = history.pushState;
		const originalReplace = history.replaceState;
		history.pushState = function(state, title, url) { // Detect browser page navigation
			originalPush.call(history, state, title, url);
			if (rhythm.hasBeat && rhythm.beat) rhythm.beat.page(location.pathname);
			rhythm.save();
		};
		history.replaceState = function(state, title, url) { // Detect browser filter/query changes etc.
			originalReplace.call(history, state, title, url);
			if (rhythm.hasBeat && rhythm.beat) rhythm.beat.page(location.pathname);
			rhythm.save();
		};
		window.addEventListener('popstate', () => { // Detect browser forward/back buttons
			if (rhythm.hasBeat && rhythm.beat) rhythm.beat.page(location.pathname);
			rhythm.save();
		});
	}
	constructor() { // Rhythm engine start
		this.hasBeat = typeof Beat !== 'undefined';
		this.hasTempo = typeof tempo !== 'undefined';
		this.ended = false;
		this.rootFallback = false; // localStorage failure flag // once true, maintains root cookie sync for session lifetime
		window.addEventListener('storage', (e) => {
			if (e.key === 'rhythm_reset') {
				this.data = null;
				sessionStorage.removeItem('session');
				window.addEventListener('focus', () => this.session(), { once: true });
			} else if (e.key && e.key.startsWith('rhythm_sync_')) { // Targeted tab sync
				const target = e.key.slice('rhythm_sync_'.length);
				const mine = sessionStorage.getItem('session');
				if (mine !== target) return; // Not for this tab
				const raw = this.get(mine);
				if (!raw || raw[0] !== '0') return; // Invalid session
				const beatStr = raw.split('_').slice(9).join('_');
				if (this.hasBeat) {
					if (!this.beat) this.beat = new Beat();
					this.beat.sequence = beatStr ? [beatStr] : [];
					this.beat.lastTime = Date.now(); // Refresh memory from cookie
				}
			}
		});
		this.cookieAttrs = '; Max-Age=' + RHYTHM.AGE + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); // Cookie attributes reused for all writes
		for (let i = 1; i <= RHYTHM.MAX; i++) { // Check security=1 // determined by Edge and executed blocking together
			const raw = this.get('rhythm_' + i);
			if (raw && raw.split('_')[1] === '1') {
				if (location.pathname !== RHYTHM.DEF) {
					window.location.href = RHYTHM.DEF; // Send to prison
				}
				return;
			}
		}
		this.tabId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); // Unique tab identifier
		try { localStorage.setItem('t' + this.tabId, '1'); } catch {} // Tab marker for multi-tab detection
		this.clean(); // Clean normal termination sessions
		this.batch(); // Clean abnormal termination sessions
		this.session(); // Start session // create new or relocate from storage
		setInterval(() => {
		    if (this.data && Math.floor(Date.now() / 1000) - this.data.time > RHYTHM.ACT / 2) this.save(); // Session heartbeat
		}, RHYTHM.ACT / 2 * 1000);
		this.hasTempo ? tempo(this) : document.addEventListener('click', e => this.click(e.target, e), { capture: true }); // Tempo integration
		this.scrolling = false; // Debounce to count once per scroll gesture
		const scroll = () => {
			this.data || this.session();
			if (!this.scrolling) this.scrolling = true, this.data.scrolls++, this.save(); // Count and save immediately
			clearTimeout(this.s), this.s = setTimeout(() => {
				this.hasBeat && this.beat && RHYTHM.ADD?.SCR && (this.beat.time(), this.beat.sequence.push('^' + Math.round(window.scrollY))); // Record final scroll position
				this.scrolling = false; // Reset after 150ms
			}, 150);
		};
		document.addEventListener('scroll', scroll, { capture: true, passive: true });
		this.hasBeat && RHYTHM.ADD?.SPA && this.spa(); // Single Page Application addon
		const end = () => { // Rhythm engine stop
			if (this.ended) return; // Prevent multiple executions
			this.ended = true;
			if (RHYTHM.DEL && this.data && this.data.clicks < RHYTHM.DEL) { // Discard sessions below threshold
				document.cookie = this.data.name + '=; Max-Age=0; Path=' + RHYTHM.HIT + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') {
					document.cookie = this.data.name + '=; Max-Age=0; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
					try { localStorage.removeItem(this.data.name); } catch {}
				}
				try { localStorage.removeItem('t' + this.tabId); } catch {} // Clean tab marker
				return;
			}
			try { localStorage.removeItem('t' + this.tabId); } catch {} // Remove my tab marker
			let hasOthers = false; // Check for other tabs
			try {
				for (let i = 0; i < localStorage.length; i++) {
					const k = localStorage.key(i);
					if (k && k.startsWith('t')) { hasOthers = true; break; }
				}
			} catch {
				this.batch(true); // Storage access failed, send immediately
				return;
			}
			if (!hasOthers) { this.batch(true); return; } // Last tab confirmed, send all sessions
			try { if (sessionStorage.getItem('session') === this.data?.name) return; } catch {} // Skip if navigation
			const elect = (retry = 2) => { // Election process with retry mechanism
				try {
					for (let j = 0; j < localStorage.length; j++) {
						const k = localStorage.key(j);
						if (k?.startsWith('t')) { // Other tab found
							if (retry > 0) setTimeout(() => elect(retry - 1), 120); // Retry after delay
							return;
						}
					}
				} catch {
					this.batch(true); // Storage access failed, send immediately
					return;
				}
				this.batch(true); // Last tab confirmed, send all sessions
			};
			elect(); // Start election process
		};
		window.addEventListener('beforeunload', end); // Capture tab/window close
		window.addEventListener('pagehide', e => { if (!e.persisted) end(); }); // Fallback for mobile browsers
	}
}

if (document.readyState !== 'loading') new Rhythm();
else document.addEventListener('DOMContentLoaded', () => new Rhythm()); // Cue the performance
