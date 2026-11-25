---
three-viewport-gizmo: patch
---

<!-- order: 150 -->
Since 3.0.0-beta.5, a gizmo laid out off the canvas, or off the host's render target, draws nothing and no longer fails on WebGPU. A gizmo whose container is not the canvas's can sit outside it (Tau's container is `document.body`); three clamps only a scissor's far edges, so the gizmo's scissor kept an origin outside the target, and WebGPU rejected the frame (`Scissor rect … is not contained in the render area`). `render()` now skips the draw, touching no renderer state, when the rectangle misses the canvas or target, and when it is partly off, scissors to the part on it while the viewport keeps the whole rectangle, so the gizmo is cut at the edge rather than squashed. Hit testing is unchanged.
