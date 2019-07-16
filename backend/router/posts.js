import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import multer from 'multer';


const router = express.Router();

import Post from '../models/Post';
import User from '../models/User';


const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
});
const upload = multer({storage: storage});



router.get('/', (req,res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({msg: 'No posts'}))
});

router.post('/',
    upload.single('postImage'), passport.authenticate('jwt', { session: false }),
    async (req,res) => {
    try {
        const user  = await User.findById(req.user.id);
        const newPost = new Post( {
            text: req.body.text,
            postImage: req.file.path,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    }catch (err) {
        res.status(500).send('Server Error')
    }
});

router.get(
    '/users',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Post.find({user: req.user.id})
            .sort({date: -1})
            .then(post => res.json(post))
            .catch(err => res.status(404).json({nopostsfound: 'No posts found'}));
    });


router.get('/users/:id', async (req, res) => {
    try {
        const post = await Post.find({
            user: req.params.id
        })
            .sort({date: -1});

        res.json(post);
    } catch (err) {
        console.error(err.message);

        res.status(500).send('Server Error');
    }
});


router.get('/:id',passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});
router.delete('/:id',passport.authenticate('jwt', { session: false }), async (req,res) => {
    await Post.findById(req.params.id)
        .then( post => {
            post.remove()
                .then(() => res.json({success: true}))
        })
});

router.put('/like/:id',passport.authenticate('jwt', { session: false }), async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'Post already liked'})
        }
        post.likes.unshift({user: req.user.id});

        await post.save();

        res.json(post.likes);
    } catch (err) {
        res.status(500).send('Server Error')
    }
});

router.put('/unlike/:id',passport.authenticate('jwt', { session: false }), async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length === 0
        ) {
            return res.status(400).json({msg: 'Post has not been liked yet'})
        }

        const removeIndex = post.likes
            .map(like => like.user.toString())
            .indexOf(req.user.id);

        post.likes.splice(removeIndex,1);

        await post.save();
        res.json(post.likes)
    }catch (err) {
        res.status(500).send('Server Error')
    }
});

router.post(
    '/comment/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

router.delete('/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Pull out comment
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id
        );

        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        // Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Get remove index
        const removeIndex = post.comments
            .map(comment => comment.id)
            .indexOf(req.params.comment_id);

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




module.exports = router;