---
three-viewport-gizmo: minor
---

<!-- order: 60 -->
The `rounded-cube` is one seamless closed rounded box. Its 26 targets are pieces of that box with no gap or seam between them, drawn as clean rectangles with exactly the rounded patches as corners. A corner still wins a pointer a little way into the faces and edges around it (see `corners.hitSize`), and hovering there lights the corner's patch. The box draws at most 15,000 triangles at any `smoothness`. Its faces and corners default to white and its edges to `#eeeeee`.
