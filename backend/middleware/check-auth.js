const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'This_Secret_Validation_Key_Should_Be_Longer');
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Authentication Faild'
        })
    }
}