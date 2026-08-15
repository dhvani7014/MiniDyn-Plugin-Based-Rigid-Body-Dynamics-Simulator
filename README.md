# MiniDyn

MiniDyn is a high performance, object-oriented 3D multibody dynamics (MBD) physics engine written in modern C++ (C++17). It simulates rigid body kinematics, external force components, and constraint stabilized joints.

Additionally, the project compiles the core C++ physics engine to **WebAssembly** via Emscripten to drive a real time, interactive simulation dashboard in the browser using a Next.js React frontend.

**Live Demo**: https://minidyn.vercel.app/

## Features

- **Core Physics Engine (C++17)**: Fully object-oriented rigid body integrator supporting dynamic forces and constraints.
- **Baumgarte Constraint Solver**: Implements spherical joints and distance constraints using Baumgarte velocity and position stabilization.
- **Extensible Plugin Force Elements**: Supports pluggable force models including gravity and spring dampers.
- **WebAssembly Simulation Layer**: Embind exposed interface enabling the browser to execute the low level C++ solver dynamically.
- **Interactive Next.js Dashboard**: High fidelity Web GUI representing simulation parameters (gravity, pendulum length) and real time physical telemetry (energy conservation and constraint error margins).
- **Automated Verification**: Full test suite built on Google Test (GTest) to confirm physics validation and mathematical consistency.

---

## Build and Run Locally

### Prerequisites

- CMake >= 3.16
- A C++17 compliant compiler (GCC, Clang, or MSVC)
- Internet connection (to fetch Google Test via CMake on initial configuration)

### Compilation

Clone the repository and build the C++ target:

```bash
git clone https://github.com/dhvani7014/MiniDyn-Plugin-Based-Rigid-Body-Dynamics-Simulator.git
cd MiniDyn-Plugin-Based-Rigid-Body-Dynamics-Simulator
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

### Running Executables

Run the command-line physics simulation demo (generates a `pendulum_trace.csv` output):
```bash
./minidyn_demo
```

Run the unit test suite:
```bash
./minidyn_tests
```

---

## Python Visualization

A Python script is provided to analyze and plot the physical outputs of the C++ simulation. To plot coordinate trajectories, total system energy conservation, and solver error drift:

```bash
pip install matplotlib
python3 scripts/plot_pendulum.py
```

---

## Next.js Web Dashboard

The web GUI is situated under the `web/` directory.

To run the Next.js development server locally:
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the simulator dashboard.

---

## Development Roadmap

Future enhancements for the MiniDyn project include:
1. **Rotational Dynamics**: Adding orientation tracking (quaternion integration), moment of inertia tensors, and revolute/prismatic joint constraints.
2. **Dynamic Plugin Architecture**: Moving force element and constraint implementations behind dynamic link libraries (`.dll`/`.dylib`/`.so`) with a stable C ABI.
3. **Python Bindings**: Implementing C++ bindings using `pybind11` for scriptable model setups.
4. **Desktop UI Integration**: Designing a Qt based MVVM viewport using OpenGL/Qt3D for offline, high frequency physics visualization.
5. **GPU Acceleration**: Offloading constraint solvers and broad phase collision detection to CUDA or compute shaders for massive multibody scenarios.
