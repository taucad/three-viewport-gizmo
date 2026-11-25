---
three-viewport-gizmo: patch
---

<!-- order: 100 -->
Since 3.0.0-beta.5, `render()` no longer reads the gizmo's rectangle from layout on every frame. Measuring with `getBoundingClientRect` every frame allocated 32 B a frame, and 76 to 82 B at a subpixel offset (each fractional coordinate comes out of the DOM as a new number), over the 64 B idle budget. The gizmo now compares the whole-pixel positions (offsets summed up each `offsetParent` chain) and sizes of its element and the canvas each frame, which allocates nothing, and measures exactly when one changed or when the window resizes (zoom included), anything scrolls, either box changes size by a fraction of a pixel (`ResizeObserver`, from the next frame) or `set()` is called (`set({})` included). The drawn rectangle is the same subpixel rectangle as before, picked up on the same frame for a container, element or canvas resize, a move of a pixel or more (also of a positioned container that holds only one of them), a scroll or a pixel-ratio change. Only a move of less than half a CSS pixel that changes no size, or a move made purely by a CSS transform, waits for the next of those signals; `set({})` picks it up at once.

Also since 3.0.0-beta.5, hidden axis lines no longer cost triangles. They were collapsed to the origin and still drawn; the shown lines now come first in the lines' index and the draw range ends after them, so the sphere with its default three lines draws 238 triangles instead of 334 (the budget is 300), with the same pixels on WebGL and WebGPU.

The sphere's background merges its geometries with the gizmo's own helper, so `three/addons/utils/BufferGeometryUtils.js` is no longer imported (about 1 kB less gzip in an app that does not use it otherwise).
