const { User, Post } = require("../models");
const fs = require('fs');
const path = require('path');

function encodeImages(postData) {
    let images = [];
    for (let i = 0; i < postData.images.length; i++) {
        let image = Buffer.from(postData.images[i].data).toString('base64');
        images.push({
            _id: postData.images[i]._id,
            contentType: postData.images[i].contentType,
            imageBase64: image
        });
    }
    return images;
}

function encodeImage(postData) {
    if (postData.images[0]) {
        let image = Buffer.from(postData.images[0].data).toString('base64');
        return {
            _id: postData.images[0]._id,
            contentType: postData.images[0].contentType,
            imageBase64: image
        };
    } else return [];
    
}

const postControllers = {
    getAllPosts(req, res) {
        Post.find({})
        .select('-__v -contactNumber -tips')
        .populate('userId', 'username')
        .then(postData => {
            let compiledPostData = []
            for (let i = 0; i < postData.length; i++) {
                let images = encodeImage(postData[i]);
                postData[i].images = [];
                compiledPostData.push({ data: postData[i], totalTips: postData[i].tipsReceived(), images: images });
            }
            res.status(200).json(compiledPostData)
        })
        .catch(err => { console.log(err); res.sendStatus(500);});
    },
    getOnePost(req, res) {
        Post.findById(req.params.id)
        .select('-__v -tips')
        .populate('userId', 'username')
        .then(postData => {
            const images = encodeImages(postData);
            postData.images = []; 
            res.status(200).json({ data: postData, totalTips: postData.tipsReceived(), images: images})
        })
        .catch(err => { console.log(err); res.sendStatus(500);});
    },
    getUsersPosts(req, res) { // get all posts associated with a user.
        Post.find({userId: req.user._id})
            .select('-__v')
            .populate('userId', 'username')
            .then(postData => {
                let compiledPostData = []
                for (let i = 0; i < postData.length; i++) {
                    let images = encodeImage(postData[i]);
                    postData[i].images = [];
                    compiledPostData.push({ data: postData[i], totalTips: postData[i].tipsReceived(), images: images });
                }
                res.status(200).json(compiledPostData)
            })
            .catch(err => { console.log(err); res.sendStatus(500); });
    }, 
    getUserPost(req, res) { // only user has access to this post, this is when they can view tips and edit the post
        Post.findById(req.params.id)
            .select('-__v')
            .populate('userId', 'username')
            .then(postData => {
                const images = encodeImages(postData);
                postData.images = [];
                res.status(200).json({ data: postData, totalTips: postData.tipsReceived(), images: images })
            })
            .catch(err => { console.log(err); res.sendStatus(500); });
    },
    createPost(req, res) {
        Post.create([{
            title: req.body.title,
            date: req.body.date,
            summary: req.body.summary,
            userId: req.user._id,
            video: req.body.videoLink || null,
            contactNumber: req.body.contactNumber || "000-000-0000"
        }],
        { new: true, runValidators: true })
        .then(postData => res.status(200).json({message: "Post Created Successfully"}))
        .catch(err => { console.log(err); res.sendStatus(500); });
    },
    addImageToPost(req, res) {
        Post.findOneAndUpdate({ _id: req.body.id, userId: req.user._id }, {
            $push: { images: { 
                data: fs.readFileSync(path.join(__dirname + "../../imageUploads/" + req.file.filename)),
                contentType: req.file.mimetype
                }
            }
        }, { new: true, runValidators: true })
            .select('-__v -userId')
            .then(postData => {
                if (!postData) {
                    res.status(404).json({message: "That Post was not found."})
                } else {
                    res.status(200).json({ message: "Image added successfully" })
                }
                fs.rm(path.join(__dirname + "../../imageUploads/" + req.file.filename), {}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                
            })
            .catch(err => { console.log(err); res.sendStatus(500); });
    },
    removeImageFromPost(req, res) {
        Post.findOneAndUpdate({ _id: req.body.id, userId: req.user._id  }, {
            $pull: {
                images: {
                    _id: req.body.imageId
                }
            }
        }, { new: true, runValidators: true })
            .select('-__v -userId')
            .then(postData => {
                if (!postData) {
                    res.status(404).json({ message: "That Post was not found." })
                } else {  
                    res.status(200).json({ message: "Image Removed Successfully"})
                }
            })
            .catch(err => { console.log(err); res.sendStatus(500); });
    },
    editImageOrder(req, res) {
        //Add a feature that allows the user to change the order of the images. What ever image is first is the main one.
        // this can be done by allowing the user to drag and drop them into any order. Once complete it sends the order as an array
        //of the old array indexes, for example [5,3,1,2,0,4] vs [0,1,2,3,4,5], the entire image field is changed accordingly.
    },
    editPost(req, res) {
        let postObj = {};
        if (req.body.title) {
            postObj.title = req.body.title;
        }
        if (req.body.summary) {
            postObj.summary = req.body.summary;
        }
        if (req.body.contactNumber) {
            postObj.contactNumber = req.body.contactNumber;
        }
        if (req.body.date) {
            postObj.date = req.body.date;
        }
        if (req.body.video) {
            postObj.video = req.body.videoLink;
        }
        if (!postObj) {
            return res.status(400).json({ message: 'You must enter a value to update!' })
        }
        Post.findOneAndUpdate({ _id: req.body.id, userId: req.user._id }, postObj, { new: true, runValidators: true })
            .select('-__v -userId')
            .populate('userId', 'username')
            .then(postData => {
                if (!postData) {
                    res.status(404).json({ message: "That Post was not found." })
                } else {
                    if (postData.images) {
                        const images = encodeImages(postData);
                        postData.images = [];
                        res.status(200).json({ data: postData, images: images })
                    } else {
                        res.status(200).json(postData)
                    }
                }
            })
            .catch(err => { console.log(err); res.sendStatus(500);});
    },
    deletePost(req, res) {
        Post.findOneAndDelete({_id: req.params.id, userId: req.user._id})
        .then(postData => res.status(200).json({message: "Post deleted successfully"}))
        .catch(err => {res.sendStatus(500); console.log(err);})
    }
}

module.exports = postControllers;