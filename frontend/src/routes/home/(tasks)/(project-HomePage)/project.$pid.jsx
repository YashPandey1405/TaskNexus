// My Main Project Display Page For The Kanban Board......

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "bootstrap/dist/css/bootstrap.min.css";

import { createFileRoute, useRouter } from "@tanstack/react-router";
import Navbar from "../../../../../Components/Navbar.jsx";
import apiClient from "../../../../../services/apiClient.js";
import { authStore } from "../../../../store/authStore.js";

export const Route = createFileRoute(
  "/home/(tasks)/(project-HomePage)/project/$pid",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { pid } = Route.useParams();
  console.log("Project ID from params:", pid);

  const [data, setData] = useState(null);
  const [formdatavalues, setformdatavalues] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [isProjectUpdated, setisProjectUpdated] = useState(false);

  const isLoggedInZustand = authStore((state) => state.isLoggedIn);
  const loggedInUserIdZustand = authStore((state) => state.loggedInUserId);

  // UseEffect to fetch project data and the Related Tasks Of The Project.....
  useEffect(() => {
    const getTheProjects = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        // const response = await apiClient.getProjectByID(pid);
        // setData(response);

        // if (response.success) {
        //   console.log("Project data fetched successfully:", response);
        // }
      } catch (error) {
        setData({
          success: false,
          message: "User Not Logged In failed. Try again later.",
        });
      }
    };

    getTheProjects();
  }, [router, isLoggedInZustand]);

  return (
    <div className="min-vh-100 bg-dark text-white d-flex flex-column">
      <Navbar />
      <div className="text-center">{/* <p>The Project Id : {pid}</p> */}</div>
      <div className="flex-grow-1">
        <KanbanBoard />
      </div>
    </div>
  );
}

// === Kanban Component and Helpers ===

// The Component Which Will Actually Display All The Tasks On The Respective Kanban Board......
const TaskCard = ({ id, data }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: { ...data }, // ✅ spread all task data
    });

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
      className="card mb-2 shadow-sm bg-secondary text-light border-light"
    >
      <div className="card-body p-1 mx-2 my-2">
        <span className="fw-semibold">
          <p>{data.title}</p>
          {/* <p>{id}, Hello Yash Pandey Here</p>
          <p>{id}, Hello Yash Pandey Here</p> */}
        </span>
      </div>
    </div>
  );
};

// The Section That Represents Each Column In The Kanban Board......
const KanbanColumn = ({ columnId, tasks }) => {
  // Register the column as a drop zone
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { isColumn: true },
  });

  // The UI Which Is Been Displayed For Each Column In The Kanban Board......
  // It uses the SortableContext to make the tasks sortable within the column.
  // If the column is empty, it shows a placeholder message.
  return (
    // This connects the column to the dnd-kit's internal drag-and-drop system.
    <div
      ref={setNodeRef}
      className={`flex-grow-1 ${isOver ? `bg-dark-subtle border-light` : ``}`}
      style={{ minHeight: "70vh" }}
    >
      {/* This is a component from @dnd-kit/sortable that wraps all sortable items inside a droppable zone.*/}
      {/*items={tasks} tells dnd-kit what order these tasks are currently in.*/}
      {/*strategy={verticalListSortingStrategy} means the tasks should be treated as a vertical list when sorting. */}
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {/* If there are tasks, map over them and render a TaskCard for each one. */}
        {tasks.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {/* Your Actual Block Which Loads The Task On The Kanban Board..... */}
            {tasks.map((task) => (
              // key={task}: a unique identifier for React's internal list rendering optimization
              // id={task}: used by useSortable({ id }) inside TaskCard to make it draggable.
              <TaskCard key={task.id} id={task.id} data={task.data} />
            ))}
          </div>
        ) : (
          <div className="h-100 d-flex align-items-center justify-content-center">
            {/* UI To Display Empty Board When there Are No Tasks */}
            <em className="text-secondary">Drop tasks here</em>
          </div>
        )}
      </SortableContext>
    </div>
  );
};

const KanbanBoard = () => {
  // using UseState to manage the state of the Kanban board.....
  const [columns, setColumns] = useState({
    todo: [
      {
        id: "1",
        data: {
          title: "Design UI",
          description: "Create the initial layout for the dashboard",
          priority: "High",
        },
      },
      {
        id: "2",
        data: {
          title: "Design UIX",
          description: "Improve user experience elements",
          priority: "Medium",
        },
      },
    ],
    inProgress: [
      {
        id: "3",
        data: {
          title: "Develop Backend",
          description: "Build APIs and database models",
          priority: "High",
        },
      },
    ],
    done: [
      {
        id: "4",
        data: {
          title: "Setup Project",
          description: "Initialize GitHub repo and install dependencies",
          priority: "Low",
        },
      },
    ],
  });
  const [activeTask, setActiveTask] = useState({});

  // This configures the DnD sensor — only start dragging if pointer moves 5px.......
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // Used to find which column a dragged task currently belongs to......
  const findTaskColumn = (taskId) =>
    Object.keys(columns).find((col) =>
      columns[col].some((task) => task.id === taskId),
    );

  // Sets the active task being dragged......
  const handleDragStart = (event) => {
    setActiveTask({
      id: event.active.id,
      title: event?.active?.data?.current?.title || "Untitled Task",
    });
    console.log("Dragging task:", event.active);
  };

  // The Actual Drag-and-Drop Logic : Gets fromCol and toCol
  // If it's the same column, reorder task within
  // If different, remove from old column and insert into new one
  // 🧠 This is the core drag-and-drop logic.

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const fromCol = findTaskColumn(active.id);
    const toCol = over.data?.current?.isColumn
      ? over.id
      : findTaskColumn(over.id);

    if (!fromCol || !toCol) return;

    if (fromCol === toCol && !over.data?.current?.isColumn) {
      const oldIndex = columns[fromCol].findIndex(
        (task) => task.id === active.id,
      );
      const newIndex = columns[toCol].findIndex((task) => task.id === over.id);
      if (oldIndex === newIndex) return;

      setColumns((prev) => ({
        ...prev,
        [fromCol]: arrayMove(prev[fromCol], oldIndex, newIndex),
      }));
    } else {
      setColumns((prev) => {
        const fromTasks = [...prev[fromCol]];
        const toTasks = [...prev[toCol]];

        const taskIndex = fromTasks.findIndex((task) => task.id === active.id);
        if (taskIndex === -1) return prev;

        const [movedTask] = fromTasks.splice(taskIndex, 1);

        const overIndex = prev[toCol].findIndex((task) => task.id === over.id);
        const insertAt = over.data?.current?.isColumn
          ? toTasks.length
          : overIndex;

        toTasks.splice(insertAt, 0, movedTask);

        return {
          ...prev,
          [fromCol]: fromTasks,
          [toCol]: toTasks,
        };
      });
    }
  };

  // Style And UI Configuration for the Kanban Board Columns......
  const columnConfig = {
    todo: { title: "To Do", color: "bg-primary" },
    inProgress: { title: "In Progress", color: "bg-warning text-dark" },
    done: { title: "Done", color: "bg-success" },
  };

  // Render the Kanban Board with DnD Context and DragOverlay......
  return (
    <div className="container-fluid px-4 bg-dark text-light min-vh-100">
      <h2 className="text-center mb-4">🗂️ Kanban Board</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="row mx-1">
          {/* Used Map Function To Design Each Kanban Board */}
          {Object.entries(columns).map(([columnId, tasks]) => (
            // col-12 → Takes full width (100%) on extra-small screens (less than 576px).
            // col-sm-4 → Takes 4/12 (i.e., 1/3 width) on small screens and up (≥576px).
            <div key={columnId} className="col-sm-4 mb-3">
              <div
                className="card h-100 bg-dark border-light"
                style={{
                  boxShadow: `0 2px 4px rgba(255, 255, 255, 0.04), 0 6px 10px rgba(255, 255, 255, 0.06), 0 12px 20px rgba(255, 255, 255, 0.08)`,
                }}
              >
                <div
                  className={`card-header text-white border-bottom ${columnConfig[columnId].color}`}
                >
                  <h5 className="m-0 py-2">{columnConfig[columnId].title}</h5>
                </div>
                <div className="card-body p-2 d-flex flex-column mt-2 px-2">
                  <KanbanColumn columnId={columnId} tasks={tasks} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* To render a floating preview of the item that is currently being dragged. */}
        <DragOverlay>
          {activeTask && (
            <div
              className="card shadow-lg bg-secondary text-light border-light"
              style={{ width: "250px" }}
            >
              <div className="card-body p-2">
                <span className="fw-semibold">{activeTask.title}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
