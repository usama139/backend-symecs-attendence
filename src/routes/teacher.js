const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect, teacherOnly);

router.get('/classes', teacherController.getClasses);
router.get('/classes/:classId/students', teacherController.getStudentsByClass);
router.post('/attendance', teacherController.markAttendanceBulk);
router.get('/attendance', teacherController.getAttendance);

module.exports = router;
