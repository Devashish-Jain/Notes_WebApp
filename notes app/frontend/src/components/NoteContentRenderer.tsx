import React, { useState, useEffect } from 'react';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    order: number;
}

interface NoteContentRendererProps {
    content: string;
    editable?: boolean;
    onContentChange?: (content: string) => void;
    onTaskToggle?: (updatedContent: string) => Promise<void>;
}

const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({ 
    content, 
    editable = false, 
    onContentChange,
    onTaskToggle 
}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [displayContent, setDisplayContent] = useState('');

    useEffect(() => {
        parseAndRenderContent(content);
    }, [content]);

    const parseAndRenderContent = (rawContent: string) => {
        // Extract tasks
        const taskRegex = /\[TASK:([^:]*):([^:]*):(\d+):([tf])\]/g;
        const foundTasks: Task[] = [];
        let match;
        let processedContent = rawContent;

        while ((match = taskRegex.exec(rawContent)) !== null) {
            foundTasks.push({
                id: match[1],
                text: match[2],
                order: parseInt(match[3]),
                completed: match[4] === 't'
            });
        }

        // Sort tasks (completed ones at bottom)
        foundTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return a.order - b.order;
        });

        // Remove task placeholders from display content
        processedContent = processedContent.replace(/\[TASK:[^:]*:[^:]*:\d+:[tf]\]/g, '');
        
        // Clean up extra newlines
        processedContent = processedContent.replace(/\n\n+/g, '\n\n').trim();

        setTasks(foundTasks);
        setDisplayContent(processedContent);
    };

    const toggleTask = async (taskId: string) => {
        // Allow task toggle in both edit and view modes
        if (!onContentChange && !onTaskToggle) return;

        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );

        // Rebuild content with updated task states
        let updatedContent = content;
        updatedTasks.forEach(task => {
            const oldTaskPattern = new RegExp(`\\[TASK:${task.id}:([^:]*):([^:]*):([tf])\\]`);
            const newTaskTag = `[TASK:${task.id}:${task.text}:${task.order}:${task.completed ? 't' : 'f'}]`;
            updatedContent = updatedContent.replace(oldTaskPattern, newTaskTag);
        });

        // Update local state immediately for responsive UI
        setTasks(updatedTasks);

        // If in edit mode, use onContentChange
        if (editable && onContentChange) {
            onContentChange(updatedContent);
        }
        // If in view mode, use onTaskToggle to save to backend
        else if (onTaskToggle) {
            try {
                await onTaskToggle(updatedContent);
            } catch (error) {
                console.error('Failed to update task:', error);
                // Revert local state on error
                parseAndRenderContent(content);
            }
        }
    };

    const renderContent = (content: string) => {
        // Simple HTML rendering for rich text (you might want to use a library like DOMPurify)
        return { __html: content.replace(/\n/g, '<br />') };
    };

    return (
        <div className="note-content-renderer">
            <style>{`
                .note-content-renderer .note-text {
                    margin-bottom: 16px;
                    line-height: 1.6;
                    color: #333;
                }

                .note-content-renderer .tasks-section {
                    margin-top: 16px;
                }

                .note-content-renderer .tasks-header {
                    font-size: 14px;
                    font-weight: 600;
                    color: #555;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #eee;
                }

                .note-content-renderer .task-item {
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                    padding: 8px 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    background: #f9f9f9;
                    transition: all 0.3s ease;
                }

                .note-content-renderer .task-item:hover {
                    background: #f0f0f0;
                    border-color: #d0d0d0;
                    transform: translateX(2px);
                }

                .note-content-renderer .task-item.completed {
                    background: #f0f8f0;
                    border-color: #c0d0c0;
                    opacity: 0.8;
                }

                .note-content-renderer .task-checkbox {
                    margin-right: 12px;
                    width: 18px;
                    height: 18px;
                    cursor: ${(editable && onContentChange) || onTaskToggle ? 'pointer' : 'not-allowed'};
                    accent-color: #28a745;
                    opacity: ${(editable && onContentChange) || onTaskToggle ? '1' : '0.6'};
                }

                .note-content-renderer .task-text {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                    transition: all 0.3s ease;
                }

                .note-content-renderer .task-item.completed .task-text {
                    text-decoration: line-through;
                    opacity: 0.6;
                    color: #666;
                }

                .note-content-renderer .task-status {
                    font-size: 12px;
                    padding: 2px 6px;
                    border-radius: 12px;
                    font-weight: 500;
                }

                .note-content-renderer .task-status.pending {
                    background: #fff3cd;
                    color: #856404;
                }

                .note-content-renderer .task-status.completed {
                    background: #d1edff;
                    color: #0c5460;
                }

                .note-content-renderer .tasks-summary {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 16px;
                    font-size: 13px;
                    color: #555;
                }

                .note-content-renderer .progress-bar {
                    width: 100%;
                    height: 6px;
                    background: #e0e0e0;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 8px;
                }

                .note-content-renderer .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #28a745, #20c997);
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }

                .note-content-renderer .no-tasks {
                    color: #999;
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                }
            `}</style>

            {/* Main Content */}
            {displayContent && (
                <div 
                    className="note-text"
                    dangerouslySetInnerHTML={renderContent(displayContent)}
                />
            )}

            {/* Tasks Section */}
            {tasks.length > 0 && (
                <div className="tasks-section">
                    <div className="tasks-summary">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                                📋 {tasks.filter(t => !t.completed).length} pending, {tasks.filter(t => t.completed).length} completed
                                {!editable && !onTaskToggle && (
                                    <span style={{ 
                                        marginLeft: '8px',
                                        fontSize: '11px', 
                                        color: '#888', 
                                        fontStyle: 'italic',
                                        background: '#f0f0f0',
                                        padding: '2px 6px',
                                        borderRadius: '10px'
                                    }}>
                                        👁️ View Only
                                    </span>
                                )}
                            </span>
                            <span style={{ fontSize: '12px', color: '#777' }}>
                                {tasks.length > 0 && `${Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}% complete`}
                            </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ 
                                    width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` 
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Active Tasks */}
                    {tasks.filter(t => !t.completed).length > 0 && (
                        <div>
                            <h4 className="tasks-header">
                                🔥 Active Tasks
                            </h4>
                            {tasks.filter(t => !t.completed).map(task => (
                                <div key={task.id} className="task-item">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task.id)}
                                        className="task-checkbox"
                                        disabled={!editable && !onTaskToggle}
                                    />
                                    <span className="task-text">{task.text}</span>
                                    <span className="task-status pending">Pending</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Completed Tasks */}
                    {tasks.filter(t => t.completed).length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h4 className="tasks-header">
                                ✅ Completed Tasks
                            </h4>
                            {tasks.filter(t => t.completed).map(task => (
                                <div key={task.id} className="task-item completed">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task.id)}
                                        className="task-checkbox"
                                        disabled={!editable && !onTaskToggle}
                                    />
                                    <span className="task-text">{task.text}</span>
                                    <span className="task-status completed">Done</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!displayContent && tasks.length === 0 && (
                <div className="no-tasks">
                    No content or tasks yet
                </div>
            )}
        </div>
    );
};

export default NoteContentRenderer;
