import type { Metadata } from "next";
import { Suspense } from "react";
import { Playground } from "./Playground";

export const metadata: Metadata = { title: "Playground" };

export default function PlaygroundPage() {
  return (
    <>
      <h1>Playground</h1>
      <p className="muted">
        Every combination of renderer, up axis, Front, gizmo type, controller and projection, with
        the gizmo&apos;s limits, pole entry, triad and controlled mode. The readout shows the
        camera&apos;s direction and up and the target the view rests on. The URL holds the
        configuration, so you can share it.
      </p>
      <Suspense fallback={<p className="muted">Loading the playground…</p>}>
        <Playground />
      </Suspense>
    </>
  );
}
