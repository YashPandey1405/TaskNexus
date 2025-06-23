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

import apiClient from "../services/apiClient";

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

const KanbanBoard = ({ KanbanBoardTaskData }) => {
  const [updationresponse, setupdationresponse] = useState(null);
  const [updating, setupdating] = useState(false);

  // 🎯 Local state to manage columns and currently active (dragging) task
  const [columns, setColumns] = useState({
    todo: [],
    in_progress: [],
    done: [],
  });
  const [activeTask, setActiveTask] = useState(null);

  // 📦 Populate Kanban Board based on incoming data prop (KanbanBoardTaskData)
  useEffect(() => {
    if (!Array.isArray(KanbanBoardTaskData)) return;

    const KanbanBoardData = {
      todo: [],
      in_progress: [],
      done: [],
    };

    // 🧹 Format tasks into expected structure and sort into columns
    KanbanBoardTaskData.forEach((task) => {
      const formattedTask = {
        id: task?._id,
        data: {
          title: task?.title,
          description: task?.description,
          project: task?.project,
          assignedTo: task?.assignedTo,
          assignedBy: task?.assignedBy,
          status: task?.status,
          createdAt: task?.createdAt,
          subTask: task?.subTask?.totalSubTasksInTask || 0,
        },
      };

      if (task?.status === "todo") KanbanBoardData.todo.push(formattedTask);
      else if (task?.status === "in_progress")
        KanbanBoardData.in_progress.push(formattedTask);
      else if (task?.status === "done")
        KanbanBoardData.done.push(formattedTask);
    });

    // 🪄 Update local state with newly structured data
    setColumns(KanbanBoardData);
  }, [KanbanBoardTaskData]);

  // 🧲 Configure drag sensors (trigger drag only after pointer moves 5px)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // 🔍 Find which column a task belongs to by its ID
  const findTaskColumn = (taskId) =>
    Object.keys(columns).find((col) =>
      columns[col].some((task) => task.id === taskId),
    );

  // 🎬 When dragging starts, set the activeTask to display a floating preview
  const handleDragStart = (event) => {
    setActiveTask({
      id: event.active.id,
      title: event?.active?.data?.current?.title || "Untitled Task",
    });
  };

  // 🧠 Core drag-and-drop logic
  // Handles reordering within the same column or moving to another column
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const fromCol = findTaskColumn(active.id);
    const toCol = over.data?.current?.isColumn
      ? over.id
      : findTaskColumn(over.id);
    if (!fromCol || !toCol) return;

    // 🔁 Reorder within same column
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
    }
    // 🚚 Move task between columns
    else {
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

        // ✅ Trigger backend API call here (fire and forget or await)
        // <-- 👇 You define this function below
        updateTaskStatus(movedTask.id, toCol);

        return {
          ...prev,
          [fromCol]: fromTasks,
          [toCol]: toTasks,
        };
      });
    }
  };

  //   Function to update task status in the backend
  // It Will be called when a task is moved between columns
  async function updateTaskStatus(taskId, newStatus) {
    try {
      setupdating(true);
      console.log("Updating task status:", taskId, newStatus);
      const response = await apiClient.quickUpdateState(taskId, newStatus);

      setupdationresponse(response.data);

      if (response.success) {
        console.log("Task Status Changed successfully:", response);
      }

      // ✅ Force spinner to stay for 2 seconds
      setTimeout(() => {
        setupdating(false); // Hide spinner after delay
      }, 1000);
    } catch (error) {
      setupdationresponse({
        success: false,
        message: "User Not Logged In. Try again later.",
      });
    }
  }

  // 🎨 Column headers config with Bootstrap classes
  const columnConfig = {
    todo: { title: "To Do", color: "bg-primary" },
    in_progress: { title: "In Progress", color: "bg-warning text-dark" },
    done: { title: "Done", color: "bg-success" },
  };

  // 🧩 Render the Kanban board using DnD context and column mapping
  return (
    <div className="container-fluid px-4 bg-dark text-light min-vh-100">
      {/* Spinner Overlay When Updating Task Status */}
      {updating && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light fs-5 fw-semibold">Updating Task Status...</p>
        </div>
      )}

      <h2 className="text-center mb-4">🗂️ Kanban Board</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="row mx-1">
          {/* 🧱 Render Each Column */}
          {Object.entries(columns).map(([columnId, tasks]) => (
            <div key={columnId} className="col-sm-4 mb-3">
              <div
                className="card h-100 bg-dark border-light"
                style={{
                  boxShadow:
                    "0 2px 4px rgba(255, 255, 255, 0.04), 0 6px 10px rgba(255, 255, 255, 0.06), 0 12px 20px rgba(255, 255, 255, 0.08)",
                }}
              >
                <div
                  className={`card-header text-white border-bottom ${columnConfig[columnId].color}`}
                >
                  <h5 className="m-0 py-2">{columnConfig[columnId].title}</h5>
                </div>
                <div className="card-body p-2 d-flex flex-column mt-2 px-2">
                  {/* 🧩 Pass individual task lists to KanbanColumn */}
                  <KanbanColumn columnId={columnId} tasks={tasks} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 👆 Floating card preview of the currently dragged task */}
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

export default KanbanBoard;
