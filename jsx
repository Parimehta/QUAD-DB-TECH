import React, { useState, useEffect } from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider, useDispatch, useSelector } from "react-redux";
import thunk from "redux-thunk";

// Redux Setup
const initialState = {
  tasks: [],
};

const taskReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  taskState: taskReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

// Thunk for Fetching Tasks from API
const fetchTasks = () => async (dispatch) => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
    const data = await response.json();
    const formattedTasks = data.map((task) => ({
      id: task.id,
      name: task.title,
      priority: "Medium",
    }));
    dispatch({ type: "SET_TASKS", payload: formattedTasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
};

// Components
const TaskInput = () => {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const dispatch = useDispatch();

  const handleAddTask = () => {
    if (taskName.trim()) {
      const newTask = { id: Date.now(), name: taskName, priority };
      dispatch({ type: "ADD_TASK", payload: newTask });
      setTaskName("");
    } else {
      alert("Task name cannot be empty!");
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Enter task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        style={{ flex: 1, padding: "10px" }}
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: "10px" }}>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <button
        onClick={handleAddTask}
        style={{ padding: "10px", backgroundColor: "#28a745", color: "#fff", border: "none" }}
      >
        Add Task
      </button>
    </div>
  );
};

const TaskList = () => {
  const tasks = useSelector((state) => state.taskState.tasks);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleDeleteTask = (id) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  };

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <span>{task.name}</span>
          <span
            style={{
              backgroundColor:
                task.priority === "High" ? "#dc3545" : task.priority === "Medium" ? "#ffc107" : "#28a745",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
            }}
          >
            {task.priority}
          </span>
          <button
            onClick={() => handleDeleteTask(task.id)}
            style={{ backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "5px 10px" }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <div
        style={{
          maxWidth: "600px",
          margin: "20px auto",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#343a40" }}>To-Do App</h1>
        <TaskInput />
        <TaskList />
      </div>
    </Provider>
  );
};

export default App;
