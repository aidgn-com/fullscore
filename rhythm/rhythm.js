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
		'/rhythm/ping'	// Edge can access cookies directly without webhooks - completely safe, no exposure
		// 'https://n8n.yourdomain.com/webhook/yourcode' // Secondary: Webhook endpoint (optional fallback)
		// ⚠️ CAUTION: Webhook URLs are public. Configure IP whitelist on webhook service
		// 💡 RECOMMENDED: Use reverse proxy (nginx/caddy) or internal API for better security
	],
	HIT: '/rhythm',		// Session activation and Edge transmission (default: '/rhythm') // Path isolation enhances Edge network
	TAP: 3,				// Session refresh cycle (default: 3 clicks)
	THR: 30,			// Session refresh throttle (default: 15ms)
	AGE: 259200,		// Session retention period (default: 3 days)
	MAX: 6,				// Maximum session count (default: 6)
	CAP: 3900,			// Maximum session capacity (default: 3900 bytes)
	ACT: 600,			// Session recovery time (default: 10 minutes) // Session recovery on reconnection after abnormal termination
	DEL: 0,				// Session deletion criteria (default: 0 clicks) // Below threshold not transmitted, 0 clicks means unlimited transmission
	DEF: '/404',		// Bot blocking path (default: /404 page) - Path isolation between Edge and cookies temporarily prevents escape
	REF: {				// Referrer mapping (0=direct, 1=internal, 2=unknown, 3-255=specific domains)
		'google.com': 3,
		'youtube.com': 4,
		'cloudflare.com': 5,
		'claude.ai': 6,
		'chatgpt.com': 7,
		'meta.com': 8
	}
};

class Rhythm {
	get(g) { // Get cookie or localStorage value
		const c = '; ' + document.cookie; // Prepend for first cookie edge case
		const p = c.split('; ' + g + '=');
		if (p.length === 2) return p[1].split(';')[0];
		if (RHYTHM.HIT !== '/') return localStorage.getItem(g); // Path-based fallback
		return null;
	}
	clean(force = false) { // Delete ping=1 sessions + force reset
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			const name = 'rhythm_0' + i;
			const raw = this.get(name);
			if (raw && raw[0] === '1') {
				document.cookie = name + '=; Max-Age=0; Path=' + RHYTHM.HIT + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') localStorage.removeItem(name);
			}
		}
		if (force) {
			localStorage.setItem('rhythm_reset', Date.now()); // Broadcast to other tabs
			this.data = null; // Standby mode
			sessionStorage.removeItem('session');
		}
	}
	batch(force = false) { // Convert all sessions ping 0→1 and permit Edge transmission
		const batch = [];
		let localCleaned = false;
		for (let i = 1; i <= RHYTHM.MAX; i++) {
			const name = 'rhythm_0' + i;
			const raw = this.get(name);
			if (raw && raw[0] === '0') {
				const parts = raw.split('_'); // Keep session ping=0 if detected as abnormal termination pattern within RHYTHM.ACT time
				if (!force) {
					if (Math.floor(Date.now() / 1000) - (+parts[5] + +parts[6]) <= RHYTHM.ACT) return;
				}
				if (!localCleaned) { // Remove localStorage for all sessions if detected as abnormal termination pattern
					for (let i = localStorage.length - 1; i >= 0; i--) {
						const k = localStorage.key(i);
						if (k && k[0] === 't') localStorage.removeItem(k);
					}
					localCleaned = true;
				}
				const copy = '1' + raw.substring(1);
				document.cookie = name + '=' + copy + '; Path=' + RHYTHM.HIT + this.cookieAttrs; // Normal termination changes ping=1
				if (RHYTHM.HIT !== '/') localStorage.setItem(name, copy); // Update localStorage together
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
	save() { // Save data
		const save = [
			0, // ping
			0, // security
			0, // addon
			this.data.device,
			this.data.referrer,
			this.data.time,
			Math.floor(Date.now() / 1000) - this.data.time,
			this.data.clicks,
			this.data.scrolls,
			this.beat ? this.beat.flow() : '' // BEAT integration
		].join('_');
		document.cookie = this.data.name + '=' + save + '; Path=' + RHYTHM.HIT + this.cookieAttrs;
		if (RHYTHM.HIT !== '/') localStorage.setItem(this.data.name, save);
		
		if (save.length > RHYTHM.CAP) {
			this.session(true);
			return;
		}
	}
	session(force = false) { // Session management
		const storage = typeof sessionStorage !== 'undefined';
		if (!force && storage) { // Page restoration using session storage
			const stored = sessionStorage.getItem('session');
			if (stored) {
				const raw = this.get(stored);
				if (raw && raw[0] === '0') { // Start script restoration if ping=0 session
					const parts = raw.split('_');
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
						if (parts[9]) {
							this.beat.sequence = [parts[9]];
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
			if (!this.get('rhythm_0' + i)) {
				name = 'rhythm_0' + i;
				break;
			}
		}
		if (!name) { // If all sessions in use
			this.batch(true); // batch automatically calls clean()
			name = 'rhythm_01';
		}
		if (storage) sessionStorage.setItem('session', name); // Save session to storage
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

		/*
		if (this.data.clicks % RHYTHM.TAP === 0) { // Option 2: Balance type // cookie refresh is stable but may consume network bandwidth
			const controller = new AbortController(); // RTT automation example: wired 5ms→10ms, LTE 15ms→30ms, 3G 300ms→100ms(upper limit)
			const timeout = navigator.connection?.rtt ? Math.min(navigator.connection.rtt * 2, 100) : RHYTHM.THR; // Use default if RTT check fails
			fetch(location.origin + (RHYTHM.HIT === '/' ? '' : RHYTHM.HIT) + '/?liveStreaming', 
				{method: 'HEAD', signal: controller.signal, credentials: 'include', redirect: 'manual'}).catch(() => {});
			setTimeout(() => controller.abort(), timeout);
		}
		if (this.data.clicks % RHYTHM.TAP === 0) { // Option 3: Safe type // cookie refresh is successful but consumes network bandwidth
			fetch('/favicon.ico?ping=' + this.data.clicks, {method: 'HEAD', credentials: 'include'}).catch(() => {}); // Does not use RHYTHM.THR
		}
		if (this.data.clicks % RHYTHM.TAP === 0) { // Option 4: Power type // cookie refresh is very successful but consumes additional network bandwidth and complex setup
			navigator.sendBeacon('/.well-known/ping'); // Requires Post and return 204 settings on server, does not use RHYTHM.THR
		}
		*/

		return el; // Block click if null returned
	}

	/*
	spa() { // SPA only // uncomment when using, user customization required
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
	*/

	constructor() { // Rhythm engine start
		this.hasBeat = typeof Beat !== 'undefined';
		this.hasTempo = typeof tempo !== 'undefined';
		this.ended = false;
		window.addEventListener('storage', (e) => { // Receive reset signal from other tabs
			if (e.key === 'rhythm_reset') {
				this.data = null; // Switch to standby state
				sessionStorage.removeItem('session');
				window.addEventListener('focus', () => this.session(), { once: true }); // Hard-stop with focus-gated synchronization // Lock-free Total Serialization
			}
		});
		this.cookieAttrs = '; Max-Age=' + RHYTHM.AGE + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
		for (let i = 1; i <= RHYTHM.MAX; i++) { // Check security=2 // determined by Edge and executed blocking together
			const raw = this.get('rhythm_0' + i);
			if (raw && raw.split('_')[1] === '2') {
				if (location.pathname !== RHYTHM.DEF) {
					window.location.href = RHYTHM.DEF; // Send to prison
				}
				return;
			}
		}
		this.tabId = Date.now(); // Register localStorage tab
		localStorage.setItem('t' + this.tabId, '1');
		this.clean(); // Clean normal termination sessions
		this.batch(); // Clean abnormal termination sessions
		this.session(); // Start session // create new or relocate from storage
		setInterval(() => { // Perform save to activate ACT if no activity for 5 minutes
			if (this.data) {
				const duration = Math.floor(Date.now() / 1000) - this.data.time;
				if (duration > 300) this.save();
			}
		}, 300000);
		this.hasTempo ? tempo(this) : document.addEventListener('click', e => this.click(e.target, e), { capture: true }); // Tempo integration
		let scrolling = false; // Debounce to count once per scroll gesture
		const scroll = () => {
			this.data || this.session();
			if (!scrolling) {
				scrolling = true;
				this.data.scrolls++;
				this.save();
			}
			clearTimeout(this.s);
			this.s = setTimeout(() => scrolling = false, 150); // Reset after 150ms
		};
		document.addEventListener('scroll', scroll, { capture: true, passive: true });

		// this.spa(); // Uncomment if SPA needed

		const end = () => { // End behavior
			if (this.ended) return;
			this.ended = true;
			if (RHYTHM.DEL && this.data.clicks < RHYTHM.DEL) { // Discard without sending if clicks less than DEL
				document.cookie = this.data.name + '=; Max-Age=0; Path=' + RHYTHM.HIT + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') document.cookie = this.data.name + '=; Max-Age=0; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
				if (RHYTHM.HIT !== '/') localStorage.removeItem(this.data.name);
				localStorage.removeItem('t' + this.tabId);
				return;
			}
			const isNavigation = sessionStorage.getItem('session') === this.data.name; // Check session storage
			const myKey = 't' + this.tabId;
			let hasOtherTabs = false;
			for (let k in localStorage) if (k[0] === 't' && k !== myKey) { hasOtherTabs = true; break; } // Check localStorage
			if (isNavigation) return; // Return if page navigation
			localStorage.removeItem(myKey); // Clean localStorage
			if (hasOtherTabs) return; // Return if other tabs exist
			this.batch(true); // Send all sessions on browser close
		};
		window.addEventListener('beforeunload', end); // First attempt
		window.addEventListener('pagehide', (e) => { if (!e.persisted) end(); }); // Second attempt
	}
}

document.addEventListener('DOMContentLoaded', () => new Rhythm());
