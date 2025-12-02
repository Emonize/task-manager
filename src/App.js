import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabase';

function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // View Mode: 'personal' or 'groups'
  const [viewMode, setViewMode] = useState('personal');
  
  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStats, setShowStats] = useState(false);

  // Groups State
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);

  // Comments State
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Activity & Notifications
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mobile menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // ============================================
  // AUTH & INITIALIZATION
  // ============================================

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTasks();
      loadGroups();
      loadNotifications();
    } else {
      setTasks([]);
      setGroups([]);
      setProfile(null);
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.id);
      loadGroupTasks(selectedGroup.id);
      loadActivities(selectedGroup.id);
    }
  }, [selectedGroup]);

  // ============================================
  // LOAD FUNCTIONS
  // ============================================

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .is('group_id', null)
      .order('created_at', { ascending: false });
    
    if (!error) {
      setTasks(data || []);
    }
  };

  const loadGroupTasks = async (groupId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    
    if (!error) {
      setTasks(data || []);
    }
  };

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setGroups(data || []);
    }
  };

  const loadGroupMembers = async (groupId) => {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles:user_id (id, email, display_name, avatar_url)
      `)
      .eq('group_id', groupId);
    
    if (!error) {
      setGroupMembers(data || []);
    }
  };

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error) {
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    }
  };

  const loadActivities = async (groupId) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        profiles:user_id (display_name, email)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!error) {
      setActivities(data || []);
    }
  };

  const loadComments = async (taskId) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (display_name, email, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (!error) {
      setComments(data || []);
    }
  };

  // ============================================
  // AUTH HANDLERS
  // ============================================

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError('Check your email for confirmation link!');
    }
    setAuthLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setAuthError(error.message);
  };

  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin }
    });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTasks([]);
    setGroups([]);
    setSelectedGroup(null);
    setViewMode('personal');
  };

  // ============================================
  // TASK HANDLERS
  // ============================================

  const addTask = async () => {
    if (inputValue.trim() === '' || !user) return;

    const newTask = {
      user_id: user.id,
      text: inputValue,
      completed: false,
      priority: priority,
      due_date: dueDate || null,
      status: taskStatus,
      group_id: selectedGroup?.id || null,
      assigned_to: assignedTo.length > 0 ? assignedTo : null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select();

    if (!error && data) {
      setTasks([data[0], ...tasks]);
      setInputValue('');
      setDueDate('');
      setAssignedTo([]);
      setTaskStatus('pending');

      // Log activity if in a group
      if (selectedGroup) {
        await logActivity(selectedGroup.id, data[0].id, 'created', {
          task_text: inputValue
        });
      }
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'completed' : 'pending';

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted, status: newStatus })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, completed: newCompleted, status: newStatus } : t
      ));

      // Log activity and notify if in a group
      if (task.group_id && newCompleted) {
        await logActivity(task.group_id, id, 'completed', {
          task_text: task.text
        });
        await notifyGroupMembers(task.group_id, 'task_completed', 
          `${profile?.display_name || user.email} completed: ${task.text}`);
      }
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    const task = tasks.find(t => t.id === id);
    const completed = newStatus === 'completed';

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, status: newStatus, completed } : t
      ));

      if (task.group_id) {
        await logActivity(task.group_id, id, `status_${newStatus}`, {
          task_text: task.text,
          new_status: newStatus
        });
      }
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) {
      setTasks(tasks.filter(t => t.id !== id));

      if (task.group_id) {
        await logActivity(task.group_id, id, 'deleted', {
          task_text: task.text
        });
      }
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.due_date || '');
    setEditStatus(task.status || 'pending');
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        text: editText,
        priority: editPriority,
        due_date: editDueDate || null,
        status: editStatus,
        completed: editStatus === 'completed'
      })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t =>
        t.id === id ? { 
          ...t, 
          text: editText, 
          priority: editPriority, 
          due_date: editDueDate,
          status: editStatus,
          completed: editStatus === 'completed'
        } : t
      ));
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPriority('medium');
    setEditDueDate('');
    setEditStatus('pending');
  };

  // ============================================
  // GROUP HANDLERS
  // ============================================

  const createGroup = async () => {
    if (newGroupName.trim() === '' || !user) return;

    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name: newGroupName,
        description: newGroupDescription,
        created_by: user.id
      }])
      .select();

    if (!error && data) {
      // Add creator as admin member
      await supabase.from('group_members').insert([{
        group_id: data[0].id,
        user_id: user.id,
        role: 'admin'
      }]);

      setGroups([data[0], ...groups]);
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateGroup(false);
    }
  };

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setViewMode('groups');
  };

  const leaveGroup = async () => {
    if (!selectedGroup || !user) return;

    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', selectedGroup.id)
      .eq('user_id', user.id);

    setGroups(groups.filter(g => g.id !== selectedGroup.id));
    setSelectedGroup(null);
    setViewMode('personal');
    loadTasks();
  };

  const addMember = async () => {
    if (memberEmail.trim() === '' || !selectedGroup) return;

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', memberEmail.toLowerCase())
      .single();

    if (userError || !userData) {
      alert('User not found. Make sure they have signed up first!');
      return;
    }

    // Add to group
    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: selectedGroup.id,
        user_id: userData.id,
        role: 'member'
      }]);

    if (error) {
      if (error.code === '23505') {
        alert('User is already a member of this group!');
      } else {
        alert('Error adding member');
      }
    } else {
      await loadGroupMembers(selectedGroup.id);
      setMemberEmail('');
      setShowAddMember(false);

      // Notify the new member
      await supabase.from('notifications').insert([{
        user_id: userData.id,
        type: 'group_invite',
        title: 'Added to Group',
        message: `You were added to "${selectedGroup.name}"`,
        data: { group_id: selectedGroup.id }
      }]);
    }
  };

  const removeMember = async (memberId) => {
    if (!selectedGroup) return;

    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', selectedGroup.id)
      .eq('user_id', memberId);

    await loadGroupMembers(selectedGroup.id);
  };

  // ============================================
  // COMMENTS HANDLERS
  // ============================================

  const openComments = async (task) => {
    setSelectedTaskForComments(task);
    await loadComments(task.id);
  };

  const closeComments = () => {
    setSelectedTaskForComments(null);
    setComments([]);
    setNewComment('');
  };

  const addComment = async () => {
    if (newComment.trim() === '' || !selectedTaskForComments) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        task_id: selectedTaskForComments.id,
        user_id: user.id,
        content: newComment
      }])
      .select(`
        *,
        profiles:user_id (display_name, email, avatar_url)
      `);

    if (!error && data) {
      setComments([...comments, data[0]]);
      setNewComment('');

      // Log activity if group task
      if (selectedTaskForComments.group_id) {
        await logActivity(selectedTaskForComments.group_id, selectedTaskForComments.id, 'commented', {
          task_text: selectedTaskForComments.text,
          comment: newComment.substring(0, 50)
        });
      }
    }
  };

  // ============================================
  // ACTIVITY & NOTIFICATIONS
  // ============================================

  const logActivity = async (groupId, taskId, action, details) => {
    await supabase.from('activity_logs').insert([{
      group_id: groupId,
      task_id: taskId,
      user_id: user.id,
      action,
      details
    }]);
  };

  const notifyGroupMembers = async (groupId, type, message) => {
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', user.id);

    if (members) {
      const notifications = members.map(m => ({
        user_id: m.user_id,
        type,
        title: 'Task Update',
        message,
        data: { group_id: groupId }
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    }
  };

  const markNotificationRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id);

    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // ============================================
  // FILTERS & COMPUTED
  // ============================================

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && task.status === 'pending') ||
      (filterStatus === 'in-progress' && task.status === 'in-progress') ||
      (filterStatus === 'completed' && task.status === 'completed') ||
      (filterStatus === 'active' && !task.completed) ||
      (filterStatus === 'done' && task.completed);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(task => task.due_date && task.due_date < today && !task.completed);

  // ============================================
  // RENDER: LOADING
  // ============================================

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-icon">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: AUTH SCREEN
  // ============================================

  if (!user) {
    return (
      <div className="App">
        <div className="auth-container">
          <h1>✨ TaskFlow Pro</h1>
          <p className="auth-subtitle">Collaborate & conquer your tasks</p>
          
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              minLength="6"
              required
            />
            
            {authError && <p className="auth-error">{authError}</p>}
            
            <button type="submit" className="auth-button" disabled={authLoading}>
              {authLoading ? '⏳ Loading...' : (authMode === 'login' ? '🔑 Log In' : '📝 Sign Up')}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === 'login' ? (
              <>Don't have an account? <button onClick={() => setAuthMode('signup')} className="switch-btn">Sign Up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setAuthMode('login')} className="switch-btn">Log In</button></>
            )}
          </p>

          <div className="social-divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button onClick={handleGoogleLogin} className="google-btn">Sign in with Google</button>
            <button onClick={handleFacebookLogin} className="facebook-btn">Sign in with Facebook</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN APP
  // ============================================

  return (
    <div className="App">
      {/* Comments Modal */}
      {selectedTaskForComments && (
        <div className="modal-overlay" onClick={closeComments}>
          <div className="modal comments-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 Comments</h3>
              <button className="close-btn" onClick={closeComments}>✕</button>
            </div>
            <p className="comment-task-title">{selectedTaskForComments.text}</p>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.profiles?.display_name || comment.profiles?.email}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="comment-input-container">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComment()}
                placeholder="Write a comment..."
                className="comment-input"
              />
              <button onClick={addComment} className="comment-send-btn">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal notifications-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔔 Notifications</h3>
              <button className="close-btn" onClick={() => setShowNotifications(false)}>✕</button>
            </div>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllNotificationsRead}>
                Mark all as read
              </button>
            )}
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications</p>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                    onClick={() => markNotificationRead(notif.id)}
                  >
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-date">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👥 Create Group</h3>
              <button className="close-btn" onClick={() => setShowCreateGroup(false)}>✕</button>
            </div>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="modal-input"
            />
            <textarea
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="Description (optional)"
              className="modal-textarea"
            />
            <button onClick={createGroup} className="modal-button">Create Group</button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Member</h3>
              <button className="close-btn" onClick={() => setShowAddMember(false)}>✕</button>
            </div>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Member's email"
              className="modal-input"
            />
            <button onClick={addMember} className="modal-button">Add to Group</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div className="user-info">
            <span className="user-email">👤 {profile?.display_name || user.email}</span>
            <button 
              className="notification-btn" 
              onClick={() => setShowNotifications(true)}
            >
              🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            <button onClick={handleLogout} className="logout-btn">🚪</button>
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            ☰
          </button>
        </div>
        <h1>✨ TaskFlow Pro</h1>
        <p className="subtitle">
          {viewMode === 'personal' ? 'Your personal tasks' : selectedGroup?.name || 'Select a group'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className={`nav-tabs ${showMobileMenu ? 'show' : ''}`}>
        <button
          className={`nav-tab ${viewMode === 'personal' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('personal');
            setSelectedGroup(null);
            loadTasks();
            setShowMobileMenu(false);
          }}
        >
          📋 My Tasks
        </button>
        <button
          className={`nav-tab ${viewMode === 'groups' && !selectedGroup ? 'active' : ''}`}
          onClick={() => {
            setViewMode('groups');
            setSelectedGroup(null);
            setShowMobileMenu(false);
          }}
        >
          👥 Groups
        </button>
        {groups.map(group => (
          <button
            key={group.id}
            className={`nav-tab group-tab ${selectedGroup?.id === group.id ? 'active' : ''}`}
            onClick={() => {
              selectGroup(group);
              setShowMobileMenu(false);
            }}
          >
            📁 {group.name}
          </button>
        ))}
        <button className="nav-tab create-tab" onClick={() => setShowCreateGroup(true)}>
          ➕ New Group
        </button>
      </div>

      {/* Groups List View */}
      {viewMode === 'groups' && !selectedGroup && (
        <div className="groups-view">
          <h2>Your Groups</h2>
          {groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No groups yet. Create one to collaborate!</p>
              <button onClick={() => setShowCreateGroup(true)} className="create-group-btn">
                ➕ Create Group
              </button>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group.id} className="group-card" onClick={() => selectGroup(group)}>
                  <h3>{group.name}</h3>
                  <p>{group.description || 'No description'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Group Header */}
      {selectedGroup && (
        <div className="group-header">
          <div className="group-info">
            <h2>{selectedGroup.name}</h2>
            <p>{selectedGroup.description}</p>
          </div>
          <div className="group-actions">
            <button onClick={() => setShowAddMember(true)} className="add-member-btn">
              ➕ Add Member
            </button>
            <button onClick={leaveGroup} className="leave-group-btn">
              🚪 Leave
            </button>
          </div>
          <div className="members-list">
            <span className="members-label">Members:</span>
            {groupMembers.map(member => (
              <span key={member.id} className="member-chip">
                {member.profiles?.display_name || member.profiles?.email}
                {member.role === 'admin' && ' 👑'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {(viewMode === 'personal' || selectedGroup) && (
        <div className="stats-bar">
          <span className="stat-item">📝 {tasks.length} Total</span>
          <span className="stat-item">⏳ {pendingCount} Pending</span>
          <span className="stat-item">🔄 {inProgressCount} In Progress</span>
          <span className="stat-item">✅ {completedCount} Done</span>
          <button onClick={() => setShowStats(!showStats)} className="stats-toggle">
            {showStats ? '📋 Hide' : '📊 Stats'}
          </button>
        </div>
      )}

      {/* Stats Dashboard */}
      {showStats && (viewMode === 'personal' || selectedGroup) && (
        <div className="stats-dashboard">
          <div className="stats-card">
            <h3>📈 Progress</h3>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${completionRate}%` }}></div>
            </div>
            <p className="progress-text">{completionRate}% Complete</p>
          </div>

          {overdueTasks.length > 0 && (
            <div className="stats-card overdue-card">
              <h3>⚠️ Overdue</h3>
              <p>{overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} overdue!</p>
            </div>
          )}
        </div>
      )}

      {/* Activity Log (for groups) */}
      {selectedGroup && activities.length > 0 && (
        <div className="activity-section">
          <h3>📜 Recent Activity</h3>
          <div className="activity-list">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="activity-user">
                  {activity.profiles?.display_name || 'Someone'}
                </span>
                <span className="activity-action">
                  {activity.action === 'created' && '➕ created'}
                  {activity.action === 'completed' && '✅ completed'}
                  {activity.action === 'commented' && '💬 commented on'}
                  {activity.action === 'deleted' && '🗑️ deleted'}
                  {activity.action === 'status_in-progress' && '🔄 started'}
                </span>
                <span className="activity-task">
                  {activity.details?.task_text?.substring(0, 30)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Input */}
      {(viewMode === 'personal' || selectedGroup) && (
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
          <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
            className="status-select"
          >
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Done</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="date-input"
          />
          <button onClick={addTask} className="add-button">+ Add</button>
        </div>
      )}

      {/* Assign to (for group tasks) */}
      {selectedGroup && groupMembers.length > 0 && (
        <div className="assign-container">
          <span className="assign-label">Assign to:</span>
          {groupMembers.map(member => (
            <label key={member.id} className="assign-checkbox">
              <input
                type="checkbox"
                checked={assignedTo.includes(member.user_id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAssignedTo([...assignedTo, member.user_id]);
                  } else {
                    setAssignedTo(assignedTo.filter(id => id !== member.user_id));
                  }
                }}
              />
              {member.profiles?.display_name || member.profiles?.email}
            </label>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      {(viewMode === 'personal' || selectedGroup) && (
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
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>
      )}

      {/* Task List */}
      {(viewMode === 'personal' || selectedGroup) && (
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
                className={`task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 'medium'} status-${task.status || 'pending'}`}
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
                            className="edit-select"
                          >
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                          </select>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="edit-select"
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="in-progress">🔄 In Progress</option>
                            <option value="completed">✅ Done</option>
                          </select>
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="edit-date"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="task-text">{task.text}</span>
                        <div className="task-meta">
                          <span className={`task-status status-${task.status || 'pending'}`}>
                            {task.status === 'pending' && '⏳ Pending'}
                            {task.status === 'in-progress' && '🔄 In Progress'}
                            {task.status === 'completed' && '✅ Done'}
                            {!task.status && '⏳ Pending'}
                          </span>
                          <span className="task-priority">
                            {task.priority === 'high' && '🔴'}
                            {task.priority === 'medium' && '🟡'}
                            {task.priority === 'low' && '🟢'}
                            {!task.priority && '🟡'}
                          </span>
                          {task.due_date && (
                            <span className={`task-due-date ${task.due_date < today && !task.completed ? 'overdue' : ''}`}>
                              📅 {task.due_date}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  {editingId === task.id ? (
                    <>
                      <button onClick={() => saveEdit(task.id)} className="save-btn">✅</button>
                      <button onClick={cancelEdit} className="cancel-btn">❌</button>
                    </>
                  ) : (
                    <>
                      <select
                        value={task.status || 'pending'}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="quick-status-select"
                      >
                        <option value="pending">⏳</option>
                        <option value="in-progress">🔄</option>
                        <option value="completed">✅</option>
                      </select>
                      <button onClick={() => openComments(task)} className="comment-btn">💬</button>
                      <button onClick={() => startEditing(task)} className="edit-btn">✏️</button>
                      <button onClick={() => deleteTask(task.id)} className="delete-btn">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;