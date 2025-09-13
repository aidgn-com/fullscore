/**
 * RHYTHM - Real-time Hybrid Traffic History Monitor
 * Copyright (c) 2025 Aidgn
 * GPL-3.0-or-later - See LICENSE file for details
 * 
 * A client-side engine that transforms the user's browser into an auxiliary database.
 * Unlike traditional approaches that send, store, and process data on servers,
 * it embeds core functionality directly in the browser. When connected with Edge
 * Computing, real-time analysis and immediate response happen without any backend
 * servers. Together with Beat, data transmission costs and processing delays drop
 * dramatically, forming a complete ecosystem.
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
			const url = pin[0] === '/' ? location.origin + pin : pin; // Relative path gets current origin, absolute URL stays as-is
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
			fetch(location.origin + (RHYTHM.HIT === '/' ? '' : RHYTHM.HIT) + '/?liveStreaming', 
				{method: 'HEAD', signal: c.signal, credentials: 'include', redirect: 'manual'}).catch(() => {});
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
