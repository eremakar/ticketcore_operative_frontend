import { useState, useEffect, useRef } from "react";
import useResource from "@/hooks/useResource";
import { WorkflowTaskStates, WorkflowTaskSeverities } from "@/models/workflowTaskStates";

export default function WorkflowTaskMonitor({ taskId, onComplete, onError, autoCloseDelay = 5000 }) {
    const [workflowTask, setWorkflowTask] = useState(null);
    const [taskProgress, setTaskProgress] = useState(null);
    const [taskLogs, setTaskLogs] = useState([]);
    const [taskState, setTaskState] = useState(null);
    const logsContainerRef = useRef(null);

    const workflowTasksResource = useResource('workflowTasks');
    const workflowTaskProgressesResource = useResource('workflowTaskProgresses');
    const workflowTaskLogsResource = useResource('workflowTaskLogs');

    // Polling для мониторинга задачи
    useEffect(() => {
        if (!taskId) return;

        // Начальная загрузка задачи
        const loadInitialTask = async () => {
            try {
                const task = await workflowTasksResource.get(taskId);
                setWorkflowTask(task);
                setTaskState(task.state);
            } catch (error) {
                console.error('Ошибка загрузки задачи:', error);
            }
        };

        loadInitialTask();

        const pollInterval = setInterval(async () => {
            try {
                // Получаем обновленную задачу
                const taskData = await workflowTasksResource.get(taskId);
                setTaskState(taskData.state);
                setWorkflowTask(taskData);

                // Получаем последний прогресс
                const progressData = await workflowTaskProgressesResource.search({
                    paging: { skip: 0, take: 1 },
                    filter: {
                        taskId: { operand1: taskId, operator: 'equals' }
                    },
                    sort: { time: { operator: 'desc' } }
                });
                if (progressData?.result && progressData.result.length > 0) {
                    setTaskProgress(progressData.result[0]);
                }

                // Получаем логи
                const logsData = await workflowTaskLogsResource.search({
                    paging: { skip: 0, take: 100 },
                    filter: {
                        taskId: { operand1: taskId, operator: 'equals' }
                    },
                    sort: { time: { operator: 'desc' } }
                });
                if (logsData?.result) {
                    setTaskLogs(logsData.result);
                    // Прокручиваем вниз при обновлении логов
                    setTimeout(() => {
                        if (logsContainerRef.current) {
                            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                        }
                    }, 100);
                }

                // Проверяем завершение
                if (taskData.state === WorkflowTaskStates.Completed) {
                    clearInterval(pollInterval);
                    if (onComplete) {
                        setTimeout(() => {
                            onComplete(taskData);
                        }, autoCloseDelay);
                    }
                } else if (taskData.state === WorkflowTaskStates.Failed || taskData.state === WorkflowTaskStates.Cancelled) {
                    clearInterval(pollInterval);
                    if (onError) {
                        onError(taskData);
                    }
                }
            } catch (error) {
                console.error('Ошибка мониторинга задачи:', error);
            }
        }, 1000); // Обновление каждую секунду

        return () => clearInterval(pollInterval);
    }, [taskId, autoCloseDelay]);

    // Маппинг состояний
    const getStateText = (state) => {
        const states = {
            [WorkflowTaskStates.NotStarted]: { text: 'Не начата', color: 'text-gray-600', bg: 'bg-gray-100' },
            [WorkflowTaskStates.Running]: { text: 'Выполняется', color: 'text-blue-600', bg: 'bg-blue-100' },
            [WorkflowTaskStates.Completed]: { text: 'Завершена', color: 'text-green-600', bg: 'bg-green-100' },
            [WorkflowTaskStates.Failed]: { text: 'Ошибка', color: 'text-red-600', bg: 'bg-red-100' },
            [WorkflowTaskStates.Cancelled]: { text: 'Отменена', color: 'text-yellow-600', bg: 'bg-yellow-100' },
            [WorkflowTaskStates.Paused]: { text: 'Приостановлена', color: 'text-orange-600', bg: 'bg-orange-100' }
        };
        return states[state] || { text: 'Неизвестно', color: 'text-gray-600', bg: 'bg-gray-100' };
    };

    const getSeverityInfo = (severity) => {
        const severities = {
            [WorkflowTaskSeverities.Info]: { text: 'INFO', color: 'text-blue-600', icon: 'ℹ️' },
            [WorkflowTaskSeverities.Warning]: { text: 'WARNING', color: 'text-yellow-600', icon: '⚠️' },
            [WorkflowTaskSeverities.Error]: { text: 'ERROR', color: 'text-red-600', icon: '❌' },
            [WorkflowTaskSeverities.Critical]: { text: 'CRITICAL', color: 'text-red-800', icon: '🔥' }
        };
        return severities[severity] || { text: 'INFO', color: 'text-gray-600', icon: 'ℹ️' };
    };

    if (!taskId) return null;

    return (
        <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
                {/* Заголовок с состоянием */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                            {workflowTask?.name || 'Выполнение задачи'}
                        </h3>
                        {workflowTask?.category && (
                            <p className="text-sm text-gray-500">{workflowTask.category}</p>
                        )}
                    </div>
                    {taskState && (
                        <span className={`px-4 py-2 rounded-full font-semibold ${getStateText(taskState).bg} ${getStateText(taskState).color}`}>
                            {getStateText(taskState).text}
                        </span>
                    )}
                </div>

                {/* Прогресс бар */}
                {taskProgress && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                                {taskProgress.message || 'Выполняется...'}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                                {taskProgress.percent}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${taskProgress.percent}%` }}
                            />
                        </div>
                        {taskProgress.data && (
                            <div className="text-xs text-gray-500 mt-1">
                                {JSON.stringify(taskProgress.data)}
                            </div>
                        )}
                    </div>
                )}

                {/* Логи */}
                {taskLogs.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">Логи выполнения:</h4>
                        <div ref={logsContainerRef} className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                            {taskLogs.slice().reverse().map((log, index) => {
                                const severityInfo = getSeverityInfo(log.severity);
                                return (
                                    <div key={index} className="text-xs border-b border-gray-200 pb-2 last:border-b-0">
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm">{severityInfo.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-bold ${severityInfo.color}`}>
                                                        {severityInfo.text}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {new Date(log.time).toLocaleTimeString('ru-RU')}
                                                    </span>
                                                    {log.source && (
                                                        <span className="text-gray-400 italic">
                                                            [{log.source}]
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-gray-700">{log.message}</div>
                                                {log.data && (
                                                    <div className="mt-1 text-gray-500 font-mono text-xs bg-white p-2 rounded">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </div>
                                                )}
                                                {log.callStack && (
                                                    <details className="mt-1">
                                                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                                                            Stack trace
                                                        </summary>
                                                        <pre className="mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
                                                            {log.callStack}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Спиннер при выполнении */}
                {taskState === WorkflowTaskStates.Running && (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Сообщение об ошибке */}
                {workflowTask?.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-red-800 mb-2">Ошибка:</h4>
                        <p className="text-sm text-red-700">{workflowTask.errorMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

