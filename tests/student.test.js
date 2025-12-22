const StudentController = require('../src/controllers/studentController');
const studentService = require('../src/services/studentService');

describe('StudentController', () => {
    let studentController;
    beforeEach(() => {
        studentController = new StudentController(studentService);
    });

    test('should create a student', async () => {
        const req = { body: { name: 'John Doe', age: 20 } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await studentController.createStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'John Doe', age: 20 }));
    });

    test('should get a student', async () => {
        const req = { params: { id: '1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await studentController.getStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });

    test('should update a student', async () => {
        const req = { params: { id: '1' }, body: { name: 'Jane Doe' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await studentController.updateStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
    });

    test('should delete a student', async () => {
        const req = { params: { id: '1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await studentController.deleteStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).not.toHaveBeenCalled();
    });
});