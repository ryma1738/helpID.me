const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../models');

const secret = process.env.JWT_SECRET;
const expiration = '2h';

module.exports = {
    signToken({ email, _id, admin }) {
        const payload = { email, _id, admin };
        return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    },
    verifyToken(req, res, next) {
        let token = req.headers.authorization;
        let bearerToken;

        // separate "Bearer" from "<tokenvalue>"
        if (token) {
            bearerToken = token
                .split(' ')
                .pop()
                .trim();
        } else {
            res.sendStatus(401);
        }
        try {
            // decode and attach user data to request object
            const { data } = jwt.verify(bearerToken, secret, { maxAge: expiration });
            req.user = data;
            next()
        } catch {
            res.sendStatus(401);
        }

    },
    verifyTokenAdmin(req, res, next) {
        let token = req.headers.authorization;
        let bearerToken;

        // separate "Bearer" from "<tokenvalue>"
        if (token) {
            bearerToken = token
                .split(' ')
                .pop()
                .trim();
        } else {
            res.sendStatus(401);
        }

        try {
            // decode and attach user data to request object
            const { data } = jwt.verify(bearerToken, secret, { maxAge: expiration });
            if (data.admin === true) {
                User.findOne({ _id: data._id })
                    .then(userData => {
                        if (userData.admin === true) {
                            req.user = data;
                            next();
                        } else res.status(403).json({ message: 'You do not have the rights to access this content!' });
                    })
                    .catch(err => res.status(500).json(err));
            } else {
                res.status(403).json({ message: 'You do not have the rights to access this content!' });
            }
        } catch {
            res.sendStatus(401);
        }
    }
}
//jwt is saved to local storage on client side