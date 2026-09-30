# dsh-rail-zero

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Zero out the 56px rail the DSH left sidebar leaves behind when collapsed** — while keeping the sidebar one click away. Pure browser-side CSS/DOM patch: no host API calls, no peer dependencies, effective immediately after restart.

## The problem

DSH's collapsed-left-sidebar width is hard-coded in `@deepseek-ai/dsh-client-ui-layout`'s AppFrame:

```js
computeColumns(viewport, sidebar, rightbar, collapsedWidth = 56)
// collapsedWidth = darwin || html[data-windows-titlebar] ? 0 : 56
```

Only macOS (or desktop shells with a custom titlebar) collapse the sidebar to zero. **On Windows/Linux the collapsed rail stays 56px wide and empty.** This plugin zeroes it and gives the space back to the conversation pane.

## Features

- **First track only**: rewrites only the leading segment of the frame's inline `grid-template-columns` (`!important` over inline styles); the right panel's track is untouched. A `MutationObserver` re-applies after every React re-render (guarded against feedback loops).
- **Three-tier expand control — never duplicates an existing one**:
  1. [dsh-qol](https://github.com/) installed → uses its always-visible hamburger (`.astb-sidebar-toggle`); this plugin's own button hides itself. qol is never modified.
  2. No qol → clicks the official sidebar toggle (note its stateful aria-label: "打开侧边栏" when collapsed).
  3. Last resort → a tiny 26px floating "»" button top-left.
- **Zero dependencies**: `require`s no host module (sidesteps the 0.2.0 client-modules drift), pure DOM/CSS.
- Touches no DSH source or bundle files.

## Install

```bash
dsh plugin --profile web add dsh-rail-zero
# or straight from GitHub:
dsh plugin --profile web add github:HelloQingTao/dsh-rail-zero
```

Restart `dsh web` to take effect. Uninstall restores everything.

## Compatibility

| DSH version | Status |
|---|---|
| 0.2.0-rc.1 / 0.2.0-rc.2 | ✅ tested |
| 0.1.x | untested (should work in principle, feedback welcome) |

Coexists cleanly with dsh-qol (reuses its hamburger), dsh-better-sidebar and dsh-sidebar-qa.

## How it works

See the header comment in [lib/client.js](lib/client.js).

## License

[MIT](LICENSE)
