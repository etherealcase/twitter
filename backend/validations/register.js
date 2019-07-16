import Validator from 'validator';
import isEmpty from './is-empty';

module.exports = function validateRegisterInput(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';


    if(!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 to 30 chars';
    }

    if(Validator.isEmpty(data.name)) {
        errors.name = 'Name is required';
    }

    if(!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }
    
    if (!Validator.isLength(data.password, {min: 2, max: 30})) {
        errors.password = 'Password must have 2 chars';
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = 'Password is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};