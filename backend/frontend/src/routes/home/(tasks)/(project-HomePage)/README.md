# 🗂️ Kanban Board – Drag & Drop with DnD Kit and TanStack Router

Welcome to the **Kanban Board** project!
In this README, I’ll walk you through the complete structure of the codebase, explaining each section in detail so you can understand, maintain, and extend the application with ease. This board supports **drag-and-drop task organization** and is powered by the `@dnd-kit` library for smooth interactivity.

---

## 📁 Project Structure & Purpose

This project is structured with **TanStack Router** for routing and uses `@dnd-kit` to handle drag-and-drop interactions between multiple Kanban columns (`To Do`, `In Progress`, and `Done`). This is ideal for managing tasks visually.

---

## 🚦 Routing with TanStack Router

```ts
export const Route = createFileRoute("/home/(tasks)/project/$pid")({
  component: RouteComponent,
});
```

### Explanation:

- We're using **TanStack File-Based Routing** here.
- The route path `/home/(tasks)/project/$pid` dynamically picks up the `pid` (project ID) from the URL.
- The associated React component is `RouteComponent`.

---

## 🧠 The Main Logic – `RouteComponent`

```jsx
function RouteComponent() {
  const { pid } = Route.useParams();
  const router = useRouter();
```

### 🔍 What’s happening here?

- We're accessing the `pid` (project ID) from the URL.
- We also grab the router instance for redirecting users if needed.

```jsx
useEffect(() => {
  const getTheProjects = async () => {
    if (!isLoggedInZustand) {
      router.navigate({ to: "/login" });
      return;
    }

    const response = await apiClient.getProjectByID(pid);
    setData(response);
  };

  getTheProjects();
}, [router, isLoggedInZustand]);
```

### ✅ What's this doing?

- This ensures that if the user is **not logged in**, they are redirected.
- If logged in, it fetches the project by ID and sets it in local state.

---

## 🔄 Kanban UI + Drag and Drop

The core Kanban UI lives inside the `KanbanBoard` component.

---

## 1️⃣ TaskCard Component

```jsx
const TaskCard = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="card ..."
    >
      <div className="card-body">
        <span>{id}</span>
      </div>
    </div>
  );
};
```

### What does this do?

- Makes each task **draggable and sortable**.
- Applies animated movement with `transform` and `transition` during dragging.
- `useSortable` comes from `@dnd-kit/sortable`.

---

## 2️⃣ KanbanColumn Component

```jsx
const KanbanColumn = ({ columnId, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId, data: { isColumn: true } });

  return (
    <div ref={setNodeRef} className={...}>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map(task => <TaskCard key={task} id={task} />)}
      </SortableContext>
    </div>
  );
};
```

### Why this exists:

- Each column (`todo`, `inProgress`, `done`) is a **drop zone** for tasks.
- `SortableContext` wraps the list so `@dnd-kit` can rearrange them smoothly.
- `isOver` provides a hover effect when dragging over the column.

---

## 3️⃣ DragOverlay – Beautiful UX

```jsx
<DragOverlay>
  {activeTask && (
    <div className="card">
      <div className="card-body">
        <span>{activeTask}</span>
      </div>
    </div>
  )}
</DragOverlay>
```

### What this does:

- When a task is being dragged, this renders a **"ghost" floating preview** of it.
- This helps the user **visually track** what they're moving.
- Controlled by `activeTask` which is updated on drag start.

---

## 4️⃣ Main KanbanBoard Component

```jsx
const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    todo: ["Design UI", "Write Docs"],
    inProgress: ["Develop Backend"],
    done: ["Setup Project"],
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
```

### Features here:

- Tasks are stored in a **column-based structure**: `{ columnId: [task1, task2] }`.
- Sensors listen for **mouse/touch input** for drag events.

### 📦 Logic for Dragging:

```jsx
const handleDragStart = (event) => {
  setActiveTask(event.active.id);
};

const handleDragEnd = (event) => {
  const { active, over } = event;
  setActiveTask(null);

  if (!over || active.id === over.id) return;

  const fromCol = findTaskColumn(active.id);
  const toCol = over.data?.current?.isColumn
    ? over.id
    : findTaskColumn(over.id);

  if (fromCol === toCol && !over.data?.current?.isColumn) {
    const oldIndex = columns[fromCol].indexOf(active.id);
    const newIndex = columns[toCol].indexOf(over.id);

    setColumns((prev) => ({
      ...prev,
      [fromCol]: arrayMove(prev[fromCol], oldIndex, newIndex),
    }));
  } else {
    // Cross-column movement
    const fromTasks = [...columns[fromCol]];
    const toTasks = [...columns[toCol]];

    fromTasks.splice(fromTasks.indexOf(active.id), 1);

    const overIndex = columns[toCol].indexOf(over.id);
    const insertAt = over.data?.current?.isColumn ? toTasks.length : overIndex;

    toTasks.splice(insertAt, 0, active.id);

    setColumns((prev) => ({
      ...prev,
      [fromCol]: fromTasks,
      [toCol]: toTasks,
    }));
  }
};
```

### 🧠 Summary of Drag Behavior:

- Detects where a task came from and where it’s dropped.
- If moved within the same column → uses `arrayMove`.
- If moved across columns → removes from one and adds to another.
- Supports dropping on a task or at the end of a column.

---

## 🎨 Styling & Bootstrap

We use Bootstrap classes throughout:

- `card`, `shadow`, `bg-dark`, `text-light`, etc. to maintain a **modern dark theme**.
- `container-fluid` and `row` for layout.

---

## 🧩 How to Inject API Data Instead of Hardcoded Tasks

Currently, tasks are like:

```js
const [columns, setColumns] = useState({
  todo: ["Task 1", "Task 2"],
  ...
});
```

To inject your backend API:

```jsx
useEffect(() => {
  async function fetchTasks() {
    const response = await apiClient.getTasksByProjectId(pid);
    const fetchedTasks = response.data;

    // Convert fetched data to column format
    const newColumns = {
      todo: fetchedTasks.filter((t) => t.status === "todo").map((t) => t.title),
      inProgress: fetchedTasks
        .filter((t) => t.status === "inProgress")
        .map((t) => t.title),
      done: fetchedTasks.filter((t) => t.status === "done").map((t) => t.title),
    };

    setColumns(newColumns);
  }

  fetchTasks();
}, []);
```

---

## ✅ Summary

| Feature                               | Implemented |
| ------------------------------------- | ----------- |
| File-based Routing via TanStack       | ✅          |
| Authentication check and redirect     | ✅          |
| Drag-and-Drop (DnD Kit)               | ✅          |
| Overlay preview of dragged task       | ✅          |
| Per-column droppables                 | ✅          |
| Task rearranging & cross-column moves | ✅          |
| Easy integration with backend data    | ✅          |

---

## 🙌 Final Thoughts

This setup gives you a production-level Kanban board foundation that’s:

- Visually modern
- Extensible with real API
- Backed by modern tools like **DnD Kit** and **TanStack Router**

> If you’d like help integrating your backend tasks (with `title`, `id`, `status`, etc.), feel free to reach out or continue reading the advanced section.
