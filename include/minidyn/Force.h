#pragma once
#include "minidyn/RigidBody.h"

namespace minidyn {

class IForceElement {
public:
    virtual ~IForceElement() = default;
    virtual void apply() = 0;
    virtual const char* typeName() const = 0;
};

class Gravity : public IForceElement {
public:
    Gravity(RigidBody& body, double g = -9.81) : body_(body), g_(g) {}
    void apply() override { body_.applyForce(Vec3(0, body_.mass() * g_, 0)); }
    const char* typeName() const override { return "Gravity"; }

private:
    RigidBody& body_;
    double g_;
};

class SpringDamper : public IForceElement {
public:
    SpringDamper(RigidBody& a, RigidBody& b, double restLength, double stiffness, double damping)
        : a_(a), b_(b), restLength_(restLength), k_(stiffness), c_(damping) {}

    void apply() override {
        Vec3 delta = b_.position() - a_.position();
        double len = delta.norm();
        if (len < 1e-9) return;
        Vec3 dir = delta * (1.0 / len);

        double stretch = len - restLength_;
        Vec3 relVel = b_.velocity() - a_.velocity();
        double closingSpeed = relVel.dot(dir);

        double forceMag = k_ * stretch + c_ * closingSpeed;
        Vec3 force = dir * forceMag;

        a_.applyForce(force);
        b_.applyForce(force * -1.0);
    }
    const char* typeName() const override { return "SpringDamper"; }

private:
    RigidBody& a_;
    RigidBody& b_;
    double restLength_, k_, c_;
};

}  

