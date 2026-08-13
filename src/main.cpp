#include "minidyn/World.h"
#include <fstream>
#include <iostream>

using namespace minidyn;

int main() {
    World world;

    auto& bob = world.addBody(std::make_unique<RigidBody>("bob", 1.0, Vec3(1.0, 0.0, 0.0)));
    world.addForce(std::make_unique<Gravity>(bob));
    world.addConstraint(std::make_unique<DistanceConstraint>(bob, Vec3(0, 0, 0), 1.0));

    const double dt = 0.001;
    const int steps = 5000;  

    std::ofstream csv("pendulum_trace.csv");
    csv << "t,x,y,energy,constraint_error\n";

    for (int i = 0; i <= steps; ++i) {
        double t = i * dt;
        csv << t << "," << bob.position().x << "," << bob.position().y << ","
            << world.totalEnergy(9.81) << "," << (bob.position().norm() - 1.0) << "\n";
        world.step(dt);
    }

    std::cout << "Simulated " << steps << " steps. Trace written to pendulum_trace.csv\n";
    std::cout << "Final bob position: (" << bob.position().x << ", " << bob.position().y << ")\n";
    return 0;
}
