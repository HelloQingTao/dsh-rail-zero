/**
 * dsh-rail-zero — browser half.
 *
 * DSH's left sidebar collapses to a 56px rail. The rail width is hard-coded in
 * @deepseek-ai/dsh-client-ui-layout's AppFrame: computeColumns(viewport, sidebar,
 * rightbar, collapsedWidth = 56), where collapsedWidth is 0 only on darwin or when
 * the html element carries data-windows-titlebar. On Windows/Linux the collapsed
 * rail stays 56px wide and empty.
 *
 * This plugin rewrites ONLY the first track of the frame's inline
 * grid-template-columns to 0px (right panel track untouched), re-applying after
 * every React re-render via a MutationObserver, and keeps the sidebar reachable:
 *
 *   1. If dsh-qol is installed, its always-visible hamburger
 *      (.astb-sidebar-toggle) is the expand control - this plugin hides its own
 *      fallback button and forwards clicks to the hamburger. qol is never
 *      modified.
 *   2. Otherwise the official sidebar toggle inside the frame is clicked.
 *      Note its aria-label is stateful: "收起侧边栏" when expanded,
 *      "打开侧边栏" when collapsed.
 *   3. As a last resort a small floating button is shown top-left.
 */
window.__ModuleLoader__.load({
	id: 'dsh-rail-zero',
	factory: () => {
		const TAG = '[dsh-rail-zero]';
		const FRAME_SEL = '[data-sidebar-collapsed]';
		const CSS_ID = 'dsh-rail-zero/btn';
		const QOL_HAMBURGER = '.astb-sidebar-toggle';

		function log(msg) { try { console.log(TAG, msg); } catch (_) {} }

		function ensureStyle() {
			if (typeof document === 'undefined') return;
			if (document.querySelector('style[data-plugin-css="' + CSS_ID + '"]') !== null) return;
			const st = document.createElement('style');
			st.dataset.plugin = 'dsh-rail-zero';
			st.dataset.pluginCss = CSS_ID;
			st.textContent = [
				'#dsh-rail-zero-btn{position:fixed;left:8px;top:8px;z-index:80;width:26px;height:26px;',
				'border-radius:8px;border:1px solid var(--dsw-alias-border,rgba(127,127,127,.35));',
				'background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-text-primary,#333);',
				'display:none;align-items:center;justify-content:center;cursor:pointer;padding:0;',
				'box-shadow:0 2px 8px rgba(0,0,0,.14);font-size:13px;line-height:1;}',
				'#dsh-rail-zero-btn:hover{filter:brightness(.96)}',
				'#dsh-rail-zero-btn[data-on="1"]{display:flex}'
			].join('');
			document.head.appendChild(st);
		}

		function ensureButton() {
			let btn = document.getElementById('dsh-rail-zero-btn');
			if (btn) return btn;
			btn = document.createElement('button');
			btn.id = 'dsh-rail-zero-btn';
			btn.type = 'button';
			btn.title = '展开侧边栏';
			btn.setAttribute('aria-label', '展开侧边栏');
			btn.textContent = '»';
			btn.addEventListener('click', () => { try { expandSidebar(); } catch (_) {} });
			document.body.appendChild(btn);
			return btn;
		}

		function officialToggle() {
			const scope = document.querySelector(FRAME_SEL);
			if (!scope) return null;
			const btns = scope.querySelectorAll('button[aria-label]');
			for (const b of btns) {
				if (b.classList.contains('astb-sidebar-toggle')) continue; // qol's own hamburger
				const label = String(b.getAttribute('aria-label') || '');
				// collapsed: 「打开侧边栏」/「展开侧栏」/Open sidebar; expanded: 「收起侧边栏」/Collapse
				if (/打开|展开|open|expand/i.test(label) && !/收起|collapse/i.test(label)) return b;
			}
			return null;
		}

		function expandSidebar() {
			// Prefer dsh-qol's hamburger when present - it is the user's existing
			// fixed toggle; never duplicate or modify it.
			const qol = document.querySelector(QOL_HAMBURGER);
			if (qol) { qol.click(); log('expand via qol hamburger'); return true; }
			const t = officialToggle();
			if (t) { t.click(); log('expand via official toggle'); return true; }
			log('expand: no toggle found');
			return false;
		}

		function patchFrame() {
			const el = document.querySelector(FRAME_SEL);
			const btn = ensureButton();
			// qol's hamburger is always visible; hide our fallback button when it exists.
			btn.style.display = document.querySelector(QOL_HAMBURGER) ? 'none' : '';
			if (!el) { btn.dataset.on = '0'; return; }
			btn.dataset.on = '1';
			const cur = el.style.gridTemplateColumns || '';
			const m = cur.match(/^(\S+)\s+([\s\S]+)$/);
			if (!m) return;
			if (m[1] === '0px') return; // already patched — no feedback loop
			el.style.setProperty('grid-template-columns', '0px ' + m[2], 'important');
		}

		function apply(ctx) {
			if (window.__DSH_RAIL_ZERO_ACTIVE__) return;
			window.__DSH_RAIL_ZERO_ACTIVE__ = true;
			ensureStyle();
			const btn = ensureButton();
			btn.dataset.on = document.querySelector(FRAME_SEL) ? '1' : '0';
			const obs = new MutationObserver(() => { try { patchFrame(); } catch (_) {} });
			const start = () => {
				obs.observe(document.body, { attributes: true, attributeFilter: ['style', 'data-sidebar-collapsed'], childList: true, subtree: true });
				patchFrame();
				log('active');
			};
			if (document.body) start();
			else document.addEventListener('DOMContentLoaded', start, { once: true });
		}

		return { apply, inject: [] };
	}
});
