#!/usr/bin/env python3
import os
import subprocess
import csv
import sys

try:
    import matplotlib.pyplot as plt
except ImportError:
    print("Error: matplotlib is required to run this script.")
    print("Please install it using: pip install matplotlib")
    sys.exit(1)

def main():
    # Target CSV output path
    csv_path = "pendulum_trace.csv"
    
    # If the CSV doesn't exist, try to run the C++ demo binary to generate it
    if not os.path.exists(csv_path):
        demo_path = os.path.join("build", "minidyn_demo")
        if os.path.exists(demo_path):
            print(f"Running C++ simulation demo ({demo_path}) to generate trace...")
            try:
                subprocess.run([demo_path], check=True)
            except subprocess.CalledProcessError as e:
                print(f"Error running C++ demo: {e}")
                sys.exit(1)
        else:
            print("Error: pendulum_trace.csv not found and build/minidyn_demo not built.")
            print("Please build the C++ project first:")
            print("  mkdir -p build && cd build && cmake .. && make")
            sys.exit(1)

    # Read data from the generated CSV
    times = []
    xs = []
    ys = []
    energies = []
    errors = []

    print(f"Reading simulation data from {csv_path}...")
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            times.append(float(row['t']))
            xs.append(float(row['x']))
            ys.append(float(row['y']))
            energies.append(float(row['energy']))
            errors.append(float(row['constraint_error']))

    print("Generating simulation plots...")
    fig, axs = plt.subplots(2, 2, figsize=(12, 10))

    # 1. Trajectory Plot (Space)
    axs[0, 0].plot(xs, ys, color='#2563eb', label='Bob Path')
    axs[0, 0].scatter([0], [0], color='#dc2626', marker='o', s=50, label='Anchor')
    axs[0, 0].set_title('Pendulum Trajectory')
    axs[0, 0].set_xlabel('X Coordinate (m)')
    axs[0, 0].set_ylabel('Y Coordinate (m)')
    axs[0, 0].axis('equal')
    axs[0, 0].grid(True, linestyle='--', alpha=0.5)
    axs[0, 0].legend()

    # 2. Position Coordinates Over Time
    axs[0, 1].plot(times, xs, color='#059669', label='X Position')
    axs[0, 1].plot(times, ys, color='#7c3aed', label='Y Position')
    axs[0, 1].set_title('Position Coordinates over Time')
    axs[0, 1].set_xlabel('Time (s)')
    axs[0, 1].set_ylabel('Coordinate (m)')
    axs[0, 1].grid(True, linestyle='--', alpha=0.5)
    axs[0, 1].legend()

    # 3. System Energy Conservation
    axs[1, 0].plot(times, energies, color='#d97706', linewidth=1.5)
    axs[1, 0].set_title('Total System Energy (Conservation)')
    axs[1, 0].set_xlabel('Time (s)')
    axs[1, 0].set_ylabel('Energy (J)')
    # Adjust Y range to zoom on conservation precision
    energy_min, energy_max = min(energies), max(energies)
    energy_range = max(energy_max - energy_min, 1e-6)
    axs[1, 0].set_ylim(energy_min - 0.15 * energy_range, energy_max + 0.15 * energy_range)
    axs[1, 0].grid(True, linestyle='--', alpha=0.5)

    # 4. Constraint Solver Error
    axs[1, 1].plot(times, errors, color='#dc2626', linewidth=1.2)
    axs[1, 1].set_title('Distance Constraint Error')
    axs[1, 1].set_xlabel('Time (s)')
    axs[1, 1].set_ylabel('Error (m)')
    axs[1, 1].grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    output_plot = 'pendulum_simulation_plot.png'
    plt.savefig(output_plot, dpi=300)
    print(f"Plots successfully generated and saved to: {output_plot}")

if __name__ == '__main__':
    main()
