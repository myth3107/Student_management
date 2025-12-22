const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    age: {
        type: Number,
        min: 0
    },
    city: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'students'
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;