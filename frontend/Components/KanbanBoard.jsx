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
import { Tooltip } from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { useRouter, Link } from "@tanstack/react-router";
import apiClient from "../services/apiClient";
import { compareSync } from "bcryptjs";

// The Component Which Will Actually Display All The Tasks On The Respective Kanban Board......
const TaskCard = ({ id, data, isDragDisabled }) => {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      disabled: isDragDisabled, // 🚫 disable dragging if condition met
      data: { ...data },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragDisabled ? "default" : "grab", // 👈 visual feedback
  };

  // Function To Handle The Edit Of The Task Functionality.....
  function handleEditTask(taskID) {
    router.navigate({ to: `/home/task/update/${taskID}` });
  }

  // Function To Handle The Edit Of The Task Functionality.....
  async function handleDeleteTask(taskID) {
    try {
      const teskDeleted = await apiClient.deleteTask(taskID);
      console.log("Task Updated response:", teskDeleted);

      if (teskDeleted.success) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setData({
        success: false,
        message: "Task Deletion failed in Frontend. Try again later.",
      });
    }
  }

  function handleSubTasksGET(taskID) {
    router.navigate({ to: `/home/subtasks/details/${taskID}` });
  }

  return (
    <div
      ref={setNodeRef}
      {...(!isDragDisabled && attributes)} // 👈 only spread if not disabled
      {...(!isDragDisabled && listeners)} // 👈 only spread if not disabled
      className="card mb-2 shadow-sm text-dark border-0 text-dark"
      style={{ ...style, backgroundColor: "#7a828a" }}
    >
      <div className="card-body px-3 py-2">
        {/* Title + Subtask Count */}
        <div className="d-flex justify-content-between align-items-start flex-column flex-sm-row gap-1 mb-2">
          <p className="fw-semibold mb-0 text-light text-truncate w-100 w-sm-75">
            {data?.title}
          </p>
          <span
            className="text-info small d-flex align-items-center cursor-pointer"
            data-bs-toggle="tooltip"
            title="Click to View Subtasks"
            onClick={() => handleSubTasksGET(id)}
          >
            <i className="fas fa-layer-group me-1"></i>
            {data?.subTask}
          </span>
        </div>

        {/* Description */}
        <p className="text-light-50 small mb-2 text-wrap">
          {data?.description}
        </p>

        {/* Assigned Info */}
        <div className="d-flex flex-wrap align-items-start small text-light mb-2">
          <i
            className="fas fa-user-edit me-1 fs-6"
            style={{ color: "#2c3e50" }}
            data-bs-toggle="tooltip"
            title="Task Owner & Assignee"
          ></i>
          <span className="text-wrap">
            Assigned by{" "}
            <strong className="text-info fw-semibold">
              {data?.assignedBy?._id === data?.currentUser
                ? "You"
                : data?.assignedBy?.username}
            </strong>{" "}
            to{" "}
            <strong style={{ color: "#a3e635", fontWeight: "600" }}>
              {data?.assignedTo?._id === data?.currentUser
                ? "You"
                : data?.assignedTo?.username}
            </strong>
          </span>
        </div>

        {/* Role-based Warning */}
        {(data?.createdBy?._id === data?.currentUser ||
          data?.currentUserRole !== "project_admin") && (
          <p className="text-warning small mb-2">
            <i
              className="fas fa-lock me-2"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Permission restricted"
            ></i>
            Only creator/Admin can move, edit, or delete tasks
          </p>
        )}

        {/* Footer Section */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mt-2">
          {/* Buttons */}
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm btn-info rounded-pill d-flex align-items-center gap-1"
              disabled={
                !(
                  data?.createdBy?._id === data?.currentUser ||
                  data?.currentUserRole === "project_admin"
                )
              }
              data-bs-toggle="tooltip"
              title="Edit Task"
              onClick={() => handleEditTask(id)}
            >
              <i className="fas fa-pen"></i>
              Edit
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center gap-1"
              disabled={
                !(
                  data?.createdBy?._id === data?.currentUser ||
                  data?.currentUserRole === "project_admin"
                )
              }
              data-bs-toggle="tooltip"
              title="Delete Task"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this task?")
                ) {
                  handleDeleteTask(id);
                }
              }}
            >
              <i className="fas fa-trash-alt"></i>
              Delete
            </button>
          </div>

          {/* Created Time */}
          <div
            className="small text-nowrap"
            data-bs-toggle="tooltip"
            title="Created On"
            style={{ color: "#333333" }}
          >
            <i className="fas fa-clock me-1"></i>
            {new Date(data?.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(data?.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// The Section That Represents Each Column In The Kanban Board......
const KanbanColumn = ({ columnId, tasks, shouldDisableDrag }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { isColumn: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-grow-1 ${isOver ? `bg-dark-subtle border-light` : ``}`}
      style={{ minHeight: "70vh" }}
    >
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                data={task.data}
                isDragDisabled={shouldDisableDrag(task)}
              />
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

const KanbanBoard = ({ KanbanBoardTaskData, currentUser }) => {
  const [updationresponse, setupdationresponse] = useState(null);
  const [updating, setupdating] = useState(false);

  console.log("In Kanban Block , Current User:", currentUser);

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

    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );
    tooltipTriggerList.forEach((el) => new Tooltip(el));

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
          currentUser: currentUser?.user?._id,
          currentUserRole: currentUser?.role,
          createdAt: task?.createdAt,
          subTask: task?.subTask || 0,
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
  }, [KanbanBoardTaskData, currentUser]);

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
    const taskId = event.active.id;
    const fromCol = findTaskColumn(taskId);
    const task = columns[fromCol]?.find((t) => t.id === taskId);

    console.log("Dragging task:", task);
    const assignedByUserID = task?.data?.assignedBy?._id;
    const currentUserID = currentUser?.user?._id;

    console.log("Assigned By User ID:", assignedByUserID);
    console.log("Current User ID:", currentUserID);

    // 🛑 Your custom condition here (example: prevent dragging if task is done)
    if (
      assignedByUserID !== currentUserID ||
      currentUser?.role !== "project_admin"
    ) {
      // Cancel drag
      event.active.data.current = null;
      return;
    }

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

  // Function To Only Allow Task Creator And Project Admin To Drag Tasks......
  const shouldDisableDrag = (task) => {
    const assignedByUserID = task?.data?.assignedBy?._id;
    const currentUserID = currentUser?.user?._id;

    return (
      assignedByUserID !== currentUserID ||
      currentUser?.role !== "project_admin"
    );
  };

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
                  <KanbanColumn
                    columnId={columnId}
                    tasks={tasks}
                    shouldDisableDrag={shouldDisableDrag}
                  />
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
