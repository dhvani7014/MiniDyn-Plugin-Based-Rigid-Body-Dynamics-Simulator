#pragma once
#include "minidyn/Vec3.h"
#include <string>

namespace minidyn {

class RigidBody {
public:
    RigidBody(std::string name, double mass, Vec3 position)
        : name_(std::move(name)), mass_(mass), position_(position) {}

    void applyForce(const Vec3& f) { forceAccum_ += f; }
    void clearForces() { forceAccum_ = Vec3(); }

    void integrate(double dt) {
        Vec3 accel = forceAccum_ * (1.0 / mass_);
        velocity_ += accel * dt;
        position_ += velocity_ * dt;
    }

    double kineticEnergy() const { return 0.5 * mass_ * velocity_.dot(velocity_); }
    double potentialEnergy(double gravity) const { return mass_ * gravity * position_.y; }

    const std::string& name() const { return name_; }
    double mass() const { return mass_; }
    Vec3 position() const { return position_; }
    Vec3 velocity() const { return velocity_; }
    void setPosition(const Vec3& p) { position_ = p; }
    void setVelocity(const Vec3& v) { velocity_ = v; }

private:
    std::string name_;
    double mass_;
    Vec3 position_;
    Vec3 velocity_;
    Vec3 forceAccum_;
};

}  

