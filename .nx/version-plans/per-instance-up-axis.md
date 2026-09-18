---
three-viewport-gizmo: patch
---

Add a per-instance `up` option so face labels, drags and face clicks follow the gizmo's own up axis; a gizmo without one now regenerates when `Object3D.DEFAULT_UP` changes, and `set()` keeps attached controls.
