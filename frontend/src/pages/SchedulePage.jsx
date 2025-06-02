
import CreateTaskForm from "../components/CreateTaskForm";
import TaskList from "../components/TaskList";

const SchedulePage = () => {
 
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Schedule Tasks</h2>
      <CreateTaskForm />
      <hr className="my-6" />
      <TaskList />
    </div>
  );
};

export default SchedulePage;
