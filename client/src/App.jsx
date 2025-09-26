'use client';
import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import AddTaskDialog from './components/AddTaskDialog';
import LoadingSpinner from './components/LoadingSpinner';
import { taskService } from './services/taskService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAllTasks();
      setTasks(response.data || []);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      setOperationLoading(true);
      const response = await taskService.createTask(taskData);
      
      if (response && response.data) {
        setTasks((prevTasks) => [response.data, ...prevTasks]);
        setIsDialogOpen(false);
        return { success: true };
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create task';
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;
    
    try {
      setOperationLoading(true);
      await taskService.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Delete task error:', err);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Task Manager
            </h1>
            <p className="text-slate-300 mt-2 text-lg">Professional Task Management System</p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            disabled={operationLoading}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 
              shadow-2xl transition-all duration-200 hover:from-blue-700 hover:to-blue-800 
              hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-4 focus:ring-blue-500/50 focus:outline-none border border-blue-500/30"
          >
            {operationLoading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-lg">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Connection Error</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                disabled={operationLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium 
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
              >
                {operationLoading ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : (
          <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} isLoading={operationLoading} />
        )}
      </main>

      {isDialogOpen && (
        <AddTaskDialog 
          onClose={() => !operationLoading && setIsDialogOpen(false)} 
          onSubmit={handleAddTask}
          isLoading={operationLoading}
        />
      )}
    </div>
  );
}

export default App;