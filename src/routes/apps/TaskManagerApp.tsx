import { JSX } from "solid-js";

const TaskManagerApp = (): JSX.Element => (
  <div class="h-full overflow-auto p-4">
    <h2 class="text-xl font-bold mb-2">Task Manager</h2>
    <p class="mb-2">A simple and elegant task manager app.</p>
    <a
      href="https://github.com/yourname/task-manager"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sky-600 hover:underline"
    >
      View Project
    </a>
  </div>
);

export default TaskManagerApp;
