#pragma once
#include "minidyn/RigidBody.h"

namespace minidyn {

class IConstraint {
public:
    virtual ~IConstraint() = default;
    virtual void solve(double dt) = 0;
    virtual double error() const = 0;  
};

class DistanceConstraint : public IConstraint {
public:
    DistanceConstraint(RigidBody& body, Vec3 anchor, double length)
        : body_(body), anchor_(anchor), length_(length) {}

    void solve(double /*dt*/) override {
        Vec3 delta = body_.position() - anchor_;
        double dist = delta.norm();
        if (dist < 1e-9) return;
        Vec3 dir = delta * (1.0 / dist);

        double c = dist - length_;  
        const double beta = 0.2;
        Vec3 correction = dir * (-beta * c);
        body_.setPosition(body_.position() + correction);
        double vAlongDir = body_.velocity().dot(dir);
        if (vAlongDir > 0) {
            body_.setVelocity(body_.velocity() - dir * vAlongDir);
        }
    }

    double error() const override {
        return (body_.position() - anchor_).norm() - length_;
    }

private:
    RigidBody& body_;
    Vec3 anchor_;
    double length_;
};

}  

