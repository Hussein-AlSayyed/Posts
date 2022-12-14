const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hashedPassword => {
            const user = new User({
                email: req.body.email,
                password: hashedPassword,
            });
            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created',
                    });
                }).catch(error => {
                    res.status(500).json({
                        message: 'Invalid authentication credentials!'
                    })
                })
        })
}

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({
        email: req.body.email,
    })
        .then(user => {
            if (!user) {
                throw new Error('Invalid authentication credentials!');
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                throw new Error('Authentication failed!')
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id, },
                process.env.JWB_KEY,
                { expiresIn: '1h', }
            );
            res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id,
            });
        })
        .catch(error => {
            return res.status(401).json({
                message: error.message,
            });
        });
}