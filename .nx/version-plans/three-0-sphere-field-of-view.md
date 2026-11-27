---
three-viewport-gizmo: patch
---

<!-- order: 210 -->
Since 3.0.0-beta.6, the sphere follows `fieldOfView` like the cube types: it is drawn through a perspective camera instead of 2.3.0's orthographic one, so wide angles exaggerate its depth and narrow ones approach orthographic, and its face-on width stays at the width the orthographic camera drew from 0.1° to 100°. At the default 26° its face-on width is unchanged, but the sprites nearer the camera than the centre now draw slightly larger than those behind it (the front sprite by a fifth). The background disc still fills the element's circle at every field of view, the navigation buttons keep their round layout, and hits follow the drawn sprites. At wide angles the near sprites grow: above about 50° they can reach past the element's edge in oblique views, and their labels soften. For 2.3.0's flat look, pass a narrow `fieldOfView` such as `MathUtils.degToRad(1)`.
