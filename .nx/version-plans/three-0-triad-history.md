---
three-viewport-gizmo: patch
---

<!-- order: 140 -->
Since 3.0.0-beta.5, a frame drawn with the triad depends only on the camera pose and the options, so the first frame back at a pose matches the frame drawn there before to the byte, on WebGL and WebGPU. Since 3.0.0-beta.2 the triad's lines turned to face the camera in `onBeforeRender`, after both renderers had sorted the frame from each line's world matrix, which was then still the previous frame's. At a view where two lines sit at the same depth (Tau's home view, where X and Z do) the order they were drawn in, and so a few pixels where they cross, followed the pose of the frame before. The lines, the triad's labels and the sphere's background disc now turn to the gizmo's camera in the gizmo scene's `onBeforeRender`, which both renderers call after updating world matrices and before building the render list; the turns are the same, so frames that did not depend on history draw the same pixels.

On `WebGPURenderer` before three r186, three's own `NodeMaterialObserver` can also draw an object with a previous frame's transform after the draw order changes (its first check each frame skipped syncing its cache), which a pose change can do to any gizmo part; three r186 fixes it, and a host on an earlier three needs that fix in three.
