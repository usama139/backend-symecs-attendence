const mongoose = require('mongoose');
const AttendanceSchema = require('./Attendance');

let AttendanceMaster, AttendanceArchive;

const initRouter = () => {
    // 1. Map Schema to the primary connection (Cluster 0)
    AttendanceMaster = mongoose.connections[0].model('Attendance', AttendanceSchema);
    
    // 2. Build dedicated node connection for Cluster 1 (The new cluster)
    // Here we hardcode the URL you provided:
    const URI_ARCHIVE = 'mongodb+srv://symecsmalik_db_user:BuK7wSJSA1LKF3k5@cluster1.y1dqfrd.mongodb.net/attendancedb';
    const conn2 = mongoose.createConnection(URI_ARCHIVE);
    
    conn2.on('connected', () => console.log('Hacker Routing Node 2: Connected'));
    
    AttendanceArchive = conn2.model('Attendance', AttendanceSchema);
};

const getModelForDate = (dateString) => {
    if (!dateString) return AttendanceMaster;
    const year = new Date(dateString).getFullYear();
    
    // Hacker Routing Rule:
    // Any attendance starting from year 2026 goes dynamically to the SECOND free cluster!
    // Older archives (or unspecified) default to the first cluster.
    if (year >= 2026) {
        return AttendanceArchive;
    }
    return AttendanceMaster;
};

// Distributed global query tool (Fetches from both clusters and fuses arrays seamlessly)
const globalFind = async (query = {}) => {
    const p1 = AttendanceMaster.find(query).populate('classId teacherId').populate('records.studentId');
    const p2 = AttendanceArchive.find(query).populate('classId teacherId').populate('records.studentId');
    
    const [res1, res2] = await Promise.all([p1, p2]);
    return [...res1, ...res2]; // Return fused stream
};

const executeGlobalDelete = async (ids) => {
    const p1 = AttendanceMaster.deleteMany({ _id: { $in: ids } });
    const p2 = AttendanceArchive.deleteMany({ _id: { $in: ids } });
    return Promise.all([p1, p2]);
};

module.exports = { initRouter, getModelForDate, globalFind, executeGlobalDelete };
