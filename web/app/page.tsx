"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [running, setRunning] = useState(false);
  const [gravity, setGravity] = useState(9.81);
  const [length, setLength] = useState(1.0);
  const [time, setTime] = useState(0);
  const [angle, setAngle] = useState(0.28);
  const [x, setX] = useState(0.28 * 1.0);
  const [y, setY] = useState(-1.0);
  const [energy, setEnergy] = useState(0);
  const [constraintError, setConstraintError] = useState(0);
  
  // WASM loading states
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [wasmReady, setWasmReady] = useState(false);

  const lastTime = useRef<number | null>(null);
  const simRef = useRef<any>(null);

  // Dynamically load the WebAssembly helper script
  useEffect(() => {
    let script = document.getElementById("minidyn-script") as HTMLScriptElement;
    
    const initWasm = () => {
      if ((window as any).createMinidynModule) {
        (window as any).createMinidynModule().then((Module: any) => {
          setWasmModule(Module);
          setWasmReady(true);
        }).catch((err: any) => {
          console.error("Failed to initialize WASM module:", err);
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = "minidyn-script";
      script.src = "/minidyn.js";
      script.async = true;
      script.onload = initWasm;
      document.body.appendChild(script);
    } else {
      initWasm();
    }
  }, []);

  // Initialize or reinitialize simulation when WASM becomes ready or sliders change
  const initializeSimulation = useCallback(() => {
    if (!wasmReady || !wasmModule) return;
    
    // Manually delete C++ objects to prevent memory leaks in WebAssembly
    if (simRef.current) {
      simRef.current.delete();
      simRef.current = null;
    }
    
    // Create new pendulum simulation using our WASM/C++ class bindings
    simRef.current = new wasmModule.PendulumSim(gravity, length, 0.28);
    
    const sx = simRef.current.getX();
    const sy = simRef.current.getY();
    const sEnergy = simRef.current.getEnergy();
    const sError = simRef.current.getConstraintError();

    setX(sx);
    setY(sy);
    setAngle(0.28);
    setTime(0);
    setEnergy(sEnergy);
    setConstraintError(sError);
  }, [wasmReady, wasmModule, gravity, length]);

  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  // Main simulation tick loop
  useEffect(() => {
    if (!running || !simRef.current) {
      lastTime.current = null;
      return;
    }

    let frame: number;

    const animate = (timestamp: number) => {
      if (lastTime.current === null) {
        lastTime.current = timestamp;
      }

      const dt = Math.min((timestamp - lastTime.current) / 1000, 0.03);
      lastTime.current = timestamp;

      const sim = simRef.current;
      if (sim) {
        // Step the actual C++ MiniDyn engine
        sim.step(dt);

        const sx = sim.getX();
        const sy = sim.getY();
        const sEnergy = sim.getEnergy();
        const sError = sim.getConstraintError();
        const sAngle = Math.atan2(sx, -sy);

        setX(sx);
        setY(sy);
        setAngle(sAngle);
        setEnergy(sEnergy);
        setConstraintError(sError);
        setTime((prev) => prev + dt);
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [running]);

  const reset = () => {
    setRunning(false);
    initializeSimulation();
  };

  return (
    <main className="min-h-screen bg-[#08090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-bold">
                M
              </div>
              <h1 className="text-xl font-semibold tracking-tight">
                MiniDyn
              </h1>
              <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-[10px] uppercase tracking-widest text-zinc-500">
                Physics Engine
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Interactive rigid-body dynamics simulation
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 sm:flex">
            <span className={`h-2 w-2 rounded-full ${wasmReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            {wasmReady ? 'WASM Engine Ready' : 'Loading WASM...'}
          </div>
        </header>

        {/* Main grid */}
        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          {/* Simulation */}
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0f12]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <p className="text-sm font-medium">Pendulum Simulation</p>
                <p className="text-xs text-zinc-500">
                  Distance constraint · Gravity force
                </p>
              </div>

              <span className="font-mono text-xs text-zinc-500">
                t = {time.toFixed(3)} s
              </span>
            </div>

            <div className="relative h-[500px] overflow-hidden bg-[radial-gradient(circle_at_center,#15191f_0%,#0b0d10_65%)]">
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "linear-gradient(#71717a 1px, transparent 1px), linear-gradient(90deg, #71717a 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Origin */}
              <div className="absolute left-1/2 top-[100px] -translate-x-1/2">
                <div className="h-3 w-3 rounded-full bg-zinc-200 shadow-[0_0_18px_rgba(255,255,255,0.35)]" />

                {/* Pendulum */}
                <div
                  className="absolute left-1/2 top-1 origin-top"
                  style={{
                    height: `${length * 245}px`,
                    transform: `translateX(-50%) rotate(${angle}rad)`,
                  }}
                >
                  <div className="h-full w-[2px] bg-zinc-500" />

                  <div className="absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border border-zinc-300 bg-zinc-100 shadow-[0_0_25px_rgba(255,255,255,0.2)]" />
                </div>

                {/* Anchor label */}
                <div className="absolute left-5 top-0 whitespace-nowrap text-[10px] uppercase tracking-widest text-zinc-600">
                  Anchor
                </div>
              </div>

              {/* Coordinates */}
              <div className="absolute bottom-5 left-5 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 font-mono text-xs text-zinc-500 backdrop-blur">
                x {x.toFixed(4)} &nbsp;&nbsp; y {y.toFixed(4)}
              </div>

              <div className="absolute bottom-5 right-5 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 font-mono text-xs text-zinc-500 backdrop-blur">
                dt 0.001 s
              </div>
            </div>
          </section>

          {/* Controls */}
          <aside className="rounded-2xl border border-zinc-800 bg-[#0d0f12]">
            <div className="border-b border-zinc-800 px-5 py-4">
              <p className="text-sm font-medium">Simulation Controls</p>
              <p className="mt-1 text-xs text-zinc-500">
                Adjust the physical parameters
              </p>
            </div>

            <div className="space-y-7 p-5">
              {/* Gravity */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm text-zinc-300">Gravity</label>
                  <span className="font-mono text-xs text-zinc-400">
                    {gravity.toFixed(2)} m/s²
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.01"
                  value={gravity}
                  onChange={(e) => setGravity(Number(e.target.value))}
                  className="w-full accent-white"
                />

                <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                  <span>1.00</span>
                  <span>20.00</span>
                </div>
              </div>

              {/* Length */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm text-zinc-300">
                    Pendulum Length
                  </label>
                  <span className="font-mono text-xs text-zinc-400">
                    {length.toFixed(2)} m
                  </span>
                </div>

                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.01"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-white"
                />

                <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                  <span>0.50</span>
                  <span>1.50</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!wasmReady}
                  onClick={() => setRunning(!running)}
                  className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!wasmReady ? "Loading..." : running ? "Pause" : "Run Simulation"}
                </button>

                <button
                  disabled={!wasmReady}
                  onClick={reset}
                  className="rounded-lg border border-zinc-700 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Metrics */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Simulation Time"
            value={`${time.toFixed(3)} s`}
            detail="Elapsed time"
          />
          <Metric
            label="Position X"
            value={x.toFixed(4)}
            detail="meters"
          />
          <Metric
            label="Position Y"
            value={y.toFixed(4)}
            detail="meters"
          />
          <Metric
            label="Energy"
            value={energy.toFixed(5)}
            detail="joules"
          />
        </section>

        {/* Validation */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-[#0d0f12] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Constraint Validation</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Distance constraint relative to anchor
                </p>
              </div>

              <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                Math.abs(constraintError) < 1e-4 
                  ? 'border-emerald-900 bg-emerald-950/40 text-emerald-400' 
                  : 'border-amber-900 bg-amber-950/40 text-amber-400'
              }`}>
                {Math.abs(constraintError) < 1e-4 ? 'Stable' : 'Correcting'}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-3xl tracking-tight">
                  {constraintError.toExponential(2)}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Constraint error
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-sm text-zinc-400">
                  Target: {length.toFixed(4)} m
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Distance from anchor
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0d0f12] p-5">
            <p className="text-sm font-medium">Engine Status</p>
            <div className="mt-5 space-y-3">
              <Status name="WebAssembly Compilation" isReady={wasmReady} />
              <Status name="Rigid body integration" isReady={wasmReady} />
              <Status name="Gravity force" isReady={wasmReady} />
              <Status name="Distance constraint" isReady={wasmReady} />
              <Status name="Energy calculation" isReady={wasmReady} />
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-zinc-900 pt-5 text-center text-xs text-zinc-600">
          MiniDyn · C++ rigid-body dynamics engine · Web interface
        </footer>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0f12] p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-3 font-mono text-2xl tracking-tight text-zinc-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-600">{detail}</p>
    </div>
  );
}

function Status({ name, isReady = true }: { name: string; isReady?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
      <span className="text-sm text-zinc-400">{name}</span>
      <span className={`flex items-center gap-2 text-xs ${isReady ? 'text-emerald-400' : 'text-zinc-500'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
        {isReady ? 'Ready' : 'Pending'}
      </span>
    </div>
  );
}
