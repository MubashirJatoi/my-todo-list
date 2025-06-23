"use client"
import { useState, useEffect } from "react"

interface Todo {
    id: string;
    title: string;
    completed: boolean;
}

const API_BASE_URL = "http://localhost:5000/api/todos";


export default function Todo() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState<string>("");
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTodos = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_BASE_URL);

            if(!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }
            const data: Todo[] = await response.json()
            setTodos(data);
        } catch(err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Failed to fetch data todos:', errorMessage);
            setError(`Failed to load todos: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    } 

    useEffect(() => {
        console.log("Component mounted. Initiating todo fetch...");
        fetchTodos();
    }, []);

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newTodoTitle.trim() === '') {
            setError("Todo title can't be empty.")
            return;
        }

        setError(null);

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTodoTitle }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const addedTodo: Todo = await response.json();
            setTodos([...todos, addedTodo]);
            setNewTodoTitle('');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Failed to add todo:', errorMessage);
            setError(`Failed to add todo: ${errorMessage}`);
        }
    }
    
    const toggleTodoCompleted = async (todoToToggle: Todo) => {
        setError(null);

        try {
            const updatedTodo = { ...todoToToggle, completed: !todoToToggle.completed };

            const response = await fetch(`${API_BASE_URL}/${todoToToggle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTodo),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            setTodos(todos.map(t => (t.id === todoToToggle.id ? updatedTodo : t)));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Failed to toggle todo completed:', errorMessage);
            setError(`Failed to update todo: ${errorMessage}`)
        }
    }

    const deleteTodo = async (id: string) => {
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                if (response.status !== 204) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
            }
            setTodos(todos.filter(t => t.id !== id));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Failed to delete todo:', errorMessage);
            setError(`Failed to delete todo: ${errorMessage}`)
        }
    }

    const startEditing = (todoToEdit: Todo) => {
        setEditingTodo(todoToEdit);
        setNewTodoTitle(todoToEdit.title);
        setError(null);
    };

    const updateTodo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingTodo || newTodoTitle.trim() === '') {
            setError("Can't update with empty title or no todo selected.");
            return
        }

        setError(null);

        try {
            const updatedTodo = { ...editingTodo, title: newTodoTitle.trim() };

            const response = await fetch(`${API_BASE_URL}/${editingTodo.id}`, {
                method: 'Put',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateTodo),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setTodos(todos.map(t => (t.id === editingTodo.id ? updatedTodo : t)));

            setEditingTodo(null);
            setNewTodoTitle('');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Failed to update todo:', errorMessage);
            setError(`Failed to update todo: ${errorMessage}`)
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10 font-sans">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-8 rounded-lg p-4 bg-white shadow-xl animate-fade-in">My Node.js To-Do List</h1>
            <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-xl animate-slide-up">
                <form onSubmit={editingTodo ? updateTodo : addTodo} className="flex flex-col gap-4 mb-8">
                    <input type="text" className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition duration-300 ease-in-out" placeholder={editingTodo ? "Edit todo title..." : "Add a new todo..."} value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} required/>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-md">
                        {editingTodo ? "Update Todo" : "Add Todo"}
                    </button>
                    {editingTodo && (
                        <button type="button" onClick={() => { setEditingTodo(null); setNewTodoTitle('');}} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-md">
                            Cancel Edit
                        </button>
                    )}
                </form> 
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 transition duration-300 ease-in-out animate-fade-in-down" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                {loading && (
                    <div className="text-center text-gray-600 text-lg mb-6">Loading todos...</div>
                )}
                {!loading && todos.length === 0 && !error && (
                    <div className="text-center text-gray-500 text-lg">No todos yet! Add one above.</div>
                )}
                {!loading && todos.length > 0 && (
                    <ul className="space-y-4">
                        {todos.map((todo) => (
                            <li key={todo.id} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-[1.01] hover:bg-gray-100">
                                <div className="flex items-center flex-1 min-w-0">
                                    <input type="checkbox" checked={todo.completed} onChange={() => toggleTodoCompleted(todo)} className="form-checkbox h-6 w-6 text-blue-600 rounded-md focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer"/>
                                        <span className={`ml-4 text-xl flex-1 min-w-0 truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                            {todo.title}
                                        </span>
                                </div>
                                <div className="flex item-center ml-4 space-x-2">
                                    <button onClick={() => startEditing(todo)} className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-sm" aria-label={`Edit ${todo.title}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => deleteTodo(todo.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-sm" aria-label={`Delete ${todo.title}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>         
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}