#include <gtest/gtest.h>
#include "minidyn/World.h"
#include <cmath>

using namespace minidyn;

TEST(PendulumTest, ConstraintStaysSatisfied) {
    World world;
    auto& bob = world.addBody(std::make_unique<RigidBody>("bob", 1.0, Vec3(0.05, -0.999, 0.0)));
    world.addForce(std::make_unique<Gravity>(bob));
    auto constraint = std::make_unique<DistanceConstraint>(bob, Vec3(0, 0, 0), 1.0);
    DistanceConstraint* rawConstraint = constraint.get();
    world.addConstraint(std::move(constraint));

    const double dt = 0.001;
    for (int i = 0; i < 3000; ++i) {
        world.step(dt);
        EXPECT_NEAR(rawConstraint->error(), 0.0, 1e-2);
    }
}

TEST(PendulumTest, PeriodMatchesSmallAngleTheory) {
    World world;
    const double length = 1.0;
    const double g = 9.81;
    const double startX = 0.05;  

    auto& bob = world.addBody(std::make_unique<RigidBody>(
        "bob", 1.0, Vec3(startX, -std::sqrt(length * length - startX * startX), 0.0)));
    world.addForce(std::make_unique<Gravity>(bob, -g));
    world.addConstraint(std::make_unique<DistanceConstraint>(bob, Vec3(0, 0, 0), length));

    const double dt = 0.0005;
    const double expectedPeriod = 2.0 * M_PI * std::sqrt(length / g);

    double t = 0.0;
    bool crossedZero = false;
    double firstZeroCrossingTime = -1.0;
    double prevX = bob.position().x;

    while (t < expectedPeriod * 1.5) {
        world.step(dt);
        t += dt;
        double x = bob.position().x;
        if (!crossedZero && t > expectedPeriod * 0.25 && prevX > 0 && x <= 0) {
            crossedZero = true;
            firstZeroCrossingTime = t;
        }
        prevX = x;
    }

    ASSERT_TRUE(crossedZero) << "Pendulum never swung through center";
    double measuredPeriod = firstZeroCrossingTime * 4.0;
    EXPECT_NEAR(measuredPeriod, expectedPeriod, expectedPeriod * 0.1);
}

TEST(RigidBodyTest, FreeFallMatchesKinematics) {
    RigidBody body("free", 2.0, Vec3(0, 10, 0));
    Gravity g(body, -9.81);

    const double dt = 0.0001;
    double t = 0.0;
    while (t < 0.5) {
        body.clearForces();
        g.apply();
        body.integrate(dt);
        t += dt;
    }

    double expectedVy = -9.81 * 0.5;
    EXPECT_NEAR(body.velocity().y, expectedVy, 0.01);
}

