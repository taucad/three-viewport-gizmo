---
three-viewport-gizmo: patch
---

<!-- order: 110 -->
Since 3.0.0-beta.5, the rounded cube keeps its drawn size under any `fieldOfView`, with or without the triad. The camera distance held the projected size of one depth, the unit cube's front face, but the rounded cube's outline runs round its bevel, nearer the centre (`1 − radius`) and closer to the camera as the camera comes closer, and the triad shrinks the scene to 0.7: at radius 0.3 with the triad the cube was 10 % larger at 0.1° and 20 % smaller at 90° than at 26°. The distance is now solved from the outline the gizmo draws, so the rounded cube stays within a pixel of its 26° size from 0.1° to 90°; at 26° nothing changes (distance 7). The triad's line width and label texels follow the same distance.
