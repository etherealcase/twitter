import express from 'express';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt  from 'jsonwebtoken'
import nodemailer from 'nodemailer';
import crypto from 'crypto'

import validateRegisterInput from '../validations/register'
import validateLoginInput from '../validations/login'
import validateForgotInput from '../validations/forgot-password'

const router = express.Router();

import User from '../models/User'

router.post('/register', (req,res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    User.findOne({email})
        .then(user => {
        if (user) {
            return res.status(400).json({email: 'Email already exists'})
        } else {
            const avatar = gravatar.url(email, {s: '200', r:'pg', d: 'mm'});
            const newUser = new User({
                name,
                email,
                password,
                avatar});

            bcrypt.genSalt(10, (err, salt) => {
                if (err) console.log('There was an error', err);
                else {
                    bcrypt.hash(newUser.password, salt, (err,hash) => {
                        if(err) console.error('There was an error', err);
                        else {
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {res.json(user)})
                        }
                    })
                }
            })
        }
    })
});

router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
       email
    })
        .then(user => {
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        };
                        jwt.sign(
                            payload,
                            'secret',
                            {expiresIn: 1800},
                            (err, token) => {
                            if(err) console.error('There is some error in token', err);
                            else {
                                res.json({
                                    success: true,
                                    token: `Bearer ${token}`
                                });
                            }
                        });
                    }
                    else {
                        errors.password = 'Incorrect Password';
                        return res.status(400).json(errors);
                    }
                });
        });
});


router.post('/forgotPassword', (req, res) => {
    const { errors, isValid } = validateForgotInput(req.body);


    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({

        email: req.body.email

    })
        .then(user => {
            if (user === null){
                res.json('email not in bd')
            } else {
                const token = crypto.randomBytes(20).toString('hex');
                user.update({
                    resetPasswordToken: token,
                    resetPasswordExpires: Date.now() + 360000,

                });

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: `dchelovekov@gmail.com`,
                        pass: ``
                    }
                })


                const mailOptions = {
                    from: `dchelovekov@gmail.com`,
                    to: `${user.email}`,
                    subject: `Link To Reset Password`,
                    text: `text email ` + `` +
                        `http://localhost:3000/reset/${token}\n\n`
                }

                transporter.sendMail(mailOptions, (err, response) => {
                    if (err) {
                        console.log('there was an error: ', err)
                    } else {
                        console.log('here is the res: ', response);
                        res.status(200).json('recovery email sent')
                    }
                })
            }
        })
});

router.get('/reset', (req,res) => {
    User.findOne({

        resetPasswordToken: req.params.token,
        resetPasswordExpires: Date.now(),


    })
        .then(user => {
            if (user === null) {
                console.error('password reset link is invalid or has expired');
                res.status(403).send('password reset link is invalid or has expired');
            } else {
                res.status(200).send({
                    user,

                })
            }
        })
})

router.put('/resetViaEmail',(req,res) => {
    const BCRYPT_SALT_ROUNDS = 12;
    User.findOne({
        email: req.body.email
    })
        .then( user => {
            if (user !== null) {
                console.log('user exist');
                bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
                    .then(hashedPassword => {
                        user.update({
                            password:hashedPassword,
                            resetPasswordToken: null,
                            resetPasswordExpires: null
                        })
                    })
                    .then(() => {
                        console.log('password update');
                        res.status(200).send({message: 'password update'})
                    })
            } else {
                console.log('no');
                res.status(404).json('no user exists')
            }
        })

})





router.get('/search', (req,res) => {
    const user = req.body.name;
    User.findOne({
        user
    })
        .then(user => {res.json(user)})
        .catch(err => console.log(err))
})


module.exports = router;



