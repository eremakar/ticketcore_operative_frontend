import { useState, useEffect } from "react";
import WorkflowTaskMonitor from "./WorkflowTaskMonitor";

export default function MultiWorkflowTaskMonitor({ taskIds, trainNames, onAllComplete, onError, autoCloseDelay = 5000 }) {
    const [activeTab, setActiveTab] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [failedTasks, setFailedTasks] = useState(new Set());

    // Проверяем завершение всех задач
    useEffect(() => {
        if (completedTasks.size + failedTasks.size === taskIds.length) {
            if (completedTasks.size === taskIds.length) {
                // Все задачи успешно завершены
                setTimeout(() => {
                    onAllComplete && onAllComplete();
                }, autoCloseDelay);
            }
        }
    }, [completedTasks, failedTasks, taskIds.length, autoCloseDelay, onAllComplete]);

    const handleTaskComplete = (index) => (taskData) => {
        setCompletedTasks(prev => new Set([...prev, index]));
    };

    const handleTaskError = (index) => (taskData) => {
        setFailedTasks(prev => new Set([...prev, index]));
        onError && onError(taskData);
    };

    const getTabStatus = (index) => {
        if (completedTasks.has(index)) return 'completed';
        if (failedTasks.has(index)) return 'failed';
        return 'running';
    };

    const getTabColor = (index, isActive) => {
        const status = getTabStatus(index);
        if (isActive) {
            if (status === 'completed') return 'bg-green-500 text-white';
            if (status === 'failed') return 'bg-red-500 text-white';
            return 'bg-blue-500 text-white';
        }
        if (status === 'completed') return 'bg-green-100 text-green-700 hover:bg-green-200';
        if (status === 'failed') return 'bg-red-100 text-red-700 hover:bg-red-200';
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    };

    if (!taskIds || taskIds.length === 0) return null;

    return (
        <div className="bg-white border-2 border-blue-300 rounded-lg shadow-lg overflow-hidden">
            {/* Табы */}
            <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
                {taskIds.map((taskId, index) => {
                    const status = getTabStatus(index);
                    const statusIcon = status === 'completed' ? '✓' : status === 'failed' ? '✗' : '⟳';
                    
                    return (
                        <button
                            key={taskId}
                            onClick={() => setActiveTab(index)}
                            className={`
                                flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap
                                border-r border-gray-200 last:border-r-0 min-w-fit
                                ${getTabColor(index, activeTab === index)}
                            `}
                        >
                            <span className="text-sm">{statusIcon}</span>
                            <span>{trainNames?.[index] || `Поезд ${index + 1}`}</span>
                        </button>
                    );
                })}
            </div>

            {/* Контент активного таба */}
            <div className="p-6">
                {taskIds.map((taskId, index) => (
                    <div key={taskId} style={{ display: activeTab === index ? 'block' : 'none' }}>
                        <WorkflowTaskMonitor
                            taskId={taskId}
                            onComplete={handleTaskComplete(index)}
                            onError={handleTaskError(index)}
                            autoCloseDelay={autoCloseDelay}
                        />
                    </div>
                ))}
            </div>

            {/* Общая статистика внизу */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                        <span className="text-gray-600">
                            Всего: <span className="font-bold">{taskIds.length}</span>
                        </span>
                        <span className="text-green-600">
                            Завершено: <span className="font-bold">{completedTasks.size}</span>
                        </span>
                        {failedTasks.size > 0 && (
                            <span className="text-red-600">
                                Ошибок: <span className="font-bold">{failedTasks.size}</span>
                            </span>
                        )}
                    </div>
                    <div className="text-gray-600">
                        Выполняется: <span className="font-bold">{taskIds.length - completedTasks.size - failedTasks.size}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

