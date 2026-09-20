const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});

const User = mongoose.model('UserCheckPass', UserSchema, 'users');

async function testPasswords() {
    try {
        await mongoose.connect('mongodb+srv://symecs:symecs@cluster0.zrguy7u.mongodb.net/attendancedb');
        
        const admin = await User.findOne({ role: 'Admin' });
        const teachers = await User.find({ role: 'Teacher' });

        const passwordsToTry = ['admin123', '123456', '12345678', 'admin', 'symecs', 'symecs123', 'teacher123', 'usama123', 'komal123', 'password'];

        console.log('=== ADMIN USER ===');
        if (admin) {
            console.log(`Name: ${admin.name}, Email: ${admin.email}`);
            let found = false;
            for (let pass of passwordsToTry) {
                const match = await bcrypt.compare(pass, admin.password);
                if (match) {
                    console.log(`>>> MATCHED PASSWORD FOR ADMIN: ${pass}`);
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log('Password hash did not match standard test list. Resetting Admin password to: admin123');
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash('admin123', salt);
                await admin.save();
                console.log('>>> Admin password successfully set to: admin123');
            }
        }

        console.log('\n=== TEACHER USERS ===');
        for (let teacher of teachers) {
            console.log(`Teacher Name: ${teacher.name}, Email: ${teacher.email}`);
            let found = false;
            for (let pass of passwordsToTry) {
                const match = await bcrypt.compare(pass, teacher.password);
                if (match) {
                    console.log(`>>> MATCHED PASSWORD FOR ${teacher.name}: ${pass}`);
                    found = true;
                    break;
                }
            }
            if (!found) {
                const defaultPass = teacher.name.toLowerCase().includes('usama') ? 'usama123' : 'teacher123';
                console.log(`Resetting password for ${teacher.name} to: ${defaultPass}`);
                const salt = await bcrypt.genSalt(10);
                teacher.password = await bcrypt.hash(defaultPass, salt);
                await teacher.save();
                console.log(`>>> ${teacher.name} password set to: ${defaultPass}`);
            }
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

testPasswords();
