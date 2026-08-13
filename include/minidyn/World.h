#pragma once
#include "minidyn/RigidBody.h"
#include "minidyn/Force.h"
#include "minidyn/Constraint.h"
#include <memory>
#include <vector>

namespace minidyn {

class World {
public:
    RigidBody& addBody(std::unique_ptr<RigidBody> body) {
        bodies_.push_back(std::move(body));
        return *bodies_.back();
    }

    void addForce(std::unique_ptr<IForceElement> f) { forces_.push_back(std::move(f)); }
    void addConstraint(std::unique_ptr<IConstraint> c) { constraints_.push_back(std::move(c)); }

    void step(double dt) {
        for (auto& b : bodies_) b->clearForces();
        for (auto& f : forces_) f->apply();
        for (auto& b : bodies_) b->integrate(dt);
        for (auto& c : constraints_) c->solve(dt);
    }

    double totalEnergy(double gravity) const {
        double e = 0.0;
        for (auto& b : bodies_) e += b->kineticEnergy() + b->potentialEnergy(gravity);
        return e;
    }

    const std::vector<std::unique_ptr<RigidBody>>& bodies() const { return bodies_; }

private:
    std::vector<std::unique_ptr<RigidBody>> bodies_;
    std::vector<std::unique_ptr<IForceElement>> forces_;
    std::vector<std::unique_ptr<IConstraint>> constraints_;
};

}  

