const express = require('express');
const multer = require('multer');

const router = express.Router()

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const MIME_FILE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_FILE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        if (isValid) {
            error = null;
        }
        cb(error, 'backend/images')
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_FILE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})

router.post(
    '',
    checkAuth,
    multer({ storage: storage }).single('image'),
    (req, res, next) => {
        const url = req.protocol + '://' + req.get('host');
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imagePath: url + '/images/' + req.file.filename,
            creator: req.userData.userId
        });
        post.save().then((createdPost) => {
            res.status(201).json({
                message: 'Post added successfully',
                post: {
                    id: createdPost._id,
                    title: createdPost.title,
                    content: createdPost.content,
                    imagePath: createdPost.imagePath,
                    creator: createdPost.userId,
                }
            });
        });
    });

router.get(
    '',
    (req, res, next) => {
        const pageSize = +req.query.pagesize;
        const currentPage = +req.query.page;
        const postQuery = Post.find();
        let fetchPosts;
        if (pageSize && currentPage) {
            postQuery
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
        }
        postQuery
            .then(documents => {
                fetchPosts = documents;
                return Post.count();
            })
            .then(maxPostsCount => {
                res.status(200).json({
                    message: 'Posts fetched successfully!',
                    posts: fetchPosts,
                    maxPostsCount: maxPostsCount,
                });
            })
    });

router.get(
    '/:id',
    (req, res, next) => {
        Post.findById(req.params.id)
            .then(
                post => {
                    if (post) {
                        res.status(200).json(post);
                    } else {
                        res.status(404).json({
                            message: "Post was not found!"
                        })
                    }
                }
            )
    })

router.put(
    '/:id',
    checkAuth,
    multer({ storage: storage }).single('image'),
    (req, res, next) => {
        let imagePath = req.body.imagePath;
        if (req.file) {
            const url = req.protocol + '://' + req.get('host');
            imagePath = url + '/images/' + req.file.filename;
        }
        const post = new Post({
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            imagePath: imagePath,
            creator: req.userData.userId,
        });
        Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
            .then((result) => {
                if (result.modifiedCount > 0) {
                    res.status(200).json({
                        message: "Updated Successfully"
                    });
                } else {
                    res.status(401).json({
                        message: "Not Authorized",
                    });
                }
            })
    });

router.delete(
    "/:id",
    checkAuth,
    (req, res, next) => {
        Post.deleteOne({
            _id: req.params.id,
            creator: req.userData.userId,
        })
            .then((result) => {
                if (result.deletedCount > 0) {
                    res.status(200).json({
                        message: "Post Deleted",
                    });
                } else {
                    res.status(401).json({
                        message: "Not Authorized",
                    });
                }
            })
    });

module.exports = router;