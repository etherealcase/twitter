import express from 'express';
import passport from 'passport';


import Profile from '../models/Profile'
import User from '../models/User'

const router = express.Router();


router.get('/me', async (req,res) =>{
    try {
        const profile = await Profile.findOne({user: req.user.id})
            .populate('users', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/',passport.authenticate('jwt', { session: false }), async (req,res) => {

    const {
      website,
      location,
        bio,
      youtube,
      facebook,
      twitter,
      instagram,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;


    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({user: req.user.id});
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id},
                { $set: profileFields},
                { new: true}
            );

            return res.json(profile)
        }
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch(err) {
        res.status(500).send('Server Error')
    }


});


router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (err) {

        res.status(500).send('Server Error');
    }
});



router.delete('/', async (req, res) => {
    try {
        await Profile.findOneAndRemove({user: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});

        res.json({ msg: 'User deleted'})
    } catch (err) {
        res.status(500).send('Server Error')
    }
});






module.exports = router;
