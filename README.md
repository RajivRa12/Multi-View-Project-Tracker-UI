# 🚀 ProjectFlow - Multi-View Project Tracker UI

A high-performance, feature-rich Project Management UI built for excellence.

## ✨ Advanced Features

- **Multi-View Architecture**: Synchronized state across three views:
  - **🟦 Kanban Board**: Drag-and-drop task status management.
  - **📋 Virtualized List**: 60fps scrolling for 500+ tasks using manual virtualization.
  - **📊 Timeline View**: Dynamic zoom (Month, Week, 3-Day) with coordinate mapping.
- **Custom Drag-and-Drop**: Built from scratch using the native **Pointer Events API** (No external libraries). Features smooth snap-back animations and dynamic placeholders.
- **Real-time Collaboration Simulation**: Dynamic agents viewing tasks with stacked avatars and visual activity indicators.
- **Global Search & Highlighting**: Instant filtering across all views with live title hit highlighting.
- **Activity Audit Trail**: Chronological history of all task status updates in a slide-out side panel.
- **Theme Engine**: Seamless Dark/Light mode support with glassmorphism aesthetics.
- **Productivity Hotkeys**: `Cmd+K` (Search), `Cmd+H` (History), `1, 2, 3` (View switching).

## 🛠 Tech Stack

- **Framework**: `React 19` + `TypeScript`
- **Styling**: `Tailwind CSS 4`
- **State Management**: `Zustand` (Atomic updates)
- **Icons**: `Lucide React`
- **Performance**: Native DOM APIs for DnD and Virtual Scrolling.

## 🏃 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```

3. **Build Producton**:
   ```bash
   npm run build
   ```

## 🎯 Architecture Insights

The project utilizes a **centralized Zustand store** to maintain a single source of truth for all task data, filters, and UI states. This ensures that switching views is instant and requires no data re-fetching. The **custom DnD system** avoids the overhead of large libraries like `dnd-kit`, providing a lightweight and highly performant interaction surface.

---
*Created as part of Velozity Global Solutions Technical Hiring Assessment.*
