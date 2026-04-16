import axiosClient from './axiosClient';

export default {
    exportTasksReport() {
        return axiosClient.get('/reports/export/tasks', { responseType: 'blob' });
    },
    exportUsersReport() {
        return axiosClient.get('/reports/export/users', { responseType: 'blob' });
    }
};
