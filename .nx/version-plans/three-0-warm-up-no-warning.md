---
three-viewport-gizmo: patch
---

<!-- order: 30 -->
`compile()` logs nothing on a WebGL device without `KHR_parallel_shader_compile`: it compiles synchronously there instead of through three's `compileAsync`, which warned that the extension is not supported.
