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
		this.score = [];
		this.table = {};
		this.maps = { pages: { ...BEAT.MAP.P }, elements: { ...BEAT.MAP.E } };
		this.tick = Date.now();
	}
	time() { // Record elapsed time
		const now = Date.now(), elapsed = Math.floor((now - this.tick) / this.config.timeUnit);
		if (elapsed > 0) {
			this.score.push(BEAT.TOK.T + elapsed);
			this.tick = now;
		}
	}
	page(p) { // Generate and record page hash
		this.time();
		if (this.maps.pages[p]) return void this.score.push(BEAT.TOK.P + this.maps.pages[p]); // Pre-mapped pages applied immediately
		let hash = 5381; // DJB2 hash algorithm
		for (let i = 0; i < p.length; i++) hash = ((hash << 5) + hash) + p.charCodeAt(i);
		const chars = '0123456789abcdefghijklmnopqrstuvwxyz', limit = p.length <= 7 ? 3 : p.length <= 14 ? 4 : 5; // Dynamic hash by URL length
		let result = '', n = Math.abs(hash);
		for (let j = 0; j < limit; j++) result += chars[n % 36], n = Math.floor(n / 36); // Base36 encoding
		let token = BEAT.TOK.P + result, dots = ''; // Hash collision handling: add dots(.) in front to ensure uniqueness
		while (this.table[token] && this.table[token] !== p) dots += BEAT.TOK.L, token = BEAT.TOK.P + dots + result;
		this.table[token] = p;
		this.score.push(token);
	}
	note(n) { // Compress repetitive elements
		const len = this.score.length;
		if (len > 1 && this.score[len - 1].startsWith(BEAT.TOK.T)) { // Time-based compression
			const t = this.score[len - 1].substring(1), prev = this.score[len - 2];
			if (prev.endsWith(n)) {
				this.score[len - 2] = prev.substring(0, prev.length - n.length) + BEAT.TOK.A + t + n;
				this.score.pop(); // Remove time token
				return;
			}
		}
		this.score.push(n);
	}
	element(e) { // Record element clicks // list DOM depth as 3D linear string
		if (!e || e.nodeType === 3 && !(e = e.parentElement)) return;
		this.time();
		const key = e.id ? '#' + e.id : typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : null;
		if (key && this.maps.elements[key]) return void this.note(BEAT.TOK.E + this.maps.elements[key]); // Pre-mapped elements applied immediately
		let depth = 0, el = e; // Calculate DOM depth
		while (el && el !== document.body) depth++, el = el.parentElement;
		const tag = e.tagName.toLowerCase();
		let index = 1, prev = e.previousElementSibling;
		while (prev) prev.tagName.toLowerCase() === tag && index++, prev = prev.previousElementSibling;
		this.note(BEAT.TOK.E + depth + tag + index);
	}
	flow() { return this.score.join(''); } // Generate final BEAT string
}

class Rhythm {
	get(g) { // Get cookie or localStorage value
		const cookie = '; ' + document.cookie; // Prepend '; ' to handle first cookie edge case - ensures consistent split pattern
		const parts = cookie.split('; ' + g + '=');
		if (parts.length === 2) return parts[1].split(';')[0];
		if (RHYTHM.HIT !== '/') try { return localStorage.getItem(g); } catch { return null; } // localStorage fallback for path isolation
		return null;
	}
	clean(force = false) { // Delete ping=1 sessions + force reset
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			const name = 'rhythm_' + i;
			const ses = this.get(name);
			if (ses && ses[0] === '1') {
				document.cookie = name + '=; Max-Age=0; Path=' + RHYTHM.HIT + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') try { localStorage.removeItem(name); } catch {} // Remove localStorage backup
			}
		}
		if (force) {
			try { 
				localStorage.removeItem('rhythm_lock'); // Remove abnormal termination cleanup lock
				localStorage.setItem('rhythm_reset', Date.now()); // Remove old reset signal and broadcast new one to other tabs
			} catch {}
			this.data = null; // Standby mode
			sessionStorage.removeItem('session'); // Remove sessionStorage for force reset
		}
	}
	batch(force = false) { // Send expired ping=0 sessions as ping=1 beyond ACT time
		const batch = [];
		let once = false;
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			const name = 'rhythm_' + i;
			const ses = this.get(name);
			if (ses && ses[0] === '0') {
				const parts = ses.split('_'); // Keep session ping=0 if detected as abnormal termination pattern within RHYTHM.ACT time
				if (!force) {
					if (Math.floor(Date.now() / 1000) - (+parts[5] + +parts[6]) <= RHYTHM.ACT) { // Session within ACT recovery window
						if (!localStorage.getItem('rhythm_lock')) { // Multiple sessions cleanup with once-only execution lock
							let cnt = 0;
							for (let x = 1; x <= RHYTHM.MAX && cnt <= 1; x++) cnt += this.get('rhythm_' + x) ? 1 : 0;
							if (cnt > 1) try { for (let j = localStorage.length - 1; j >= 0; j--) { const k = localStorage.key(j); if (k?.startsWith('t') && k !== 't' + this.tabId) localStorage.removeItem(k); } localStorage.setItem('rhythm_lock', Date.now()); } catch {}
						}
						return; // Preserve sessions that may still reconnect within ACT window
					}
				}
				if (!once) { // Batch cleaner flag per function call
					try { for (let j = localStorage.length - 1; j >= 0; j--) { const k = localStorage.key(j); if (k?.startsWith('t')) try { localStorage.removeItem(k); } catch {} } } catch {} // Prevent localStorage access failures
					once = true;
				}
				const copy = '1' + ses.substring(1);
				document.cookie = name + '=' + copy + '; Path=' + RHYTHM.HIT + this.cookieAttrs; // Normal termination changes ping=1
				if (RHYTHM.HIT !== '/') {
					try {
						localStorage.setItem(name, copy); // Update localStorage backup
						if (this.fallback) document.cookie = name + '=' + copy + '; Path=/' + this.cookieAttrs; // Sync root if needed
					} catch {
						this.fallback = true; // Activate fallback
						document.cookie = name + '=' + copy + '; Path=/' + this.cookieAttrs; // Root fallback
					}
				}
				batch.push(copy);
			}
		}
		if (!batch.length) return; // Abort if no sessions to send
		const payload = batch.join('\n');
		for (const pin of RHYTHM.PIN) { // Send to all configured endpoints
			const url = pin[0] === '/' ? location.origin + pin : pin; // Relative path gets current origin, absolute URL stays as-is
			const sent = navigator.sendBeacon && navigator.sendBeacon(url, payload); // sendBeacon returns boolean
			if (!sent) fetch(url, {method: 'POST', body: payload, keepalive: true}).catch(() => {}); // Immediate fallback if sendBeacon fails
		}
		this.clean(force); // Completely delete transmitted ping=1 sessions
	}
	save() { // Save data with automatic fallback
		if (RHYTHM.ADD?.TAB && this.hasBeat && this.beat && (this.data.clicks + this.data.scrolls > 0)) { // BEAT Tab switch tracking addon (default: true)
			let prevName = '', prevAct = -1; // Find most recently active tab
			for (let i = 1; i <= RHYTHM.MAX; i++) {
				const name = 'rhythm_' + i;
				if (name === this.data.name) continue; // Skip current tab
				const ses = this.get(name);
				if (ses?.[0] === '0') {
					const parts = ses.split('_');
					const act = +parts[5] + +parts[6]; // Start time + duration
					if (act > prevAct) prevName = name, prevAct = act;
				}
			}
			if (prevName) {
				const prevSes = this.get(prevName);
				const marker = '___' + this.data.name.slice(7);
				if (prevSes && !prevSes.endsWith(marker)) { // Prevent duplicate markers
					const newSave = prevSes + marker; // Append to BEAT field
					if (newSave.length <= RHYTHM.CAP) {
						document.cookie = prevName + '=' + newSave + '; Path=' + RHYTHM.HIT + this.cookieAttrs;
						if (RHYTHM.HIT !== '/') try { localStorage.setItem(prevName, newSave); } catch {} // Update localStorage backup
						try { localStorage.setItem('rhythm_sync_' + prevName, Date.now()); } catch {} // Tab sync signal
					}
				}
			}
		}
		const save = [0, 0, 0, this.data.device, this.data.referrer, this.data.time, Math.floor(Date.now() / 1000) - this.data.time, this.data.clicks, this.data.scrolls, this.beat?.flow() || ''].join('_'); // Build session string
		document.cookie = this.data.name + '=' + save + '; Path=' + RHYTHM.HIT + this.cookieAttrs;
		if (RHYTHM.HIT !== '/') { // Path isolation backup
			try {
				localStorage.setItem(this.data.name, save); // Save to localStorage backup
				if (this.fallback) document.cookie = this.data.name + '=' + save + '; Path=/' + this.cookieAttrs;
			} catch {
				this.fallback = true; // Activate fallback mode
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
				const ses = this.get(stored);
				if (ses && ses[0] === '0') { // Start script restoration if ping=0 session
					const parts = ses.split('_');
					const flow = parts.slice(9).join('_'); // Extract BEAT flow from session
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
						if (flow) {
							this.beat.score = [flow];
							this.beat.tick = Date.now(); // Initialize timing
						}
						this.beat.page(location.pathname); // Add current page to BEAT
					}
					this.save(); // Save updated session
					return;
				}
				sessionStorage.removeItem('session'); // Remove sessionStorage for invalid session
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
		if (storage) { try { sessionStorage.setItem('session', name); } catch {} } // Save to sessionStorage
		const ua = navigator.userAgent; // User agent for device detection
		const ref = document.referrer; // Referrer URL for traffic source analysis
		let index = !ref ? 0 : ref.indexOf(location.hostname) > -1 ? 1 : 2; // Calculate base referrer type
		if (ref && index === 2) {
			const domain = ref.match(/\/\/([^\/]+)/)?.[1];
			if (domain) {
				for (const key in RHYTHM.REF) {
					if (domain === key || domain.endsWith('.' + key)) {
						index = RHYTHM.REF[key];
						break;
					}
				}
			}
		}
		this.data = { // Create new session
			name: name,
			time: Math.floor(Date.now() / 1000),
			device: /mobi/i.test(ua) ? 1 : /tablet|ipad/i.test(ua) ? 2 : 0, // Device type: 0=desktop, 1=mobile, 2=tablet
			referrer: index,
			clicks: 0,
			scrolls: 0
		};
		if (this.hasBeat) {
			this.beat = new Beat(); // Create new BEAT instance
			this.beat.page(location.pathname);
		}
		this.save(); // Save new session
	}
	click(el, e) { // Click action and cookie refresh // See README for customization options
		this.data || this.session();
		this.data.clicks++;
		if (this.hasBeat && this.beat) this.beat.element(el);
		this.save();
		if (this.data.clicks % RHYTHM.TAP === 0) { // Option 1: Performance type // cookie refresh rarely fails but consumes almost no network bandwidth
			const ctrl = new AbortController();
			fetch(location.origin + (RHYTHM.HIT === '/' ? '' : RHYTHM.HIT) + '/?liveStreaming', 
				{method: 'HEAD', signal: ctrl.signal, credentials: 'include', redirect: 'manual'}).catch(() => {});
			setTimeout(() => ctrl.abort(), RHYTHM.THR);
		}
		return el; // Block click if null returned
	}
	spa() { // Single Page Application addon (default: false)
		const self = this;
		const push = history.pushState;
		const replace = history.replaceState;
		history.pushState = function(state, title, url) { // Detect browser page navigation
			push.call(history, state, title, url);
			if (self.hasBeat && self.beat) self.beat.page(location.pathname);
			self.save();
		};
		history.replaceState = function(state, title, url) { // Detect browser filter/query changes etc.
			replace.call(history, state, title, url);
			if (self.hasBeat && self.beat) self.beat.page(location.pathname);
			self.save();
		};
		window.addEventListener('popstate', () => { // Detect browser forward/back buttons
			if (self.hasBeat && self.beat) self.beat.page(location.pathname);
			self.save();
		});
	}
	constructor() { // Rhythm engine start
		for (let i = 1; i <= RHYTHM.MAX; i++) { // Bot blocking check set by Edge and run by both sides
			const ses = this.get('rhythm_' + i);
			if (ses && ses.split('_')[1] === '1') {
				if (location.pathname !== RHYTHM.DEF) window.location.href = RHYTHM.DEF; // Send to prison
				return;
			}
		}
		this.hasBeat = typeof Beat !== 'undefined';
		this.hasTempo = typeof tempo !== 'undefined';
		this.ended = false;
		this.fallback = false; // Root cookie mode when localStorage fails
		window.addEventListener('storage', (e) => {
			if (e.key === 'rhythm_reset') { // Force reset signal from another tab
				this.data = null;
				sessionStorage.removeItem('session'); // Remove sessionStorage for tab reset
				window.addEventListener('focus', () => this.session(), { once: true });
			} else if (e.key && e.key.startsWith('rhythm_sync_')) { // Reload BEAT flow written by another tab
				const target = e.key.slice('rhythm_sync_'.length);
				const mine = sessionStorage.getItem('session');
				if (mine !== target) return; // Not for this tab
				const ses = this.get(mine);
				if (!ses || ses[0] !== '0') return; // Invalid session
				const flow = ses.split('_').slice(9).join('_'); 
				if (this.hasBeat) {
					if (!this.beat) this.beat = new Beat();
					this.beat.score = flow ? [flow] : [];
					this.beat.tick = Date.now(); // Reset beat timing
				}
			}
		});
		this.cookieAttrs = '; Max-Age=' + RHYTHM.AGE + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); // Reusable cookie settings
		this.tabId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); // Unique tab identifier
		try { localStorage.setItem('t' + this.tabId, '1'); } catch {} // Tab marker for cleanup
		this.clean(); // Remove ping=1 sessions
		this.batch(); // Send expired ping=0 sessions as ping=1 beyond ACT time
		this.session(); // Create or restore session
		setInterval(() => {
			if (this.data && Math.floor(Date.now() / 1000) - this.data.time > RHYTHM.ACT / 2) this.save(); // Session heartbeat
		}, RHYTHM.ACT / 2 * 1000);
		this.hasTempo ? tempo(this) : document.addEventListener('click', e => this.click(e.target, e), { capture: true }); // Tempo integration
		this.scrolling = false; // Debounce to count once per scroll gesture
		const scroll = () => { // BEAT Scroll position tracking addon (default: false)
			this.data || this.session();
			if (!this.scrolling) this.scrolling = true, this.data.scrolls++, this.save(); // Count and save immediately
			clearTimeout(this.s), this.s = setTimeout(() => {
				this.hasBeat && this.beat && RHYTHM.ADD?.SCR && (this.beat.time(), this.beat.score.push('^' + Math.round(window.scrollY))); // Record final scroll position
				this.scrolling = false;
			}, 150); // Reset after 150ms
		};
		document.addEventListener('scroll', scroll, { capture: true, passive: true });
		this.hasBeat && RHYTHM.ADD?.SPA && this.spa(); // Single Page Application addon (default: false)
		const end = () => { // Rhythm engine stop
			if (this.ended) return; // Prevent multiple executions
			this.ended = true; // Set termination flag
			try { localStorage.removeItem('t' + this.tabId); } catch {} // Remove tab marker
			if (RHYTHM.DEL && this.data && this.data.clicks < RHYTHM.DEL) {
				document.cookie = this.data.name + '=; Max-Age=0; Path=' + RHYTHM.HIT + '; SameSite=Lax' + (location.protocol==='https:'?'; Secure':'');
				if (RHYTHM.HIT !== '/') { document.cookie = this.data.name + '=; Max-Age=0; Path=/; SameSite=Lax' + (location.protocol==='https:'?'; Secure':''); try { localStorage.removeItem(this.data.name); } catch {} } // Remove localStorage backup
				return;
			}
		    const elect = (retry = 2) => { // Yield to next macrotask, adjusts execution order not waiting for page load
		        try {
		            for (let i = 0; i < localStorage.length; i++) {
		                const k = localStorage.key(i);
		                if (k && k.startsWith('t')) {
		                    if (retry > 0) setTimeout(() => elect(retry - 1), 120); // 120ms re-election
		                    return;
		                }
		            }
		        } catch {}
		        this.batch(true); // Last tab confirmed
		    };
		    setTimeout(elect, 1); // Start election process
		};
		window.addEventListener('pagehide', end, { capture: true }); // All pagehide events trigger termination check
		window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && !document.hasFocus()) end(); }, { capture: true }); // Mobile protection
	}
}

if (document.readyState !== 'loading') new Rhythm();
else document.addEventListener('DOMContentLoaded', () => new Rhythm()); // Cue the performance










