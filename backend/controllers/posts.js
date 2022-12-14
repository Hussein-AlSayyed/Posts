const Post = require('../models/post');

exports.createPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    post.save()
        .then((createdPost) => {
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
        })
        .catch(error => {
            res.status(500).json({
                message: 'Creating the post failed!',
            });
        });
}

exports.getPosts = (req, res, next) => {
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
        .catch(error => {
            res.status(500).json({
                message: 'Fetching posts failed!',
            });
        })
}

exports.getPost = (req, res, next) => {
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
        ).catch(error => {
            res.status(500).json({
                message: 'Fetching post failed!',
            });
        })
}

exports.updatePost = (req, res, next) => {
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
            } else if (result.modifiedCount === 0 & result.matchedCount === 1) {
                res.status(200).json({
                    message: "Nothing Changed"
                });
            } else {
                res.status(401).json({
                    message: "Not authorized",
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Could not update post!',
            });
        })
}

exports.deletePost = (req, res, next) => {
    Post.deleteOne({
        _id: req.params.id,
        creator: req.userData.userId,
    })
        .then((result) => {
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Post deleted",
                });
            } else {
                res.status(401).json({
                    message: "Not authorized",
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'could not delete post!',
            });
        })
}