export const mapEmployeeName = (employee) => {
    if (!employee)
        return null;

    return employee.firstName + " " + employee.lastName + " " + employee.fatherName;
}

export const mapTrainScheduleName = (schedule) => {
    if (!schedule)
        return null;

    const date = schedule.date ? new Date(schedule.date).toLocaleDateString('ru-RU') : '';
    const trainName = schedule.train?.name || 'Поезд';
    
    return `${date} ${trainName}`;
}

export const mapSeatSegmentName = (segment) => {
    if (!segment)
        return null;

    const fromStation = segment.from?.station?.name || 'Не указано';
    const toStation = segment.to?.station?.name || 'Не указано';
    
    return `${fromStation} - ${toStation}`;
}

export const mapTrainScheduleStateName = (state) => {
    if (state === null || state === undefined)
        return 'Неопределен';
    
    const { TrainScheduleStateNames } = require('@/models/trainScheduleStates');
    return TrainScheduleStateNames[state] || 'Неизвестный статус';
}

export const mapTrainWagonStateName = (state) => {
    if (state === null || state === undefined)
        return 'Неопределен';
    
    const { TrainWagonStateNames } = require('@/models/trainWagonStates');
    return TrainWagonStateNames[state] || 'Неизвестный статус';
}

export const mapTrainScheduleWorkflowStateName = (state) => {
    if (state === null || state === undefined)
        return 'Неопределен';

    const { TrainScheduleWorkflowStateNames } = require('@/models/trainScheduleWorkflowStates');
    return TrainScheduleWorkflowStateNames[state] || 'Неизвестный статус';
}

export const mapWorkflowTaskStateName = (state) => {
    if (state === null || state === undefined)
        return 'Неопределен';
    
    const { WorkflowTaskStateNames } = require('@/models/workflowTaskStates');
    return WorkflowTaskStateNames[state] || 'Неизвестный статус';
}

export const trainNameMap = (value, wrappedRow) => {
    if (value) {
        return value?.name;
    }
    
    const parts = [];
    if (wrappedRow?.row?.trainNumber) {
        parts.push(wrappedRow.row.trainNumber);
    }
    if (wrappedRow?.row?.thread) {
        parts.push(wrappedRow.row.thread);
    }
    
    return parts.join(' ');
}
