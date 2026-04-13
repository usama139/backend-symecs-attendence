const User = require('../models/User');
const AttendanceRouter = require('../models/AttendanceRouter');
const Class = require('../models/Class');

exports.getClasses = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id).populate('assignedClasses');
        res.json(teacher.assignedClasses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getStudentsByClass = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student', assignedClass: req.params.classId }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.markAttendanceBulk = async (req, res) => {
    try {
        const { date, classId, records } = req.body;
        const teacherId = req.user.id;

        const ModelTiedToCluster = AttendanceRouter.getModelForDate(date);

        let attendanceDoc = await ModelTiedToCluster.findOne({ classId, date });

        const mappedRecords = records.map(r => ({
            studentId: r.studentId,
            status: r.status
        }));

        if (attendanceDoc) {
            attendanceDoc.teacherId = teacherId;
            attendanceDoc.records = mappedRecords;
            await attendanceDoc.save();
        } else {
            attendanceDoc = new ModelTiedToCluster({
                date,
                classId,
                teacherId,
                records: mappedRecords
            });
            await attendanceDoc.save();
        }
        res.json(attendanceDoc);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getAttendance = async (req, res) => {
    try {
        // Teacher history queries globally across all distributed clusters to fuse timelines
        const docs = await AttendanceRouter.globalFind({ teacherId: req.user.id });
        
        let flattened = [];
        docs.forEach(session => {
            session.records.forEach(r => {
                if (r.studentId) {
                    flattened.push({
                        _id: `${session._id}_${r.studentId._id}`,
                        date: session.date,
                        classId: session.classId,
                        teacherId: session.teacherId,
                        studentId: r.studentId,
                        status: r.status
                    });
                }
            });
        });

        res.json(flattened);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
