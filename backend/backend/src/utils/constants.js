export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

// AvailableUserRoles holds: ["admin", "project_admin", "member"]
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

// AvailableTaskStatuses holds: ["todo", "in_progress", "done"]
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);
