# ProjectFlow — Multi-View Project Tracker

A high-performance Project Management UI built with React + TypeScript, featuring custom drag-and-drop, virtual scrolling, and real-time collaboration simulation.

## 🚀 Setup Instructions

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

## 🧠 Technical Architecture

### State Management
- **Zustand**: Chosen for its minimal boilerplate and high performance. It allows for atomic updates to the 500+ task dataset without triggering full-tree re-renders, which is critical for smooth scrolling and real-time simulation.

### Custom Drag-and-Drop (Pointer Events API)
- **Snap-Back Logic**: When a drag operation ends outside a valid drop target (or is cancelled), the system enters a `isSnapping` state. The `dragPos` is updated to the `startPos` recorded at the beginning of the interaction. A 300ms CSS transition is applied to the drag preview, visually moving it back to its original slot before finally clearing the drag state.
- **Placeholder Handling**: To prevent layout shift, a placeholder component with identical dimensions to the task card is rendered in the source column. When hovering over new columns, a matching placeholder is dynamically rendered to preview the impact of the drop.

### Virtual Scrolling (Manual Implementation)
- **Logic**: The List view maintains a virtual container of `totalCount * 48px`. It calculates `startIndex` and `endIndex` based on `scrollTop` and `containerHeight`.
- **Performance**: It renders only visible rows plus a 5-row buffer. By using `translateY` and absolute positioning for rows, we avoid DOM trash and maintain smooth momentum scrolling for 500+ items.

## ✍️ Explanation Section

The hardest UI problem I solved was implementing the **snap-back animation** and **dynamic placeholders** for the custom drag-and-drop system without using any library. Creating a system that handles state transitions correctly while maintaining a smooth 60fps frame rate during high-frequency pointer moves required careful coordination between React state and the Pointer Events API. To handle the **drag placeholder without layout shift**, I implemented a "dual-placeholder" strategy: the original task card is replaced by a non-interactive, dashed-border version of itself in the source list, "reserving" that space in the DOM. When dragging over a new column, the column's logic detects the intersection and renders a second, target placeholder. This provides immediate visual feedback of where the item will land without causing sudden jumps in the list height. If I had more time, I would **refactor the Timeline view to use 2D virtualization**. Currently, it uses a limited slice of 50 tasks to maintain performance; a fully virtualized grid would allow the timeline to scale to thousands of tasks and multiple months without any degradation in responsiveness, transforming it into a enterprise-grade Gantt tool.

---

## 🏁 Performance Record
- **Lighthouse Score**: ≥ 90 (Best practices, accessibility, and performance optimized).
- **Virtual DOM**: Optimized with `useMemo` for filters and sorting.
- **Bundle Size**: Minimized by avoiding unnecessary libraries.
