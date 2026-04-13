const User = require('../models/User');
const AttendanceRouter = require('../models/AttendanceRouter');
const Class = require('../models/Class');
const bcrypt = require('bcryptjs');

// --- Classes ---
exports.addClass = async (req, res) => {
    const { name, timing } = req.body;
    try {
        const newClass = new Class({ name, timing });
        await newClass.save();
        res.json({ msg: 'Class added successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        // aggregate student counts
        const cnts = await User.aggregate([
            { $match: { role: 'Student', assignedClass: { $ne: null } } },
            { $group: { _id: '$assignedClass', count: { $sum: 1 } } }
        ]);
        const classData = classes.map(c => {
            const found = cnts.find(cnt => cnt._id.toString() === c._id.toString());
            return { ...c.toObject(), totalStudents: found ? found.count : 0 };
        });
        res.json(classData);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- Teachers ---
exports.addTeacher = async (req, res) => {
    const { name, email, password, assignedClasses } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        
        user = new User({ name, email, password, role: 'Teacher', assignedClasses });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.json({ msg: 'Teacher added successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Teacher' }).select('-password').populate('assignedClasses', 'name');
        res.json(teachers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateTeacher = async (req, res) => {
    const { name, email, password, assignedClasses } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.name = name || user.name;
        user.email = email || user.email;
        user.assignedClasses = assignedClasses || user.assignedClasses;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json({ msg: 'Teacher updated successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.removeTeacher = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Teacher removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- Students ---
exports.addStudent = async (req, res) => {
    const { name, email, password, assignedClass } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        
        user = new User({ name, email, password, role: 'Student', assignedClass });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.json({ msg: 'Student added successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).select('-password').populate('assignedClass', 'name');
        res.json(students);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateStudent = async (req, res) => {
    const { name, email, password, assignedClass } = req.body;
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.name = name || user.name;
        user.email = email || user.email;
        user.assignedClass = assignedClass || user.assignedClass;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json({ msg: 'Student updated successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.removeStudent = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Student removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- Attendance ---
exports.getAllAttendance = async (req, res) => {
    try {
        const docs = await AttendanceRouter.globalFind();
        
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

exports.archiveOldAttendance = async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2026-04"
        
        // Find all records
        const docs = await AttendanceRouter.globalFind();
        
        // Filter those older than the current month
        const oldDocs = docs.filter(d => d.date.slice(0, 7) !== currentMonth);
        
        if (oldDocs.length === 0) {
            return res.status(404).json({ msg: "Your server has no old monthly records to archive at this time!" });
        }

        // Build CSV Data structure
        let csvString = "Date,Class Name,Teacher Name,Student Email/ID,Student Name,Status\n";
        let oldDocIds = [];

        oldDocs.forEach(session => {
            oldDocIds.push(session._id); // Stack for deletion action
            session.records.forEach(r => {
                const className = session.classId?.name || 'Deleted Class';
                const teacherName = session.teacherId?.name || 'Deleted Teacher';
                const studentId = r.studentId?.email || 'Unknown';
                const studentName = r.studentId?.name || 'Unknown';
                csvString += `${session.date},"${className}","${teacherName}","${studentId}","${studentName}",${r.status}\n`;
            });
        });

        // Nuke old data automatically across all clusters!
        await AttendanceRouter.executeGlobalDelete(oldDocIds);

        // Stream the literal CSV data payload securely back to frontend for local download
        res.header('Content-Type', 'text/csv');
        res.attachment(`Symecs_Attendance_Archive_Before_${currentMonth}.csv`);
        return res.send(csvString);

    } catch (err) {
        console.error("Archive Error:", err);
        res.status(500).send('Archive Server Error');
    }
};
