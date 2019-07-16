const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateForgotInput(data) {
    let errors = {};


    data.password = !isEmpty(data.password) ? data.password : '';
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : '';



    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    if (Validator.isEmpty(data.confirm_password)) {
        errors.confirm_password = 'Confirm Password field is required';
    }

    if (!Validator.equals(data.password, data.confirm_password)) {
        errors.confirm_password = 'Passwords must match';
    }


    return {
        errors,
        isValid: isEmpty(errors)
    };
};