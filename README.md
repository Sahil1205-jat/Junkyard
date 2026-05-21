# ⚙️ Junkyard Simulator

![Junkyard Simulator](/public/favicon.svg)

**Junkyard Simulator** is a high-fidelity, interactive 3D engineering platform built with React and Three.js. It allows users to drag and drop mechanical and electrical components onto a virtual workbench, connect them with simulated wires, transfer physical torque via belts, and even write live JavaScript firmware to control the hardware logic in real-time.

---

## ✨ Key Features

- **Interactive 3D Sandbox:** Drop components like DC Motors, Batteries, LEDs, and Microcontrollers onto a virtual workbench.
- **Electrical Graph Engine:** Connect terminals using virtual wiring. A BFS-based graph solver mathematically calculates current flow and dynamically powers components on the board.
- **Mechanical Torque Engine:** Connect spinning shafts using mechanical belts (yellow). If a motor spins, linked gears and wheels will animate in physical sync.
- **Firmware Execution Loop:** Select a Microcontroller and write live Arduino-style JavaScript (`digitalWrite(0, true)`, `digitalRead(1)`) into the built-in HUD editor. The simulation executes your code 10 times a second.
- **Robust Physics & History:** A sophisticated Time-Travel Undo/Redo stack that saves your component positions and circuit graphs. Components can be dragged freely in the X/Z plane using `CTRL + Drag`, and locked into place with `CTRL + C`.

---

## 🛠️ Technology Stack

- **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **3D Graphics:** [Three.js](https://threejs.org/)
- **React-Three Integration:** [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) & [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling:** Custom Vanilla CSS (Cyberpunk Engineering Lab aesthetic)

---

## 🚀 Local Setup & Installation

Follow these steps to get the simulator running on your local machine.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/Sahil1205-jat/Junkyard.git
cd Junkyard/junkyard
```

### 3. Install Dependencies
Install all the necessary React and Three.js libraries using `npm`:
```bash
npm install
```

### 4. Start the Development Server
Launch the local Vite server:
```bash
npm run dev
```

### 5. Access the Simulator
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🎮 How to Play / Controls Manual

| Action | Shortcut / Instruction |
| :--- | :--- |
| **Spawn Component** | Drag any component from the left inventory directly onto the main 3D workbench. |
| **Select Component** | Click on any component on the board to select it. |
| **Rotate Object** | Click on a component, then use the 3D circular gizmo rings to rotate it freely. |
| **Move Object** | Hold `CTRL` and **Click & Drag** directly on the component. |
| **Lock / Unlock** | Select an object and press `CTRL + C`. (A red lock block will appear, preventing movement or deletion). |
| **Delete** | Select an object and press `DELETE` or `BACKSPACE`. |
| **Wire Engine** | Click and drag from a Red (Pos) or Blue (Neg) pin to another pin to route electricity. |
| **Mechanical Belts**| Click and drag between Yellow shaft pins to transfer RPM between spinning objects. |
| **Firmware Editor** | Drop a `Microcontroller Board` and select it. Use the side-panel editor to write logic. Changes apply instantly. |

---

## 📂 Project Structure

- `src/components/Canvas.jsx`: The core engine of the app. Handles rendering 3D models, logic routing, state history, and firmware execution loops.
- `src/components/ControlPanel.jsx`: The top navigation bar and logo UI.
- `src/components/ScrapHeap.jsx`: The left-side draggable inventory panel.
- `src/index.css`: Global styling and UI theming variables.

---

> **Design Aesthetic:** The UI has been heavily customized to resemble a clean, high-tech engineering laboratory interface, leveraging glassmorphism, dynamic lighting, and strict orthographic camera perspectives.
