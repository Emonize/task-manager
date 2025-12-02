import React, { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('myTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStats, setShowStats] = useState(false);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('myTasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        priority: priority,
        dueDate: dueDate
      };
      saveTasks([...tasks, newTask]);
      setInputValue('');
      setDueDate('');
    }
  };

  const toggleComplete = (id) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(newTasks);
  };

  const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    saveTasks(newTasks);
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
  };

  const saveEdit = (id) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { 
        ...task, 
        text: editText,
        priority: editPriority,
        dueDate: editDueDate
      } : task
    );
    saveTasks(newTasks);
    setEditingId(null);
    setEditText('');
    setEditPriority('medium');
    setEditDueDate('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPriority('medium');
    setEditDueDate('');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !task.completed) ||
      (filterStatus === 'completed' && task.completed);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const highPriorityCount = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityCount = tasks.filter(task => task.priority === 'medium' || !task.priority).length;
  const lowPriorityCount = tasks.filter(task => task.priority === 'low').length;

  const highPriorityCompleted = tasks.filter(task => task.priority === 'high' && task.completed).length;
  const mediumPriorityCompleted = tasks.filter(task => (task.priority === 'medium' || !task.priority) && task.completed).length;
  const lowPriorityCompleted = tasks.filter(task => task.priority === 'low' && task.completed).length;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(task => task.dueDate && task.dueDate < today && !task.completed);

  return (
    <div className="App">
      <div className="header">
        <h1>✨ TaskFlow Pro</h1>
        <p className="subtitle">Stay organized. Stay productive.</p>
        <div className="stats">
          <span className="stat-item">📝 {tasks.length} Total</span>
          <span className="stat-item">✅ {completedCount} Done</span>
          <span className="stat-item">⏳ {activeCount} Active</span>
        </div>
        <button onClick={() => setShowStats(!showStats)} className="stats-toggle">
          {showStats ? '📋 Hide Stats' : '📊 Show Stats'}
        </button>
      </div>

      {showStats && (
        <div className="stats-dashboard">
          <div className="stats-card">
            <h3>📈 Overall Progress</h3>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${completionRate}%` }}></div>
            </div>
            <p className="progress-text">{completionRate}% Complete</p>
          </div>

          <div className="stats-grid">
            <div className="stats-card priority-card high">
              <h3>🔴 High</h3>
              <div className="priority-stats">
                <span className="big-number">{highPriorityCount}</span>
              </div>
              <p>{highPriorityCompleted} done</p>
            </div>

            <div className="stats-card priority-card medium">
              <h3>🟡 Medium</h3>
              <div className="priority-stats">
                <span className="big-number">{mediumPriorityCount}</span>
              </div>
              <p>{mediumPriorityCompleted} done</p>
            </div>

            <div className="stats-card priority-card low">
              <h3>🟢 Low</h3>
              <div className="priority-stats">
                <span className="big-number">{lowPriorityCount}</span>
              </div>
              <p>{lowPriorityCompleted} done</p>
            </div>
          </div>

          {overdueTasks.length > 0 && (
            <div className="stats-card overdue-card">
              <h3>⚠️ Overdue Tasks</h3>
              <p className="overdue-count">{overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} overdue!</p>
              <ul className="overdue-list">
                {overdueTasks.map(task => (
                  <li key={task.id}>{task.text} (Due: {task.dueDate})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="What needs to be done?"
          className="task-input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="date-input"
        />
        <button onClick={addTask} className="add-button">+ Add</button>
      </div>

      <div className="search-filter-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search tasks..."
          className="search-input"
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>No tasks yet! Add one to get started.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No tasks match your filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''} priority-${editingId === task.id ? editPriority : (task.priority || 'medium')}`}
            >
              <div className="task-content">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="task-checkbox"
                />
                <div className="task-info">
                  {editingId === task.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-options">
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className="edit-priority-select"
                        >
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🔴 High</option>
                        </select>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="edit-date-input"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="task-text">{task.text}</span>
                      <div className="task-meta">
                        <span className="task-priority">
                          {task.priority === 'high' && '🔴 High'}
                          {task.priority === 'medium' && '🟡 Medium'}
                          {task.priority === 'low' && '🟢 Low'}
                          {!task.priority && '🟡 Medium'}
                        </span>
                        {task.dueDate && (
                          <span className={`task-due-date ${task.dueDate < today && !task.completed ? 'overdue' : ''}`}>
                            📅 {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="task-actions">
                {editingId === task.id ? (
                  <div className="edit-actions">
                    <button onClick={() => saveEdit(task.id)} className="save-button">✅</button>
                    <button onClick={cancelEdit} className="cancel-button">❌</button>
                  </div>
                ) : (
                  <div className="normal-actions">
                    <button onClick={() => startEditing(task)} className="edit-button">✏️</button>
                    <button onClick={() => deleteTask(task.id)} className="delete-button">🗑️</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;