---
three-viewport-gizmo: patch
---

<!-- order: 50 -->
Since 3.0.0-beta.2, the axis triad's lines are smooth on a single-sample host (Tau's WebGPU node pipeline, phones): each is a feathered camera-facing ribbon instead of a hard-edged cylinder, and the triad adds six draws (three lines, three labels) instead of four. Since 3.0.0-beta.2, the navigation buttons no longer show their focus ring at rest in Safari (WebKit reads `outline: none` back as "medium", which a restyle took for a focused button); the ring now shows only on the `:focus-visible` button and sits snug around its chip.
