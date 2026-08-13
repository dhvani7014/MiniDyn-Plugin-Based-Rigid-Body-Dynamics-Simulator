cmake_minimum_required(VERSION 3.16)
project(MiniDyn CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(APPLE)
    # Check if the command line tools C++ standard headers directory is broken and fall back to SDK
    if(EXISTS "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1")
        include_directories(SYSTEM "/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include/c++/v1")
    endif()
endif()

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

add_compile_options(-Wall -Wextra)

# --- Core library ---------------------------------------------------------
add_library(minidyn_core INTERFACE)
target_include_directories(minidyn_core INTERFACE ${CMAKE_SOURCE_DIR}/include)

# --- Demo executable -------------------------------------------------------
add_executable(minidyn_demo src/main.cpp)
target_link_libraries(minidyn_demo PRIVATE minidyn_core)

# --- Tests -------------------------------------------------------------
option(MINIDYN_BUILD_TESTS "Build unit tests" ON)
if(MINIDYN_BUILD_TESTS)
    include(FetchContent)
    FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.14.0
    )
    # Windows: force shared CRT so gtest matches the rest of the build.
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)

    enable_testing()
    add_executable(minidyn_tests tests/test_pendulum.cpp)
    target_link_libraries(minidyn_tests PRIVATE minidyn_core GTest::gtest_main)
    include(GoogleTest)
    gtest_discover_tests(minidyn_tests)
endif()
