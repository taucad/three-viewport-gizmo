---
three-viewport-gizmo: patch
---

<!-- order: 130 -->
Since 3.0.0-beta.0, a press or turn on the gizmo stops the motion the attached controls keep up after a drag: OrbitControls' and MapControls' damping, TrackballControls' inertia and ArcballControls' animation (three 0.168 or later for OrbitControls and TrackballControls). Disabling the controls stopped their input but not that motion, so a gizmo click right after a flick on the canvas reported `reached` and the camera then drifted off the view; ArcballControls, whose animation is on by default, did so in Safari after an ordinary drag.
