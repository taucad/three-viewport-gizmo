---
three-viewport-gizmo: patch
---

`render()` no longer reads the gizmo's rectangle from layout on every frame. Measuring with `getBoundingClientRect` every frame allocated 32 B a frame, and 76 to 82 B at a subpixel offset (each fractional coordinate comes out of the DOM as a new number), over the 64 B idle budget. The gizmo now compares eight whole-pixel offsets and sizes of its element and the canvas each frame, which allocates nothing, and measures exactly when one changed or when the window resizes (zoom included), anything scrolls, either box changes size by a fraction of a pixel (`ResizeObserver`, from the next frame) or `set()` runs. The drawn rectangle is the same subpixel rectangle as before, picked up on the same frame for a container, element or canvas resize, a move of a pixel or more, a scroll or a pixel-ratio change. Only a move of less than half a CSS pixel that changes no size, or a move made purely by a CSS transform, waits for the next of those signals.
