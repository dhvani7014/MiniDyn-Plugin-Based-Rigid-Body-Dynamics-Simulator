#include "minidyn/World.h"
#include <emscripten/bind.h>
#include <cmath>

class PendulumSim {
public:
    PendulumSim(double gravity, double length, double initialAngle) {
        // Initial bob position based on the anchor at (0, 0)
        double x = length * std::sin(initialAngle);
        double y = -length * std::cos(initialAngle);
        
        auto bobBody = std::make_unique<minidyn::RigidBody>("bob", 1.0, minidyn::Vec3(x, y, 0.0));
        bob_ = bobBody.get();
        world_.addBody(std::move(bobBody));
        
        // Gravity force (negative since gravity acts downward along the y-axis)
        auto gravityForce = std::make_unique<minidyn::Gravity>(*bob_, -gravity);
        world_.addForce(std::move(gravityForce));
        
        // Distance constraint anchoring bob to (0, 0) with the given length
        auto distConstraint = std::make_unique<minidyn::DistanceConstraint>(*bob_, minidyn::Vec3(0, 0, 0), length);
        constraint_ = distConstraint.get();
        world_.addConstraint(std::move(distConstraint));
        
        gravityVal_ = gravity;
        length_ = length;
    }
    
    void step(double dt) {
        world_.step(dt);
    }
    
    double getX() const { return bob_->position().x; }
    double getY() const { return bob_->position().y; }
    double getEnergy() const { return world_.totalEnergy(gravityVal_); }
    double getConstraintError() const { return constraint_->error(); }
    
private:
    minidyn::World world_;
    minidyn::RigidBody* bob_;
    minidyn::DistanceConstraint* constraint_;
    double gravityVal_;
    double length_;
};

EMSCRIPTEN_BINDINGS(minidyn_sim) {
    emscripten::class_<PendulumSim>("PendulumSim")
        .constructor<double, double, double>()
        .function("step", &PendulumSim::step)
        .function("getX", &PendulumSim::getX)
        .function("getY", &PendulumSim::getY)
        .function("getEnergy", &PendulumSim::getEnergy)
        .function("getConstraintError", &PendulumSim::getConstraintError);
}
