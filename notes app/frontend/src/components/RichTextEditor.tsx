import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    order: number;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Write your note here...",
    height = "200px"
}) => {
    const quillRef = useRef<ReactQuill>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Parse content to extract tasks
    useEffect(() => {
        parseTasksFromContent(value);
    }, [value]);

    const parseTasksFromContent = (content: string) => {
        const taskRegex = /\[TASK:([^:]*):([^:]*):(\d+):([tf])\]/g;
        const foundTasks: Task[] = [];
        let match;

        while ((match = taskRegex.exec(content)) !== null) {
            foundTasks.push({
                id: match[1],
                text: match[2],
                order: parseInt(match[3]),
                completed: match[4] === 't'
            });
        }

        foundTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1; // Completed tasks go to bottom
            }
            return a.order - b.order;
        });

        setTasks(foundTasks);
    };

    const generateTaskId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const insertTask = () => {
        const taskId = generateTaskId();
        const newTask: Task = {
            id: taskId,
            text: 'New task',
            completed: false,
            order: tasks.length
        };

        const taskPlaceholder = `[TASK:${taskId}:${newTask.text}:${newTask.order}:f]`;
        
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const range = quill.getSelection(true);
            const index = range ? range.index : quill.getLength();
            
            // Insert task on a new line
            if (index > 0) {
                quill.insertText(index, '\n');
                quill.insertText(index + 1, taskPlaceholder);
                quill.insertText(index + taskPlaceholder.length + 1, '\n');
            } else {
                quill.insertText(index, taskPlaceholder + '\n');
            }
        }
    };

    const toggleTask = (taskId: string) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        // Update the content with new task states
        let updatedContent = value;
        updatedTasks.forEach(task => {
            const oldTaskPattern = new RegExp(`\\[TASK:${task.id}:([^:]*):([^:]*):([tf])\\]`);
            const newTaskTag = `[TASK:${task.id}:${task.text}:${task.order}:${task.completed ? 't' : 'f'}]`;
            updatedContent = updatedContent.replace(oldTaskPattern, newTaskTag);
        });

        onChange(updatedContent);
    };

    const updateTaskText = (taskId: string, newText: string) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, text: newText };
            }
            return task;
        });

        // Update the content with new task text
        let updatedContent = value;
        const task = updatedTasks.find(t => t.id === taskId);
        if (task) {
            const oldTaskPattern = new RegExp(`\\[TASK:${taskId}:([^:]*):([^:]*):([tf])\\]`);
            const newTaskTag = `[TASK:${taskId}:${newText}:${task.order}:${task.completed ? 't' : 'f'}]`;
            updatedContent = updatedContent.replace(oldTaskPattern, newTaskTag);
            onChange(updatedContent);
        }
    };

    const removeTask = (taskId: string) => {
        let updatedContent = value;
        const taskPattern = new RegExp(`\\[TASK:${taskId}:([^:]*):([^:]*):([tf])\\]\\n?`);
        updatedContent = updatedContent.replace(taskPattern, '');
        onChange(updatedContent);
    };

    // Custom toolbar configuration
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean'],
                ['task'] // Custom task button
            ],
            handlers: {
                'task': insertTask
            }
        }
    };

    const formats = [
        'header', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet', 'align',
        'blockquote', 'code-block',
        'link', 'image'
    ];


    return (
        <div className="rich-text-editor" style={{ position: 'relative' }}>
            <style>{`
                .rich-text-editor .ql-toolbar {
                    border-top: 1px solid #ccc;
                    border-left: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    border-radius: 8px 8px 0 0;
                    background: #f8f9fa;
                }
                
                .rich-text-editor .ql-container {
                    border-bottom: 1px solid #ccc;
                    border-left: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    border-radius: 0 0 8px 8px;
                    font-size: 14px;
                    min-height: ${height};
                }
                
                .rich-text-editor .ql-editor {
                    min-height: ${height};
                    padding: 16px;
                }
                
                .rich-text-editor .ql-toolbar .ql-task {
                    background: #28a745;
                    color: white;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 12px;
                }
                
                .rich-text-editor .ql-toolbar .ql-task:hover {
                    background: #218838;
                }
                
                .task-item {
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                    padding: 8px 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    background: #f9f9f9;
                    transition: all 0.2s ease;
                }
                
                .task-item:hover {
                    background: #f0f0f0;
                    border-color: #d0d0d0;
                }
                
                .task-item.completed {
                    background: #f0f8f0;
                    border-color: #c0d0c0;
                    order: 999; /* Move to bottom */
                }
                
                .task-checkbox {
                    margin-right: 10px;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                
                .task-text {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }
                
                .task-delete {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                
                .task-item:hover .task-delete {
                    opacity: 1;
                }
                
                .tasks-container {
                    margin-top: 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 12px;
                    background: white;
                }
                
                .tasks-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #eee;
                }
                
                .add-task-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .add-task-btn:hover {
                    background: #0056b3;
                }
            `}</style>

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                modules={modules}
                formats={formats}
            />

            {/* Tasks Section */}
            {tasks.length > 0 && (
                <div className="tasks-container">
                    <div className="tasks-header">
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                            Tasks ({tasks.filter(t => !t.completed).length} active, {tasks.filter(t => t.completed).length} completed)
                        </h4>
                        <button 
                            className="add-task-btn"
                            onClick={insertTask}
                            type="button"
                        >
                            + Add Task
                        </button>
                    </div>
                    
                    <div className="tasks-list">
                        {tasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`task-item ${task.completed ? 'completed' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    className="task-checkbox"
                                />
                                <input
                                    type="text"
                                    value={task.text}
                                    onChange={(e) => updateTaskText(task.id, e.target.value)}
                                    className="task-text"
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        flex: 1,
                                        fontSize: '14px',
                                        color: '#333',
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        opacity: task.completed ? 0.6 : 1
                                    }}
                                />
                                <button
                                    onClick={() => removeTask(task.id)}
                                    className="task-delete"
                                    type="button"
                                    title="Delete task"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Task Button (when no tasks exist) */}
            {tasks.length === 0 && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <button 
                        className="add-task-btn"
                        onClick={insertTask}
                        type="button"
                    >
                        + Add Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
