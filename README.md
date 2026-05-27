# 🚀 Auto Vectorization in Compiler Design using SIMD Visualization

A futuristic full-stack compiler visualization platform that demonstrates how modern compilers perform **Auto Vectorization** using **SIMD (Single Instruction Multiple Data)** optimization techniques.

This project transforms normal scalar C/C++ loops into visually understandable vectorized representations while comparing performance improvements through interactive dashboards, animations, and real-time analysis.

---

# 🌌 Features

## ✨ Modern Cyberpunk UI
- Dark glassmorphism dashboard
- Neon blue/purple futuristic theme
- Responsive design
- Smooth Framer Motion animations
- Real-time telemetry inspired UI

---

# 🧠 Core Functionalities

## 🔍 Loop & Dependency Analysis
- Detects loops automatically
- Performs dependency analysis
- Identifies vectorizable loops
- Detects memory conflicts

---

## ⚡ Scalar → SIMD Transformation

Converts scalar execution into simplified vectorized code representations.

### Scalar Code

```cpp
for(int i=0; i<n; i++) {
    c[i] = a[i] + b[i];
}
```

### Vectorized Representation

```cpp
for(int i=0; i<n; i += 4) {

    c[i]   = a[i]   + b[i];
    c[i+1] = a[i+1] + b[i+1];
    c[i+2] = a[i+2] + b[i+2];
    c[i+3] = a[i+3] + b[i+3];
}
```

---

## 📊 Performance Visualization
- Execution time comparison
- Speedup ratio
- CPU usage simulation
- Real-time performance charts

---

## 🎞️ SIMD Visualization Engine

Visual demonstration of:

### Scalar Execution

```text
A0+B0
A1+B1
A2+B2
A3+B3
```

### SIMD Parallel Execution

```text
[A0 A1 A2 A3]
+
[B0 B1 B2 B3]
↓
[C0 C1 C2 C3]
```

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Tailwind CSS
- Framer Motion
- Monaco Editor
- Recharts

## Backend
- Python (Flask/FastAPI)
- C++
- GCC/LLVM Integration

---

# 🧱 Project Architecture

```text
User Code Input
       ↓
Frontend Code Editor
       ↓
Backend API
       ↓
Loop Detection & Dependency Analysis
       ↓
Compiler Optimization Analysis
       ↓
Vectorization Engine
       ↓
Visualization + Performance Dashboard
```

---

# 📂 Project Structure

```text
auto-vectorization-compiler/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── charts/
│   └── animations/
│
├── backend/
│   ├── api/
│   ├── analyzer/
│   ├── compiler/
│   └── server.py
│
├── cpp-modules/
│   ├── dependency_checker.cpp
│   ├── loop_parser.cpp
│   └── vectorization_engine.cpp
│
├── docs/
│
├── README.md
│
└── package.json
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-team/auto-vectorization-compiler.git
```

---

# 📦 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🐍 Backend Setup

```bash
cd backend

pip install -r requirements.txt

python server.py
```

---

# 🖥️ GCC/LLVM Requirements

Install GCC and LLVM:

## Ubuntu

```bash
sudo apt install gcc clang llvm
```

---

# 🚀 Compiler Optimization Flags

The backend uses:

```bash
-O3
-ftree-vectorize
-fopt-info-vec
```

---

# 📈 Example Workflow

## Step 1
Paste C/C++ code into editor

## Step 2
System analyzes loops and dependencies

## Step 3
Vectorizable lines are highlighted

## Step 4
Scalar code transforms into SIMD representation

## Step 5
Performance graphs compare optimization gains

---

# 🎯 Educational Goals

This project helps students understand:

- Compiler optimizations
- SIMD architecture
- Loop unrolling
- Parallel execution
- Auto-vectorization
- Dependency analysis

WITHOUT requiring low-level assembly knowledge.

---

# 🔥 Future Scope

- AI-guided compiler optimization
- GPU vectorization support
- Live LLVM IR generation
- Advanced compiler passes
- WebAssembly integration
- ML-based optimization prediction

---

# 📸 UI Highlights

✅ Cyberpunk Dashboard  
✅ Glassmorphism Panels  
✅ Real-time Charts  
✅ Animated SIMD Execution  
✅ Scalar vs Vectorized Comparison  
✅ Compiler Optimization Insights  

---

# 👨‍💻 Team

## Team Name
VectorCore Labs

### Team Lead
Rachit

---

# 📄 License

MIT License

---

# 🌟 Final Vision

This project aims to transform compiler optimization learning into an interactive visual experience where users can SEE how compilers optimize code internally using SIMD vectorization techniques.
