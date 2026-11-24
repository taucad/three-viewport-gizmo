---
three-viewport-gizmo: minor
---

<!-- order: 20 -->
The `fieldOfView` option sets the gizmo's own camera's field of view in radians (not three.js's degree `fov`); it moves the camera to keep the cube's apparent size and rebuilds no geometry or material. `compile()` warms up the gizmo's scene with its own camera for the renderer's current render target, on WebGL and WebGPU. These replace a host's reach into the private `_camera` and its own `compileAsync` call on the gizmo.
