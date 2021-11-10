const { User, Post } = require("../models");

const postControllers = {
    getAllPosts(req, res) {
        Post.find({})
        .select('-userId -contactNumber -tips')
        .then(postData => res.status(200).json(postData))
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    },
    getOnePost(req, res) {
        Post.findById(req.params.id)
        .select('-userId -tips')
        .then(postData => {
            postData.totalTips = postData.tipsReceived();
            res.status(200).json(postData)
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    },
    getUsersPosts(req, res) { // get all posts associated with a user.
        Post.find({userId: req.user._id})
            .select('-userId')
            .then(postData => res.status(200).json(postData))
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    }, 
    getUserPost(req, res) { // only user has access to this post, this is when they can view tips and edit the post
        Post.findById(req.params.id)
            .select('-userId')
            .then(postData => {
                postData.totalTips = postData.tipsReceived();
                res.status(200).json(postData)
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    },
    createPost(req, res) {
        Post.create([{
            
        }],
            { new: true, runValidators: true })
    }
    
}

module.exports = postControllers;