import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUsers, FiSettings, FiRotateCcw } from 'react-icons/fi';
import { format } from 'date-fns';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    loading, 
    filter, 
    fetchTasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion, 
    setFilter, 
    getFilteredTasks 
  } = useTask();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  
  // Admin-specific state
  const [adminView, setAdminView] = useState('tasks'); // 'tasks' or 'users'
  const [allTasks, setAllTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Admin functions
  const fetchAdminData = async () => {
    try {
      setAdminLoading(true);
      console.log('Fetching admin data...');
      console.log('Current user:', user);
      console.log('Auth token exists:', !!localStorage.getItem('token'));
      
      // Try each API call individually to see which one fails
      let statsResponse, tasksResponse, usersResponse;
      
      try {
        console.log('Fetching dashboard stats...');
        statsResponse = await axios.get('/api/admin/dashboard');
        console.log('Stats response:', statsResponse.data);
        setDashboardStats(statsResponse.data);
      } catch (error) {
        console.error('Stats API failed:', error.response?.data || error.message);
      }
      
      try {
        console.log('Fetching all tasks from all users...');
        // Use regular tasks endpoint which works reliably for admin users
        tasksResponse = await axios.get('/api/tasks');
        console.log('Tasks response:', tasksResponse.data);
        console.log('First task user data:', tasksResponse.data.tasks?.[0]?.userId);
        
        // Ensure we have user data populated
        const tasksWithUsers = tasksResponse.data.tasks || [];
        console.log('Tasks with user data:', tasksWithUsers.map(t => ({ 
          title: t.title, 
          userId: t.userId,
          userEmail: t.userId?.email,
          userName: t.userId?.firstName || t.userId?.username,
          userRole: t.userId?.role
        })));
        
        setAllTasks(tasksWithUsers);
      } catch (error) {
        console.error('Tasks API failed:', error.response?.data || error.message);
        console.error('Error status:', error.response?.status);
        console.error('Error details:', error.response);
        
        // If we get route not found, the backend might not be running
        if (error.response?.status === 404) {
          alert('Backend server is not running or routes are not available. Please start the backend server.');
        }
      }
      
      try {
        console.log('Fetching admin users...');
        usersResponse = await axios.get('/api/admin/users?limit=1000');
        console.log('Users response:', usersResponse.data);
        setAllUsers(usersResponse.data.users || []);
      } catch (error) {
        console.error('Users API failed:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.error('General error fetching admin data:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin delete task
  const handleAdminDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`/api/admin/tasks/${taskId}`);
      setAllTasks(allTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Delete task error:', error);
      alert('Failed to delete task');
    }
  };

  // Admin toggle task status
  const handleAdminToggleTask = async (taskId, completed) => {
    try {
      console.log('Toggling task:', taskId, 'to completed:', completed);
      
      // Use the toggle endpoint which is specifically designed for this
      const response = await axios.patch(`/api/tasks/${taskId}/toggle`);
      console.log('Toggle response:', response.data);
      
      // Update the local state immediately
      setAllTasks(allTasks.map(task => 
        task._id === taskId ? { ...task, completed: !task.completed } : task
      ));
      
      console.log('Task status toggled successfully');
    } catch (error) {
      console.error('Toggle task error:', error);
      
      // Fallback: try regular update endpoint
      try {
        console.log('Trying regular update endpoint...');
        const updateResponse = await axios.put(`/api/tasks/${taskId}`, { completed });
        console.log('Update response:', updateResponse.data);
        
        setAllTasks(allTasks.map(task => 
          task._id === taskId ? { ...task, completed } : task
        ));
        console.log('Task status updated successfully');
      } catch (updateError) {
        console.error('Update endpoint also failed:', updateError);
        alert(`Failed to update task status: ${updateError.response?.data?.message || updateError.message}`);
      }
    }
  };

  // Admin edit task functions
  const handleEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
  };

  const handleSaveTask = async (taskId) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, editTaskForm);
      setAllTasks(allTasks.map(task => 
        task._id === taskId ? { ...task, ...editTaskForm } : task
      ));
      setEditingTaskId(null);
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Update task error:', error);
      alert(`Failed to update task: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
  };

  const handleAdminDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their tasks.')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setAllUsers(allUsers.filter(user => user._id !== userId));
        fetchAdminData(); // Refresh data
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/toggle-status`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    if (editingTask) {
      await updateTask(editingTask._id, taskForm);
      setEditingTask(null);
    } else {
      await createTask(taskForm);
    }
    
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setShowTaskForm(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
    });
    setShowTaskForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const filteredTasks = getFilteredTasks();

  // Admin Dashboard Render
  if (user?.role === 'admin') {
    console.log('Rendering admin dashboard');
    console.log('User role:', user?.role);
    console.log('All tasks count:', allTasks.length);
    console.log('All users count:', allUsers.length);
    console.log('Admin view:', adminView);
    
    return (
      <div className="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              Admin Dashboard 👑
            </h1>
            <p className="dashboard-subtitle">
              Manage users and tasks across the system
            </p>
            
            {/* Debug Info */}
            <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.9rem' }}>
              <strong>Debug Info:</strong><br/>
              User Role: {user?.role}<br/>
              Tasks Count: {allTasks.length}<br/>
              Users Count: {allUsers.length}<br/>
              Loading: {adminLoading ? 'Yes' : 'No'}<br/>
              Stats Loaded: {dashboardStats ? 'Yes' : 'No'}
            </div>
            
            {dashboardStats && (
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', minWidth: '150px' }}>
                  <h3>Users</h3>
                  <p>Total: {dashboardStats.users.totalUsers}</p>
                  <p>Active: {dashboardStats.users.activeUsers}</p>
                  <p>Admins: {dashboardStats.users.adminUsers}</p>
                </div>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', minWidth: '150px' }}>
                  <h3>Tasks</h3>
                  <p>Total: {dashboardStats.tasks.totalTasks}</p>
                  <p>Completed: {dashboardStats.tasks.completedTasks}</p>
                  <p>Pending: {dashboardStats.tasks.pendingTasks}</p>
                </div>
              </div>
            )}
          </div>

          <div className="tasks-container">
            <div className="tasks-header">
              <div className="tasks-filters">
                <button 
                  className={`filter-btn ${adminView === 'tasks' ? 'active' : ''}`}
                  onClick={() => setAdminView('tasks')}
                >
                  <FiSettings /> All Tasks ({allTasks.length})
                </button>
                <button 
                  className={`filter-btn ${adminView === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminView('users')}
                >
                  <FiUsers /> All Users ({allUsers.length})
                </button>
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={fetchAdminData}
                disabled={adminLoading}
              >
                {adminLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>

            {adminLoading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : adminView === 'tasks' ? (
              <div style={{ overflowX: 'auto' }}>
                {allTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3 className="empty-state-title">No tasks found</h3>
                    <p className="empty-state-description">No tasks have been created yet.</p>
                  </div>
                ) : (
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>User Info</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Task Title</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Description</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Priority</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Due Date</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Created</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTasks.map((task, index) => (
                        <tr key={task._id} style={{ 
                          borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none'
                        }}>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleAdminToggleTask(task._id, !task.completed)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ 
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                background: task.completed ? '#d4edda' : '#fff3cd',
                                color: task.completed ? '#155724' : '#856404',
                                fontWeight: 'bold'
                              }}>
                                {task.completed ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            <div style={{ 
                              background: '#f8f9fa', 
                              padding: '0.75rem', 
                              borderRadius: '8px',
                              border: '1px solid #e9ecef'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <div style={{ 
                                  width: '32px', 
                                  height: '32px', 
                                  borderRadius: '50%', 
                                  background: '#007bff',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  {(task.userId?.firstName?.[0] || task.userId?.username?.[0] || 'U').toUpperCase()}
                                </div>
                                <div>
                                  <strong style={{ fontSize: '0.9rem' }}>
                                    {task.userId?.firstName && task.userId?.lastName 
                                      ? `${task.userId.firstName} ${task.userId.lastName}`
                                      : task.userId?.username || 'Unknown User'
                                    }
                                  </strong>
                                  <br/>
                                  <small style={{ color: '#666', fontSize: '0.75rem' }}>
                                    {task.userId?.email || 'No email'}
                                  </small>
                                </div>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                <div>User ID: {task.userId?._id || 'No ID'}</div>
                                <div>Tasks: {allTasks.filter(t => t.userId?._id === task.userId?._id).length} total, 
                                {' '}{allTasks.filter(t => t.userId?._id === task.userId?._id && t.completed).length} completed</div>
                                <div>Role: {task.userId?.role || 'user'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {editingTaskId === task._id ? (
                              <input
                                type="text"
                                value={editTaskForm.title}
                                onChange={(e) => setEditTaskForm({...editTaskForm, title: e.target.value})}
                                style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            ) : (
                              <strong className={task.completed ? 'completed' : ''}>{task.title}</strong>
                            )}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {editingTaskId === task._id ? (
                              <textarea
                                value={editTaskForm.description}
                                onChange={(e) => setEditTaskForm({...editTaskForm, description: e.target.value})}
                                style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                              />
                            ) : (
                              task.description || '-'
                            )}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {editingTaskId === task._id ? (
                              <select
                                value={editTaskForm.priority}
                                onChange={(e) => setEditTaskForm({...editTaskForm, priority: e.target.value})}
                                style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            ) : (
                              <span style={{ 
                                background: task.priority === 'high' ? '#fee' : task.priority === 'medium' ? '#fff3cd' : '#d1ecf1',
                                color: task.priority === 'high' ? '#c53030' : task.priority === 'medium' ? '#856404' : '#0c5460',
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem',
                                textTransform: 'capitalize'
                              }}>
                                {task.priority}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {editingTaskId === task._id ? (
                              <input
                                type="date"
                                value={editTaskForm.dueDate}
                                onChange={(e) => setEditTaskForm({...editTaskForm, dueDate: e.target.value})}
                                style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            ) : (
                              task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'
                            )}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            textAlign: 'center',
                            borderBottom: index < allTasks.length - 1 ? '1px solid #f8f9fa' : 'none'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              {editingTaskId === task._id ? (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleSaveTask(task._id)}
                                    style={{ fontSize: '0.75rem' }}
                                    title="Save Changes"
                                  >
                                    <FiCheck />
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleCancelEdit}
                                    style={{ fontSize: '0.75rem' }}
                                    title="Cancel Edit"
                                  >
                                    <FiX />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleEditTask(task)}
                                    style={{ fontSize: '0.75rem' }}
                                    title="Edit Task"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleAdminDeleteTask(task._id)}
                                    style={{ fontSize: '0.75rem' }}
                                    title="Delete Task"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                {allUsers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3 className="empty-state-title">No users found</h3>
                    <p className="empty-state-description">No users have been registered yet.</p>
                  </div>
                ) : (
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Name</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Email</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Username</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Role</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Joined</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user, index) => (
                        <tr key={user._id} style={{ 
                          borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none',
                          '&:hover': { background: '#f8f9fa' }
                        }}>
                          <td style={{ padding: '1rem', borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong>{user.firstName} {user.lastName}</strong>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {user.username}
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            <span style={{ 
                              background: user.role === 'admin' ? '#667eea' : '#28a745', 
                              color: 'white', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem',
                              textTransform: 'capitalize'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            <span style={{ 
                              background: user.isActive ? '#28a745' : '#dc3545', 
                              color: 'white', 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem'
                            }}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            textAlign: 'center',
                            borderBottom: index < allUsers.length - 1 ? '1px solid #f8f9fa' : 'none'
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button 
                                className={`btn btn-sm ${user.isActive ? 'btn-secondary' : 'btn-success'}`}
                                onClick={() => handleToggleUserStatus(user._id)}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              {user._id !== user._id && (
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleAdminDeleteUser(user._id)}
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular User Dashboard
  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="dashboard-subtitle">
            You have {filteredTasks.filter(t => !t.completed).length} pending tasks
          </p>
        </div>

        <div className="tasks-container">
          <div className="tasks-header">
            <div className="tasks-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({tasks.filter(t => !t.completed).length})
              </button>
              <button 
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({tasks.filter(t => t.completed).length})
              </button>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowTaskForm(true);
                setEditingTask(null);
                setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
              }}
            >
              <FiPlus /> Add Task
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No tasks found</h3>
              <p className="empty-state-description">
                {filter === 'all' 
                  ? "You don't have any tasks yet. Create your first task to get started!"
                  : `No ${filter} tasks found.`
                }
              </p>
              {filter === 'all' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTaskForm(true)}
                >
                  <FiPlus /> Create Your First Task
                </button>
              )}
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map(task => (
                <div key={task._id} className="task-item">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task._id)}
                  />
                  
                  <div className="task-content">
                    <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-meta">
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                      )}
                      <span>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="task-actions">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(task)}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(task._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="modal-overlay" onClick={() => setShowTaskForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowTaskForm(false)}
                >
                  <FiX />
                </button>
              </div>
              
              <form onSubmit={handleTaskSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      required
                      placeholder="Enter task title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="Enter task description (optional)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowTaskForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
