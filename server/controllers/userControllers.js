const { User } = require('../models');
const { signToken } = require('../utils/auth');

const userController = {
    // find all users 
    getAllUsers(req, res) {
        User.find({})  
            .select('-__v -password -id')
            .then(dbUserData => res.status(200).json(dbUserData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    },

    getOneUser(req, res) {
        User.findById(req.user._id)
            .select('-__v -password')
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(500).json(err))
    },

    // login with email and password
    userLogin(req, res) {
        User.findOne({
            email: req.body.email
        })
            .select('-__v')
            .then(async (dbUserData) => {
                if (!dbUserData || dbUserData === {} || dbUserData.length === 0) {
                    res.status(404).json({ message: 'No user found with this email!' });
                    return;
                } else {
                    const passwordValid = await dbUserData.isCorrectPassword(req.body.password, dbUserData.password);
                    if (passwordValid) {
                        const token = signToken(dbUserData);
                        res.status(200).json(token);
                    } else res.status(400).json({ message: 'Incorrect password' });
                }
            })
            .catch(err => res.status(500).json({ error: err }))
    },

    // Create new user
    createUser({ body }, res) {
        User.create(
            [{
                username: body.username,
                email: body.email,
                password: body.password
            }],
            { new: true, runValidators: true })
            .then(userData => {
                const token = signToken(userData[0]);
                res.status(200).json(token);
            })
            .catch(err => res.status(500).json({ message: 'A user with this email already exists. Please login or use a different email.', error: err }));
    },

    // Update user by ID
    updateUser(req, res) {
        let userObj = {};
        if (req.body.name) {
            userObj.name = req.body.name;
        }
        if (req.body.email) {
            userObj.email = req.body.email;
        }
        if (req.body.password) {
            userObj.password = req.body.password;
        }
        if (!userObj) {
            return res.status(400).json({ message: 'You must enter a value to update!' })
        }
        User.findOneAndUpdate(
            { _id: req.user._id },
            userObj,
            { new: true, runValidators: true })
            .select('-__v -password')
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with this id!' });
                    return;
                }
                const token = signToken(dbUserData);
                res.status(200).json([dbUserData, token]);
            })
            .catch(err => res.status(500).json({ error: err }))
    },

    // delete user 
    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.user._id })
            .then(userData => {
                if (!userData) return res.status(400).json({ message: 'This user does not exist!' })
                res.status(200).json({ message: 'This user was deleted!' })
            })
            .catch(err => res.status(500).json({ error: err }));;

    }
}

module.exports = userController;