const DITRegistration = require('../models/DITRegistration');

// @desc    Register for DIT Batch 36
// @route   POST /api/registration/dit
// @access  Public
exports.registerDIT = async (req, res) => {
    try {
        const { name, fatherName, contactNumber, address } = req.body;

        if (!name || !fatherName || !contactNumber || !address) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const newRegistration = new DITRegistration({
            name,
            fatherName,
            contactNumber,
            address
        });

        await newRegistration.save();

        res.status(201).json({ msg: 'Registration successful', registration: newRegistration });
    } catch (err) {
        console.error('Error in DIT Registration:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
