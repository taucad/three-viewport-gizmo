---
three-viewport-gizmo: minor
---

<!-- order: 50 -->
The cube types gain a built-in axis triad, off by default: `triad: { enabled: true }` draws world +X, +Y and +Z from the cube's corner with an X, Y or Z label past each tip in the axis colour (`triad.colors`), and shrinks the cube to 0.7 to give it room. Each line is a camera-facing ribbon with a feathered edge, smooth without MSAA. It switches on and off through `set({ triad })` as a cheap change, with no rebuild, and adds six draws while shown (three lines, three labels). The sphere has no triad.
