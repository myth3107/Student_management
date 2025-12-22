const mongoose = require('mongoose');

function sendBadRequest(res, msg) {
    return res.status(400).json({ message: msg });
}

function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}

function validateEmail(email) {
    // simple email regex
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSignup(req, res, next) {
    const { name, email, password, role } = req.body;
    if (!isNonEmptyString(name)) return sendBadRequest(res, 'name is required');
    if (!validateEmail(email)) return sendBadRequest(res, 'valid email is required');
    if (!isNonEmptyString(password) || password.length < 6) return sendBadRequest(res, 'password must be at least 6 characters');
    if (role && !['admin', 'student'].includes(role)) return sendBadRequest(res, 'role must be either "admin" or "student"');
    next();
}

function validateLogin(req, res, next) {
    const { email, password } = req.body;
    if (!validateEmail(email)) return sendBadRequest(res, 'valid email is required');
    if (!isNonEmptyString(password)) return sendBadRequest(res, 'password is required');
    next();
}

function validateStudentCreate(req, res, next) {
    const { name, age, city } = req.body;
    if (!isNonEmptyString(name)) return sendBadRequest(res, 'name is required');
    if (age !== undefined && (typeof age !== 'number' || Number.isNaN(age) || age < 0)) return sendBadRequest(res, 'age must be a non-negative number');
    if (city !== undefined && typeof city !== 'string') return sendBadRequest(res, 'city must be a string');
    next();
}

function validateStudentUpdate(req, res, next) {
    const { name, age, city } = req.body;
    if (name === undefined && age === undefined && city === undefined) return sendBadRequest(res, 'at least one of name, age or city must be provided');
    if (name !== undefined && !isNonEmptyString(name)) return sendBadRequest(res, 'name must be a non-empty string');
    if (age !== undefined && (typeof age !== 'number' || Number.isNaN(age) || age < 0)) return sendBadRequest(res, 'age must be a non-negative number');
    if (city !== undefined && typeof city !== 'string') return sendBadRequest(res, 'city must be a string');
    next();
}

function validateCourseCreate(req, res, next) {
    const { title, description } = req.body;
    if (!isNonEmptyString(title)) return sendBadRequest(res, 'title is required');
    if (description !== undefined && typeof description !== 'string') return sendBadRequest(res, 'description must be a string');
    next();
}

function validateObjectIdParam(paramName = 'id') {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id) return sendBadRequest(res, `missing param ${paramName}`);
        if (!mongoose.Types.ObjectId.isValid(id)) return sendBadRequest(res, `invalid ${paramName}`);
        next();
    };
}

function validateEnroll(req, res, next) {
    // courseId may be in params or body depending on route design
    const courseId = req.params.courseId || req.body.courseId;
    if (!courseId) return sendBadRequest(res, 'courseId is required');
    if (!mongoose.Types.ObjectId.isValid(courseId)) return sendBadRequest(res, 'invalid courseId');
    next();
}

module.exports = {
    validateSignup,
    validateLogin,
    validateStudentCreate,
    validateStudentUpdate,
    validateCourseCreate,
    validateEnroll,
    validateObjectIdParam
};