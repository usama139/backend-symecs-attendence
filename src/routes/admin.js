const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.post('/classes', adminController.addClass);
router.get('/classes', adminController.getClasses);

router.post('/teachers', adminController.addTeacher);
router.get('/teachers', adminController.getTeachers);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.removeTeacher);

router.post('/students', adminController.addStudent);
router.get('/students', adminController.getStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.removeStudent);

router.get('/attendance', adminController.getAllAttendance);
router.get('/archive-attendance', adminController.archiveOldAttendance);

module.exports = router;
