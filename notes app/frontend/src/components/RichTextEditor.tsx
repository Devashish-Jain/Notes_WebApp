import React, { useState, useEffect, useRef, useCallback } from 'react';

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
    const editorRef = useRef<HTMLDivElement>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Parse content to extract tasks and update editor
    useEffect(() => {
        parseTasksFromContent(value);
        if (!isUpdating && editorRef.current) {
            const contentWithoutTasks = getEditorContentForDisplay();
            if (editorRef.current.innerHTML !== contentWithoutTasks) {
                const selection = window.getSelection();
                const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
                editorRef.current.innerHTML = contentWithoutTasks;
                
                // Restore cursor position if possible
                if (range && selection) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        // Ignore if cursor restoration fails
                    }
                }
            }
        }
    }, [value, isUpdating]);

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

        const taskPlaceholder = `\n[TASK:${taskId}:${newTask.text}:${newTask.order}:f]\n`;
        
        // Get current content and add task
        const currentContent = getEditorContent();
        const newContent = currentContent + taskPlaceholder;
        onChange(newContent);
    };

    const getEditorContentForDisplay = () => {
        // Remove task placeholders from display content and preserve HTML
        const contentWithoutTasks = value.replace(/\[TASK:[^:]*:[^:]*:\d+:[tf]\]/g, '').trim();
        return contentWithoutTasks;
    };

    const getEditorContent = () => {
        if (!editorRef.current) return '';
        return editorRef.current.innerHTML;
    };

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        const htmlContent = e.currentTarget.innerHTML || '';
        // Preserve existing tasks and update content
        const taskMatches = value.match(/\[TASK:[^:]*:[^:]*:\d+:[tf]\]/g) || [];
        const taskContent = taskMatches.length > 0 ? '\n' + taskMatches.join('\n') : '';
        const newContent = htmlContent + taskContent;
        onChange(newContent);
        
        // Allow updates after a short delay
        setTimeout(() => setIsUpdating(false), 100);
    };

    const applyFormat = useCallback((command: string, commandValue?: string) => {
        if (!editorRef.current) return;
        
        // Ensure editor is focused
        editorRef.current.focus();
        
        // Apply formatting command
        const success = document.execCommand(command, false, commandValue);
        
        if (success) {
            // Trigger content change to save the formatted content
            const htmlContent = editorRef.current.innerHTML;
            const taskMatches = value.match(/\[TASK:[^:]*:[^:]*:\d+:[tf]\]/g) || [];
            const taskContent = taskMatches.length > 0 ? '\n' + taskMatches.join('\n') : '';
            const newContent = htmlContent + taskContent;
            onChange(newContent);
        }
    }, [value, onChange]);

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


    return (
        <div className="rich-text-editor" style={{ position: 'relative' }}>
            <style>{`
                .rich-text-editor .editor-toolbar {
                    border: 1px solid #ccc;
                    border-bottom: none;
                    border-radius: 8px 8px 0 0;
                    background: #f8f9fa;
                    padding: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                
                .rich-text-editor .editor-container {
                    border: 1px solid #ccc;
                    border-radius: 0 0 8px 8px;
                    min-height: ${height};
                }
                
                .rich-text-editor .editor-content {
                    min-height: ${height};
                    padding: 16px;
                    font-size: 14px;
                    line-height: 1.6;
                    outline: none;
                    overflow-y: auto;
                    white-space: pre-wrap;
                }
                
                .rich-text-editor .editor-content:empty:before {
                    content: attr(data-placeholder);
                    color: #999;
                    font-style: italic;
                }
                
                .rich-text-editor .toolbar-btn {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .rich-text-editor .toolbar-btn:hover {
                    background: #e9ecef;
                    border-color: #adb5bd;
                }
                
                .rich-text-editor .toolbar-btn.active {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }
                
                .rich-text-editor .add-task-btn {
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .rich-text-editor .add-task-btn:hover {
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
                    order: 999;
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
            `}</style>

            {/* Custom Toolbar */}
            <div className="editor-toolbar">
                <button 
                    className="toolbar-btn"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                    title="Bold"
                >
                    <strong>B</strong>
                </button>
                <button 
                    className="toolbar-btn"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
                    title="Italic"
                >
                    <em>I</em>
                </button>
                <button 
                    className="toolbar-btn"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
                    title="Underline"
                >
                    <u>U</u>
                </button>
                <button 
                    className="toolbar-btn"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('insertUnorderedList'); }}
                    title="Bullet List"
                >
                    • List
                </button>
                <button 
                    className="toolbar-btn"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat('insertOrderedList'); }}
                    title="Numbered List"
                >
                    1. List
                </button>
                <button 
                    className="add-task-btn"
                    onClick={insertTask}
                    type="button"
                    title="Add Task"
                >
                    + Task
                </button>
            </div>

            {/* Content Editor */}
            <div className="editor-container">
                <div
                    ref={editorRef}
                    className="editor-content"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    data-placeholder={placeholder}
                    onInput={handleContentChange}
                    onFocus={() => setIsEditorFocused(true)}
                    onBlur={() => setIsEditorFocused(false)}
                    style={{
                        minHeight: height,
                        outline: isEditorFocused ? '2px solid #007bff' : 'none'
                    }}
                />
            </div>

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
