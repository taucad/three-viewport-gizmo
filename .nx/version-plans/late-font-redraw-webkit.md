---
three-viewport-gizmo: patch
---

<!-- order: 120 -->
Since 3.0.0-beta.0, a web font that finishes loading after construction redraws the labels in WebKit browsers too. The labels waited for `document.fonts` `loadingdone`, which WebKit never fires for a `FontFace` the page adds and then loads, so they kept the fallback font until the next `set()`. They now redraw once each time a round of font loading ends, in every engine, whether the host loaded a `FontFace` or drawing in a CSS `@font-face` family started the load: on `loading`, they wait for every face still loading to settle (the set's `ready` only when none is), then for one animation frame, so the canvas draws in the new face. `dispose()` stops it, a load still pending included.
