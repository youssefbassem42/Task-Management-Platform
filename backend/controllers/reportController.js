const Task = require('../models/Task');
const User = require('../models/User');
const excelJS = require('exceljs');


// @desc    Export All tasks as an excel file
//@route    GET /api/reports/export/tasks
//@access   Private (Admin)

const exportTasksReport = async (req, res) => {
    try{
        const tasks = await Task.find().populate('assignedTo', 'name email');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Task ID", key: "_id", width: 25},
            { header: "Title", key: "title", width: 25},
            { header: "Description", key: "description", width: 50},
            { header: "Priority", key: "priority", width: 15},
            { header: "Status", key: "status", width: 20},
            { header: "Due Date", key: "dueDate", width: 20},
            { header: "Assigned To", key: "assignedTo", width: 30},
        ];
        tasks.forEach(task => {
            const assignedTo = task.assignedTo.map(user => user.name).join(", ");
            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate.toISOString().split('T')[0],
                assignedTo: assignedTo || "Unassigned",
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=tasks_report.xlsx");
        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
        
    }catch (error){
        res.status(500).json({ message:"Error exporting tasks report", error: error.message });
    }
};

// @desc    Export User-Task Report as an excel file
//@route    GET /api/reports/export/users
//@access   Private (Admin)

const exportUsersReport = async (req, res) => {
    try{
        const users = await User.find().select('name email _id').lean();
        const userTasks = await Task.find().populate(
            'assignedTo', 'name email _id'
        )
        const userTaskMap = {};
        users.forEach(user => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                completedTasks: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
            };
        });

        userTasks.forEach(task => {
            if(task.assignedTo){
                task.assignedTo.forEach(user => {
                    if(userTaskMap[user._id]){
                        userTaskMap[user._id].taskCount++;
                        if(task.status === 'Completed'){
                            userTaskMap[user._id].completedTasks++;
                        }else if(task.status === 'In Progress'){
                            userTaskMap[user._id].inProgressTasks++;
                        }else if (task.status === 'Pending'){
                            userTaskMap[user._id].pendingTasks++;
                        }
                    }
                });
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User TaskReport");

        worksheet.columns = [
            { header: "User Name", key: "name", width: 25},
            { header: "Email", key: "email", width: 40},
            { header: "Total Assigned Tasks", key: "taskCount", width: 20},
            { header: "Completed Tasks", key: "completedTasks", width: 20},
            { header: "Pending Tasks", key: "pendingTasks", width: 20},
            { header: "In Progress Tasks", key: "inProgressTasks", width: 20},
        ];
        Object.values(userTaskMap).forEach(user => {
            worksheet.addRow(user);
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=users_report.xlsx");
        return workbook.xlsx.write(res).then(() => {
            res.end();
        });
        
    }catch (error){
        res.status(500).json({ message:"Error exporting users report", error: error.message });
    }
};

module.exports = {
    exportTasksReport,
    exportUsersReport
};
