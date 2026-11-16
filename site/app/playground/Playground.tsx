"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { GizmoFaceName, GizmoLimits, GizmoOptions } from "@lib/index";
import { Stage } from "@site/components/Stage";
import { AXES, defaultFront, frontsFor, type Axis, type Vec3 } from "@site/components/frames";
import type { StageConfig, StageHandle, ViewReading } from "@site/components/stage-runtime";

const axisLabel = (axis: Axis) => `${axis[0] === "-" ? "−" : "+"}${axis[1].toUpperCase()}`;
const axisChoices = (axes: readonly Axis[]) => axes.map((axis) => [axis, axisLabel(axis)] as const);

const LIMITS: Record<"none" | "horizon" | "front-half", GizmoLimits | undefined> = {
  none: undefined,
  horizon: { maxPolarAngle: Math.PI / 2 },
  "front-half": { minAzimuthAngle: -Math.PI / 2, maxAzimuthAngle: Math.PI / 2 },
};

const CHOICES = {
  renderer: [
    ["webgl", "WebGL"],
    ["webgpu", "WebGPU"],
  ],
  up: axisChoices(AXES),
  type: [
    ["sphere", "Sphere"],
    ["cube", "Cube"],
    ["rounded-cube", "Rounded cube"],
  ],
  controller: [
    ["orbit", "OrbitControls"],
    ["camera-controls", "camera-controls"],
    ["none", "None"],
  ],
  projection: [
    ["perspective", "Perspective"],
    ["orthographic", "Orthographic"],
  ],
  limits: [
    ["none", "None"],
    ["horizon", "Stay above the horizon"],
    ["front-half", "Front half only"],
  ],
  poleEntry: [
    ["front", "From the front"],
    ["nearest", "Nearest side"],
  ],
} as const;

type Choice = keyof typeof CHOICES;
type Values = { [K in Choice]: (typeof CHOICES)[K][number][0] };

const LABELS: Record<Choice, string> = {
  renderer: "Renderer",
  up: "Up axis",
  type: "Gizmo type",
  controller: "Controller",
  projection: "Projection",
  limits: "Limits",
  poleEntry: "Turning to Top or Bottom",
};

const DEFAULTS: Values = {
  renderer: "webgl",
  up: "+y",
  type: "cube",
  controller: "orbit",
  projection: "perspective",
  limits: "none",
  poleEntry: "front",
};

const FACES: readonly GizmoFaceName[] = ["front", "back", "left", "right", "top", "bottom"];

// A `+` typed into a query string reads back as a space.
const param = (params: URLSearchParams, key: string) => params.get(key)?.replace(/^ /, "+") ?? null;

function pick<K extends Choice>(params: URLSearchParams, key: K): Values[K] {
  const value = param(params, key);
  const allowed = CHOICES[key].map(([v]) => v) as readonly string[];
  return (value !== null && allowed.includes(value) ? value : DEFAULTS[key]) as Values[K];
}

const vector = (v: Vec3) => v.map((n) => (Math.abs(n) < 5e-4 ? 0 : n).toFixed(3)).join(", ");

export function Playground() {
  const params = useSearchParams();
  const values = Object.fromEntries(
    (Object.keys(CHOICES) as Choice[]).map((key) => [key, pick(params, key)])
  ) as Values;
  const fronts = frontsFor(values.up);
  const frontParam = param(params, "front") as Axis | null;
  const front = frontParam && fronts.includes(frontParam) ? frontParam : defaultFront(values.up);
  const speedParam = Number(params.get("speed"));
  const speed = speedParam > 0 && speedParam <= 4 ? speedParam : 1;
  const animated = params.get("animated") !== "false";
  const triad = params.get("triad") === "true";
  const controlled = params.get("controlled") === "true";
  const hasTriad = values.type !== "sphere";

  const [stage, setStage] = useState<StageHandle | null>(null);
  const [view, setView] = useState<ViewReading | null>(null);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    // Next.js keeps useSearchParams in sync with history.replaceState.
    window.history.replaceState(null, "", `?${next}`);
  };

  const onStage = useCallback((next: StageHandle | null) => setStage(next), []);

  useEffect(() => {
    if (!stage) return setView(null);
    const read = () => setView(stage.readView());
    read();
    return stage.onViewChange(read);
  }, [stage]);

  // Changing any of these rebuilds the stage.
  const config: StageConfig = {
    renderer: values.renderer,
    up: values.up,
    front,
    projection: values.projection,
    controller: values.controller,
    gizmo: {},
  };

  // These go to the running gizmo through `gizmo.set()`.
  const options: GizmoOptions = {
    type: values.type,
    animated,
    speed,
    controlled,
    poleEntry: values.poleEntry,
    limits: LIMITS[values.limits],
    triad: { enabled: hasTriad && triad },
  };

  const gizmo = stage?.gizmo;

  return (
    <div className="playground">
      <div>
        <Stage
          config={config}
          options={options}
          onStage={onStage}
          label={`Playground viewport: ${values.renderer}, ${axisLabel(values.up)} up, Front ${axisLabel(front)}, ${values.type} gizmo, ${values.controller} controller, ${values.projection} camera`}
        />

        {/* Turns. Roll controls and the turn API (turn, heading, home) join this group after K7. */}
        <div className="views" role="group" aria-label="Look from">
          {FACES.map((face) => (
            <button
              key={face}
              type="button"
              className="button"
              disabled={!gizmo}
              onClick={() => void gizmo?.lookFrom(face)}
            >
              {face[0].toUpperCase() + face.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="controls">
        {(["renderer", "up"] as const).map((key) => (
          <Segmented key={key} name={key} values={values} update={update} />
        ))}

        <fieldset>
          <legend>Front faces</legend>
          <div className="segmented">
            {axisChoices(fronts).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="front"
                  value={value}
                  checked={front === value}
                  onChange={() => update("front", value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {(["type", "controller", "projection", "limits", "poleEntry"] as const).map((key) => (
          <Segmented key={key} name={key} values={values} update={update} />
        ))}

        <div>
          <label className="control-label" htmlFor="speed">
            Animation speed: {speed.toFixed(2)}×
          </label>
          <input
            id="speed"
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={speed}
            onChange={(e) => update("speed", e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={animated}
            onChange={(e) => update("animated", String(e.target.checked))}
          />{" "}
          Animated
        </label>

        <label>
          <input
            type="checkbox"
            checked={hasTriad && triad}
            disabled={!hasTriad}
            onChange={(e) => update("triad", String(e.target.checked))}
          />{" "}
          Axis triad{hasTriad ? "" : " (cube types only)"}
        </label>

        <label>
          <input
            type="checkbox"
            checked={controlled}
            onChange={(e) => update("controlled", String(e.target.checked))}
          />{" "}
          Controlled: the page writes the camera from each <code>change</code>
        </label>

        <div>
          <div className="control-label" id="readout-label">
            Camera
          </div>
          <dl className="readout" aria-labelledby="readout-label">
            <dt>backend</dt>
            <dd>{stage?.backend ?? "…"}</dd>
            <dt>direction</dt>
            <dd>{view ? vector(view.direction) : "…"}</dd>
            <dt>up</dt>
            <dd>{view ? vector(view.up) : "…"}</dd>
            <dt>at target</dt>
            <dd>{view ? (view.atTarget ?? "none") : "…"}</dd>
            <dt>roll</dt>
            <dd>{view ? `${(Math.abs(view.roll) < 0.05 ? 0 : view.roll).toFixed(1)}°` : "…"}</dd>
          </dl>
          <p className="muted">
            Direction points from the orbit target to the camera. Roll is the angle between the
            camera&apos;s right vector and the plane perpendicular to the up axis; it reads 0.0° in
            every view until the view is rolled.
          </p>
        </div>
      </div>
    </div>
  );
}

function Segmented({
  name,
  values,
  update,
}: {
  name: Choice;
  values: Values;
  update: (key: string, value: string) => void;
}) {
  return (
    <fieldset>
      <legend>{LABELS[name]}</legend>
      <div className="segmented">
        {CHOICES[name].map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name={name}
              value={value}
              checked={values[name] === value}
              onChange={() => update(name, value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
