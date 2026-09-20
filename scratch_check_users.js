const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Teacher', 'Student'], required: true },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }]
}, { timestamps: true });

const User = mongoose.model('UserCheck', UserSchema, 'users');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb+srv://symecs:symecs@cluster0.zrguy7u.mongodb.net/attendancedb');
        console.log('Connected to MongoDB');
        
        const users = await User.find({});
        console.log('Total Users Found:', users.length);
        
        users.forEach(u => {
            console.log(`- Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
        });

        if (users.length === 0) {
            console.log('No users found in database.');
        }

        mongoose.disconnect();
    } catch (err) {
        console.error('Error checking users:', err);
    }
}

checkUsers();
