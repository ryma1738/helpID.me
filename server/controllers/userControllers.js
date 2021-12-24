const { User } = require('../models');
const { signToken } = require('../utils/auth');

const userController = {
    // find all users 
    getAllUsers(req, res) {
        User.find({})
            .select('-__v -id')
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }));
    },

    getOneUser(req, res) {
        User.findById(req.user._id)
            .select('-__v -password')
            .then(userData => res.status(200).json(userData))
            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
    },

    // login with email and password
    userLogin(req, res) {
        User.findOne({
            email: req.body.email
        })
            .select('-__v')
            .then(async (userData) => {
                if (!userData || Object.keys(userData).length === 0) {
                    res.status(400).json({ errorMessage: 'No user found with this email!' });
                    return;
                } else {
                    const passwordValid = await userData.isCorrectPassword(req.body.password, userData.password);
                    if (passwordValid) {
                        if (userData.banReason) { //check if the user is banned
                            return res.status(403).json({ message: "Your account has been banned for policy violations", banReason: userData.banReason })
                        }
                        const token = signToken(userData);
                        const expires = new Date(new Date().getTime() + 210 * 1000);
                        res.status(200)
                            .cookie("jwt", token, { 
                                sameSite: "strict", 
                                expires: expires, 
                                httpOnly: true
                            }).cookie("loggedIn", true, {
                                sameSite: "strict",
                                expires: expires
                            }).json("User LoggedIn");
                    } else res.status(400).json({ errorMessage: 'Email or Password is incorrect!' });
                }
            })
            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
    },

    userLogout(req, res) {
        res.status(200).cookie("jwt", null, { 
            httpOnly: true, 
            sameSite: "strict",
            maxAge: 0,
            overwrite: true
        }).cookie("loggedIn", false, {
            sameSite: "strict",
            maxAge: 0,
            overwrite: true
        }).json("User Logged Out");
    },

    // Create new user
    createUser({ body }, res) {
        User.create(
            [{
                username: body.username,
                email: body.email,
                password: body.password, 
                phoneNumber: body.phoneNumber || undefined
            }],
            { new: true, runValidators: true })
            .then(userData => {
                const token = signToken(userData[0]);
                const expires = new Date(new Date().getTime() + 210 * 1000);
                res.status(200).cookie("jwt", token, {
                    sameSite: "strict",
                    expires: expires,
                    httpOnly: true,
                    secure: true
                }).cookie("loggedIn", true, {
                    sameSite: "strict",
                    expires: expires
                }).json("User Created");
            })
            .catch(err => {
                if (err.code === 11000) {
                    if (err.keyValue.username) {
                        return res.status(400).json({ errorMessage: 'A user with this username already exists. Please login or use a different username.'})
                    } else if (err.keyValue.email) {
                        return res.status(400).json({ errorMessage: 'A user with this email already exists. Please login or use a different email.' })
                    }
                } else if (err.errors.phoneNumber) {
                    return res.status(400).json({ errorMessage: "Phone number is invalid", errMessage: err.errors.phoneNumber.message })
                }
                return res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message })
            });
    },

    // Update user by ID
    updateUser(req, res) {
        let userObj = {};
        if (req.body.username) {
            userObj.username = req.body.username;
        }
        if (req.body.email) {
            userObj.email = req.body.email;
        }
        if (req.body.password) {
            userObj.password = req.body.password;
        }
        if (req.body.phoneNumber) {
            userObj.phoneNumber = req.body.phoneNumber;
        }
        if (Object.keys(userObj).length === 0) {
            return res.status(400).json({ errorMessage: 'You must enter a value to update!' })
        }
        User.findOneAndUpdate(
            { _id: req.user._id },
            userObj,
            { new: true, runValidators: true })
            .select('-__v -password')
            .then(userData => {
                if (Object.keys(userData).length === 0) {
                    res.status(404).json({ errorMessage: 'No user found with this id!' });
                    return;
                }
                const token = signToken(userData);
                res.status(200).json([userData, token]);
            })
            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
    },

    // delete user TODO: delete all of the users posts but not their tips
    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.user._id })
            .then(userData => {
                if (Object.keys(userData).length === 0) return res.status(400).json({ errorMessage: 'This user does not exist!' })
                res.status(200).json({ message: 'This user was deleted!' })
            })
            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }));;
    },
    renewToken(req, res) {
        User.findById(req.user._id).lean().then(userData => {
            const token = signToken(userData);
            const expires = new Date(new Date().getTime() + 210 * 1000)
            res.status(200).cookie("jwt", token, {
                sameSite: "strict",
                expires: expires,
                httpOnly: true,
                secure: true
            }).cookie("loggedIn", true, {
                sameSite: "strict",
                expires: expires
            }).json("Token Renewed");
        }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
    }
}

module.exports = userController;