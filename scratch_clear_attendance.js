const mongoose = require('mongoose');
const AttendanceSchema = require('./src/models/Attendance');

async function clearAllAttendance() {
    try {
        console.log('Connecting to Cluster 0...');
        const conn0 = await mongoose.connect('mongodb+srv://symecs:symecs@cluster0.zrguy7u.mongodb.net/attendancedb');
        const AttendanceMaster = conn0.model('Attendance', AttendanceSchema);
        const res0 = await AttendanceMaster.deleteMany({});
        console.log(`Cluster 0 Attendance cleared: ${res0.deletedCount} documents removed.`);

        console.log('Connecting to Cluster 1...');
        const conn1 = mongoose.createConnection('mongodb+srv://symecsmalik_db_user:BuK7wSJSA1LKF3k5@cluster1.y1dqfrd.mongodb.net/attendancedb');
        await new Promise((resolve) => conn1.on('connected', resolve));
        const AttendanceArchive = conn1.model('Attendance', AttendanceSchema);
        const res1 = await AttendanceArchive.deleteMany({});
        console.log(`Cluster 1 Attendance cleared: ${res1.deletedCount} documents removed.`);

        console.log('\n✅ ALL ATTENDANCE HISTORY HAS BEEN SUCCESSFULLY CLEARED FROM THE DATABASE!');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing attendance:', err);
        process.exit(1);
    }
}

clearAllAttendance();
