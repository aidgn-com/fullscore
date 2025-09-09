/**
 * TEMPO - Touch Event Maestro Performance Optimizer
 * Copyright (c) 2025 Aidgn
 * MIT License - See LICENSE file for details
 * 
 * A 50-line snippet that refines the speed and accuracy of touch events. Like an
 * orchestra conductor unifying different instruments into one tempo, it synchronizes
 * mobile and desktop interactions. Standalone, it delivers silky-smooth improvements;
 * paired with Rhythm, it becomes a conduit for channeling user interaction data.
 */

function tempo(rhythm) { // Touch Event Maestro Performance Optimizer
	if (document.tempo) return;
	document.tempo = true;
	if ("ontouchstart" in window || navigator.maxTouchPoints > 0) { // Mobile environment detection
		const pending = new Set(); // Track pending native click blockers
		let moved = false;
		document.addEventListener("touchstart", () => (moved = false, pending.forEach(b => document.removeEventListener("click", b, true)), pending.clear()), {capture: true, passive: true}); // Reset moved
		document.addEventListener("touchmove", () => moved = true, {capture: true, passive: true}); // Mark as moved
		document.addEventListener("touchcancel", () => moved = true, {capture: true, passive: true}); // Mark as cancelled
		document.addEventListener("touchend", (e) => {

			// if (e.target.closest(".nofasttouch")) return; // Uncomment to exclude specific elements

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
