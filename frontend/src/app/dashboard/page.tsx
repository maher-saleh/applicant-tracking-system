  'use client';

  import { useState } from 'react';
  import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
  import { useAuthStore } from '@/store/authStore';
  import { DndProvider, useDrag, useDrop } from 'react-dnd';
  import { HTML5Backend } from 'react-dnd-html5-backend';
  import { Grid as GridLegacy, Card, CardContent, Typography, TextField, IconButton, Box, Button } from '@mui/material';
  import './style.css';
  import { useRouter } from 'next/navigation';

  const ItemTypes = { TASK: 'task' };
  const columns = ['backlog', 'in_progress', 'review', 'done'];
  const EditIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M352.9 21.2L308 66.1 445.9 204 490.8 159.1C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2zM274.1 100L58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L412 237.9 274.1 100z"/></svg>
  )
  const DeleteIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"/></svg>
  )
  const CheckIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>
  )
  const CloseIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/></svg>
  )

  interface Task {
    id: number;
    title: string;
    description?: string;
    column: string;
  }

  const createTask = async ({ title, description, token }: { title: string; description: string; token: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  };

  const fetchTasks = async (token: string): Promise<Task[]> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  };

  const updateTaskColumn = async ({ id, column, token }: { id: number; column: string; token: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ column }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  };

  const updateTaskDetails = async ({ id, title, description, token }: { id: number; title: string; description: string; token: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  };

  const deleteTask = async ({ id, token }: { id: number; token: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  };

  export default function Dashboard() {
      const token = useAuthStore((state) => state.token);
      const queryClient = useQueryClient();

      const [search, setSearch] = useState('');
      const [showAddTaskForm, setShowAddTaskForm] = useState(false);
      const [newTaskTitle, setNewTaskTitle] = useState('');
      const [newTaskDescription, setNewTaskDescription] = useState('');

      const addTaskMutation = useMutation({
        mutationFn: ({ title, description }: { title: string; description: string }) =>
            createTask({ title, description, token: token! }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      });

      const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => fetchTasks(token!), enabled: !!token });
      const updateColumnMutation = useMutation({ mutationFn: updateTaskColumn, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }) });
      const updateDetailsMutation = useMutation({ mutationFn: updateTaskDetails, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }) });
      const deleteMutation = useMutation({ mutationFn: deleteTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }) });
      const router = useRouter();
      
      if (!token) return (
        <>
        <Button onClick={() => router.push('/login')}>Login</Button>
        <Box sx={{ display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100% - 2em)',
                    fontSize: '36px',
                    flexDirection: 'column',
                    maxWidth: '90vw',
                    margin: 'auto'
          }}>
          Access Restricted
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Please log in to continue.<br/>
            <span style={{ fontSize: '20px', fontWeight: 'normal' }}>
              <i>For demo purposes, you may use the following test account:</i><br/>
              Email: test@example.com<br/>
              Password: password
            </span>
          </p>
        </Box>
        </>
      );
      
      const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        addTaskMutation.mutate({ title: newTaskTitle, description: newTaskDescription });
        setNewTaskTitle('');
        setNewTaskDescription('');
      };

      const filteredTasks: Task[] = tasks.filter((task: Task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) || task.description?.toLowerCase().includes(search.toLowerCase())
      );

      const handleDrop = (id: number, newColumn: string) => {
          updateColumnMutation.mutate({ id, column: newColumn, token });
      };

      return (
          <DndProvider backend={HTML5Backend}>
          
              <Box id="top-bar" display="flex" flexDirection="column" gap={1} marginBottom={2}>
                  
                  <Box>
                      <IconButton id="add-task-button"
                      color="primary"
                      onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                      style={{ backgroundColor: '#1976d2', color: 'white' }}
                      >
                      <Typography variant="button">Add Task</Typography>
                      </IconButton>
                  </Box>

                  {showAddTaskForm && (
                      <Box display="flex" alignItems="center" gap={1} marginTop={1}>
                      <TextField
                          label="New Task Title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          size="small"
                      />
                      <TextField
                          label="New Task Description"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          size="small"
                      />
                      <IconButton color="primary" onClick={handleAddTask}>
                          <CheckIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => setShowAddTaskForm(false)}>
                          <CloseIcon />
                      </IconButton>
                      </Box>
                  )}

                  <TextField
                      label="Search by task title or description"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      fullWidth
                      margin="normal"
                  />
                  </Box>
              
              <GridLegacy container spacing={2}>
                  {columns.map((col) => (
                  <GridLegacy item xs={3} key={col}>
                      <Typography variant="h6">{col.toUpperCase()}</Typography>
                      <DroppableColumn colName={col} onDrop={handleDrop}>
                      {filteredTasks
                          .filter((task: Task) => task.column === col)
                          .map((task: Task) => (
                          <DraggableTask
                              key={task.id}
                              task={task}
                              token={token}
                              updateDetailsMutation={updateDetailsMutation}
                              deleteMutation={deleteMutation}
                          />
                          ))}
                      </DroppableColumn>
                  </GridLegacy>
                  ))}
              </GridLegacy>
          </DndProvider>
    );
  }

  interface DraggableTaskProps {
    task: Task;
    token: string;
    updateDetailsMutation: UseMutationResult<unknown, Error, { id: number; title: string; description: string; token: string }, unknown>;
    deleteMutation: UseMutationResult<unknown, Error, { id: number; token: string }, unknown>;
  }

  function DraggableTask({ task, token, updateDetailsMutation, deleteMutation }: DraggableTaskProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.TASK,
      item: { id: task.id },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');

    const handleSave = () => {
      updateDetailsMutation.mutate({ id: task.id, title, description, token });
      setIsEditing(false);
    };

    const handleDelete = () => {
      deleteMutation.mutate({ id: task.id, token });
    };

    return (
      <Card
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          marginBottom: '8px',
          cursor: 'grab',
          position: 'relative',
        }}
      >
        <CardContent>
          {isEditing ? (
            <>
              <TextField fullWidth value={title} onChange={(e) => setTitle(e.target.value)} margin="dense" />
              <TextField fullWidth value={description} onChange={(e) => setDescription(e.target.value)} margin="dense" />
            </>
          ) : (
            <>
              <Typography variant="subtitle1">{task.title}</Typography>
              <Typography variant="body2">{task.description}</Typography>
            </>
          )}
        </CardContent>
        <Box display="flex" justifyContent="flex-end" p={1} gap={1}>
          {isEditing ? (
            <>
              <IconButton size="small" color="primary" onClick={handleSave}>
                <CheckIcon />
              </IconButton>
              <IconButton size="small" color="secondary" onClick={() => setIsEditing(false)}>
                <CloseIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton size="small" onClick={() => setIsEditing(true)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Card>
    );
  }

  function DroppableColumn({ colName, children, onDrop }: { colName: string; children: React.ReactNode; onDrop: (id: number, col: string) => void }) {
    const [, drop] = useDrop(() => ({
      accept: ItemTypes.TASK,
      drop: (item: { id: number }) => onDrop(item.id, colName),
    }));

    return (
      <div
        ref={drop}
        style={{
          minHeight: '400px',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        {children}
      </div>
    );
  }