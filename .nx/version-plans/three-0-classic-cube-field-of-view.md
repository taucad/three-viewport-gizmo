---
three-viewport-gizmo: patch
---

<!-- order: 200 -->
Since 3.0.0-beta.6, the classic `cube` keeps its drawn size under any `fieldOfView` too, with or without the triad, as the rounded cube does: face-on, its width stays within a pixel of its 26° width from 0.1° to 100°, where it grew by 3 % toward 0.1° and shrank by 5 % at 90°. Its width is bounded by its background's side plates, seen from inside, and at narrow angles by its corner plates, which turn away from a camera that comes close; the camera distance is now solved from what the gizmo draws at that distance, each one-sided plate counted only from where it faces the camera, instead of 2.3.0's unit front edge. At 26° nothing changes (distance 7). The triad's line width and label texels follow the same distance.
