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
import Navbar from "../../../../Components/Navbar.jsx";
import apiClient from "../../../../services/apiClient.js";
import { authStore } from "../../../store/authStore.js";

export const Route = createFileRoute("/home/(tasks)/project/$pid")({
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

  useEffect(() => {
    const getTheProjects = async () => {
      try {
        if (!isLoggedInZustand) {
          console.log("User is not logged in, redirecting to login page...");
          router.navigate({ to: "/login" });
          return;
        }

        const response = await apiClient.getProjectByID(pid);
        setData(response);

        if (response.success) {
          console.log("Project data fetched successfully:", response);
        }
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
      <div className="text-center mt-3">
        <p>The Project Id : {pid}</p>
      </div>
      <div className="flex-grow-1">
        <KanbanBoard />
      </div>
    </div>
  );
}

// === Kanban Component and Helpers ===

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
      className="card mb-2 shadow-sm bg-secondary text-light border-light"
    >
      <div className="card-body p-2 mx-2 my-2">
        <span className="fw-semibold">{id}</span>
      </div>
    </div>
  );
};

const KanbanColumn = ({ columnId, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { isColumn: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-grow-1 ${isOver ? "bg-dark-subtle border-light" : ""}`}
      style={{ minHeight: "70vh" }}
    >
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {tasks.map((task) => (
              <TaskCard key={task} id={task} />
            ))}
          </div>
        ) : (
          <div className="h-100 d-flex align-items-center justify-content-center">
            <em className="text-secondary">Drop tasks here</em>
          </div>
        )}
      </SortableContext>
    </div>
  );
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    todo: ["Design UI", "Design UIX", "Design UIXX", "Write Docs"],
    inProgress: ["Develop Backend"],
    done: ["Setup Project"],
  });
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const findTaskColumn = (taskId) =>
    Object.keys(columns).find((col) => columns[col].includes(taskId));

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

    if (!fromCol || !toCol) return;

    if (fromCol === toCol && !over.data?.current?.isColumn) {
      const oldIndex = columns[fromCol].indexOf(active.id);
      const newIndex = columns[toCol].indexOf(over.id);
      if (oldIndex === newIndex) return;

      setColumns((prev) => ({
        ...prev,
        [fromCol]: arrayMove(prev[fromCol], oldIndex, newIndex),
      }));
    } else {
      setColumns((prev) => {
        const fromTasks = [...prev[fromCol]];
        const toTasks = [...prev[toCol]];

        const taskIndex = fromTasks.indexOf(active.id);
        if (taskIndex !== -1) fromTasks.splice(taskIndex, 1);

        const overIndex = prev[toCol].indexOf(over.id);
        const insertAt = over.data?.current?.isColumn
          ? toTasks.length
          : overIndex;

        toTasks.splice(insertAt, 0, active.id);

        return {
          ...prev,
          [fromCol]: fromTasks,
          [toCol]: toTasks,
        };
      });
    }
  };

  const columnConfig = {
    todo: { title: "To Do", color: "bg-primary" },
    inProgress: { title: "In Progress", color: "bg-warning text-dark" },
    done: { title: "Done", color: "bg-success" },
  };

  return (
    <div className="container-fluid p-4 bg-dark text-light min-vh-100">
      <h2 className="text-center mb-4">🗂️ Kanban Board</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="row">
          {Object.entries(columns).map(([columnId, tasks]) => (
            <div key={columnId} className="col-md-4 mb-3">
              <div
                className="card h-100 bg-dark border-light"
                style={{
                  boxShadow: "0 4px 12px rgba(255, 255, 255, 0.05)",
                }}
              >
                <div
                  className={`card-header text-white border-bottom ${columnConfig[columnId].color}`}
                >
                  <h5 className="m-0 py-2">{columnConfig[columnId].title}</h5>
                </div>
                <div className="card-body p-2 d-flex flex-column mt-2">
                  <KanbanColumn columnId={columnId} tasks={tasks} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div
              className="card shadow-lg bg-secondary text-light border-light"
              style={{ width: "250px" }}
            >
              <div className="card-body p-2">
                <span className="fw-semibold">{activeTask}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
