const DITRegistration = require('../models/DITRegistration');

// @desc    Register for DIT Batch 36
// @route   POST /api/registration/dit
// @access  Public
exports.registerDIT = async (req, res) => {
    try {
        const { name, fatherName, contactNumber, address, course, email, dob } = req.body;

        if (!name || !fatherName || !contactNumber) {
            return res.status(400).json({ msg: 'Please enter required fields (Name, Father Name, Contact Number)' });
        }

        const newRegistration = new DITRegistration({
            name,
            fatherName,
            contactNumber,
            address: address || 'Mirpurkhas',
            course: course || 'DIT (Diploma in Information Technology) - 1 Year',
            email: email || '',
            dob: dob || ''
        });

        await newRegistration.save();

        res.status(201).json({ msg: 'Registration successful', registration: newRegistration });
    } catch (err) {
        console.error('Error in DIT Registration:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
