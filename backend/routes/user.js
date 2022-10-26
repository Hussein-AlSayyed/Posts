const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router()

const User = require('../models/user');
const user = require('../models/user');

router.post('/signup', (req, res, next) => {
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
                        result: result,
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error,
                    })
                })
        })
});

router.post('/login', (req, res, next) => {
    let fetchedUser;
    User.findOne({
        email: req.body.email,
    })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Authentication Failed',
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: 'Authentication Failed',
                });
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id, },
                'This_Secret_Validation_Key_Should_Be_Longer',
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
                message: 'Authentication Failed',
            });
        });
});

module.exports = router;