import React, { useState } from 'react';
import './App.css';

function App() {
  // Load tasks from storage when app starts
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('myTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [inputValue, setInputValue] = useState('');
    const addTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      localStorage.setItem('myTasks', JSON.stringify(newTasks));
      setInputValue('');
    }
  
  };

    const toggleComplete = (id) => {
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    localStorage.setItem('myTasks', JSON.stringify(newTasks));
  };

    const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
    localStorage.setItem('myTasks', JSON.stringify(newTasks));
  };

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="App">
      <div className="header">
        <h1>✨ My Task Manager</h1>
        <p className="subtitle">Stay organized and productive!</p>
        <div className="stats">
          <span className="stat-item">
            📝 Total: {tasks.length}
          </span>
          <span className="stat-item">
            ✅ Done: {completedCount}
          </span>
          <span className="stat-item">
            ⏳ Remaining: {tasks.length - completedCount}
          </span>
        </div>
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="What needs to be done? ✍️"
          className="task-input"
        />
        <button onClick={addTask} className="add-button">
          ➕ Add
        </button>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>No tasks yet! Add one to get started.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-content">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="task-checkbox"
                />
                <span className="task-text">{task.text}</span>
              </div>
              <button 
                onClick={() => deleteTask(task.id)}
                className="delete-button"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;