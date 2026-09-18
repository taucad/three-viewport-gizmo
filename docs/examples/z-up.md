<script setup lang="ts">
const type = typeof window === "undefined" ? "sphere" : new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Z-up Coordinate System

<IframeContainer :url="`z-up.html?type=${type}`" />

This example demonstrates how to use ViewportGizmo in a Three.js scene with a Z-up coordinate system. This coordinate system is commonly used in CAD applications, where the Z-axis represents the vertical direction.

The Gizmo reads the up axis from `Object3D.DEFAULT_UP`, so a Z-up scene works out of the box, and changing the global later regenerates the gizmo on its next update or render. When several views with different up axes share one process, pass the axis per gizmo instead: `new ViewportGizmo(camera, renderer, { up: "z" })`.

The default directions are as follows:
- Up: `Z+`
- Right: `X+`
- Forward: `Y+`

### Source

[...samples/z-up.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/z-up.html)
