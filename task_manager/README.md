# Task Manager

A simple task manager board built with HTML, CSS, vanilla JavaScript, and browser Local Storage.

## Features

- Add, edit, and delete tasks
- Move tasks between Pending, In Progress, and Completed through the edit form
- Store tasks in `localStorage`, so they survive a page refresh
- Basic required-title validation
- Responsive three-column board and modal form

## Run locally

No installation or backend is required. Open `index.html` in a browser, or serve this folder with any static file server.

## Git workflow for the assignment

The GitHub and teamwork requirements are process requirements and cannot be completed from the browser app itself. Use a two-person repository workflow such as:

1. Keep the initial project on `main`, then create feature branches such as `feature/ui` and `feature/task-management`.
2. Make small commits with clear messages, push each branch, and open a Pull Request.
3. Have the teammate review the PR, request or make changes, then merge it into `main`.
4. Pull `main` locally before continuing work.
5. To demonstrate conflict resolution, both teammates can edit the same README section on separate branches. Merge one branch, pull it, merge the second branch locally, resolve the conflict, then commit the resolution and push it.

Example commands:

```bash
git switch -c feature/task-management
git add task_manager/
git commit -m "Implement task management board"
git push -u origin feature/task-management
```