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
		document.addEventListener("touchstart", () => {
			moved = false;
			for (const block of pending) document.removeEventListener("click", block, true);
			pending.clear();
		}, { capture: true, passive: true });
		document.addEventListener("touchmove", () => moved = true, { capture: true, passive: true });
		document.addEventListener("touchcancel", () => moved = true, { capture: true, passive: true });
		document.addEventListener("touchend", (e) => {
			// if (e.target.closest(".nofasttouch")) return; // Uncomment to exclude specific elements
			if (moved || !e.changedTouches?.[0]) return;
			let once = true;
			const block = (ev) => { // Block native click events to prevent duplication
				if (ev.detail === -1 || !ev.isTrusted) return; // Allow tempo clicks and synthetic events
				if (once) {
					ev.preventDefault();
					ev.stopImmediatePropagation();
					once = false;
					document.removeEventListener("click", block, true);
					pending.delete(block);
				}
			};
			pending.add(block);
			document.addEventListener("click", block, { capture: true });
			let el = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
			const label = el?.closest('label');
			el = label?.control || label?.querySelector('input,textarea,select') || el; // Label-to-control redirect
			if (rhythm) el = rhythm.click(el, e); // Mobile Rhythm integration
			for (let i = 0; el && i < 4; i++) { // Bubble up to find clickable parent (max 4 levels)
				if (el.onclick || el.hasAttribute("onclick") || typeof el.click === "function") {
					el.dispatchEvent(new MouseEvent("click", {bubbles:true, cancelable:true, view:window, detail:-1})); // Fire synthetic click with tempo marker
					break;
				}
				el = el.parentElement;
			}
		}, { capture: true, passive: true });
	} else if (rhythm) { // Desktop environment detection
		document.addEventListener("click", e => rhythm.click(e.target, e), { capture: true }); // Desktop Rhythm integration
	}
}


// tempo(); // Uncomment for standalone use
