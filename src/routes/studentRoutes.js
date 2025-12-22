const express = require('express');
const StudentController = require('../controllers/studentController');
const studentService = require('../services/studentService');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

const router = express.Router();
const studentController = new StudentController(studentService);

// All student management routes are admin-only
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/students', studentController.getAllStudents.bind(studentController));
router.post('/students', studentController.createStudent.bind(studentController));
router.post('/students/bulk', studentController.createStudentsBulk.bind(studentController));
router.put('/students/:id', studentController.updateStudent.bind(studentController));
router.delete('/students/:id', studentController.deleteStudent.bind(studentController));

module.exports = router;