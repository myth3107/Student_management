const Student = require('../models/student');

/**
 * Service layer for student CRUD operations.
 * Errors are thrown and should be handled by controllers.
 */

async function getAllStudents() {
    return Student.find().lean();
}

async function createStudent(data) {
    const student = new Student(data);
    return student.save();
}

async function getStudentById(id) {
    return Student.findById(id);
}

async function updateStudentById(id, update) {
    return Student.findByIdAndUpdate(id, update, { new: true, runValidators: true });
}

async function deleteStudentById(id) {
    return Student.findByIdAndDelete(id);
}

module.exports = {
    getAllStudents,
    createStudent,
    getStudentById,
    updateStudentById,
    deleteStudentById
};