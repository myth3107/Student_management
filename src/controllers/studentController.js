const Student = require('../models/student');

class StudentController {
    constructor(studentService) {
        this.studentService = studentService;
    }

    async createStudent(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });
            if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

            const { name, age, city } = req.body;
            if (!name) return res.status(400).json({ message: 'name is required' });

            const student = new Student({ name, age, city });
            await student.save();

            return res.status(201).json({ data: student });
        } catch (err) {
            console.error('createStudent error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getStudent(req, res) {
        try {
            const studentId = req.params.id;
            const student = await this.studentService.getStudent(studentId);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.status(200).json(student);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateStudent(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });
            if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

            const { id } = req.params;
            const { name, age, city } = req.body;

            const student = await Student.findById(id);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            if (name !== undefined) student.name = name;
            if (age !== undefined) student.age = age;
            if (city !== undefined) student.city = city;

            await student.save();
            return res.status(200).json({ data: student });
        } catch (err) {
            console.error('updateStudent error:', err);
            if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid student id' });
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async deleteStudent(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });
            if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

            const { id } = req.params;
            const student = await Student.findByIdAndDelete(id);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            return res.status(200).json({ message: 'Student deleted' });
        } catch (err) {
            console.error('deleteStudent error:', err);
            if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid student id' });
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
async createStudentsBulk(req, res) {
    try {
        // Authorization checks
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admin only' });
        }

        // Expect array directly in req.body
        const students = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                message: 'Request body must be a non-empty array of students'
            });
        }

        // Bulk insert
        const inserted = await Student.insertMany(students, { ordered: false });

        return res.status(201).json({
            message: 'Students added successfully',
            count: inserted.length,
            data: inserted
        });

    } catch (err) {
        console.error('createStudentsBulk error:', err);

        // Partial success (duplicate keys, validation issues)
        if (err.name === 'BulkWriteError') {
            return res.status(207).json({
                message: 'Partial success',
                error: err.message,
                writeErrors: err.writeErrors
            });
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
}

    async getAllStudents(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });
            if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

            const students = await Student.find().lean();
            return res.status(200).json({ data: students });
        } catch (err) {
            console.error('getAllStudents error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = StudentController;