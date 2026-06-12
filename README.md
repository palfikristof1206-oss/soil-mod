# Soil Mod (Sandboxels Expansion + Mod Loader)

Overview

This repository contains a combined system of a Sandboxels expansion mod and a custom JavaScript-based mod loader engine. The project extends the Sandboxels simulation with new soil mechanics, biological systems, weather interactions, and crop growth logic, while also providing a runtime mod loading framework with registry management and UI support.

The system is designed to dynamically load external mods, register new elements into the Sandboxels engine, and synchronize them with a runtime registry and UI palette system.


---

Project Structure

The repository consists of two main parts:

1. Soil Expansion Mod (game content layer)


2. Mod Loader Engine (runtime system)




---

Soil Expansion Mod

Core Features

Organic materials

humus

compost

manure

peat


Soil types

rich_soil

fertile_soil

moist_soil

sandy_soil

rich_mud

eroded_soil

compacted_soil

super_fertile_soil


Nutrients and chemistry

fertilizer_n

fertilizer_p

fertilizer_k

lime

acidic_soil

neutral_soil

alkaline_soil


Biological systems

mycorrhiza

earthworm (in expansion logic)


Machines

composter


Weather system

rain_cloud element

dynamic rain simulation


Crops

wheat_seed

tomato_seed

potato_seed



---

Mechanics

Reaction system

Elements interact through defined reactions such as:

sand → dirt / humus / sandy_soil

water → compost / rich_soil / humus

fertilizers → super_fertile_soil



---

Growth system

Plant growth depends on soil type:

super_fertile_soil: highest growth rate

rich_soil: high growth rate

moist_soil: medium growth rate

eroded_soil: minimal growth rate



---

Environmental simulation

Soil erosion over time

Nutrient depletion

Soil compaction from heavy materials

Weather-based water spawning



---

Ecosystem interactions

Mycorrhiza improves soil fertility

Earthworms improve soil quality

Composting system converts organic matter into compost



---

# Mod Loader Engine

Purpose

The mod loader provides a runtime system for loading external JavaScript mods into Sandboxels and registering them as new elements.


---

Core components

Element registry

All Sandboxels elements are stored in:

window.elements


Additional metadata:

__registry (tracking system)

__categories (UI grouping)



---

Runtime registry

A secondary system tracks all registered elements at runtime for synchronization and debugging.


---

Mod loading pipeline

1. Fetch mod from URL


2. Execute code using dynamic function wrapper


3. Register elements via registerElement()


4. Sync to registry and UI


5. Update palette and trigger UI refresh




---

Execution environment

Mods are executed using a controlled function context with access to:

window

elements

registerElement

behaviors

console



---

Persistence

Mod URLs are stored in localStorage

Mods are restored automatically on boot



---

UI system

The loader includes an overlay interface with:

Mod URL input

Mod list display

Load controls

Toggle button

Console output panel



---

Refresh system

The engine triggers UI and palette updates using:

rebuildPalette()

updatePalette()

window resize event



---

Automatic registry synchronization

A background process ensures that all elements in memory are registered into the runtime system and UI categories.


---

Integration with Sandboxels

The system extends Sandboxels by injecting:

new elements

new reactions

tick-based behaviors

growth and environmental simulation systems


All additions are registered dynamically at runtime and appear in the Sandboxels palette after synchronization.


---

Notes

The system relies on dynamic JavaScript execution (new Function)

Mods must be hosted in raw-accessible URLs

Proper palette refresh may be required depending on engine state

The system assumes Sandboxels global objects such as pixelMap, behaviors, and changePixel are available



---

Summary

This project is a combined Sandboxels modding framework and content expansion pack. It provides both:

a full ecosystem simulation mod (soil, biology, weather, crops)

a runtime mod loader with registry, UI, and dynamic execution support
