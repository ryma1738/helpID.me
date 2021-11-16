const { Post } = require("../models");
const fs = require('fs');
const path = require('path');
const { encodeImage, encodeImages, encodeSingleImage } = require('../utils/helpers')

const postControllers = {
    getAllPosts(req, res) { // need to modify to accept search and sort params
        Post.find({})
        .select('-__v -contactNumber -tips')
        .populate('userId', 'username')
        .then(postData => {
            let compiledPostData = []
            for (let i = 0; i < postData.length; i++) {
                let image = encodeImage(postData[i]);
                postData[i].images = [];
                compiledPostData.push({ data: postData[i], totalTips: postData[i].tipsReceived(), image: image });
            }
            res.status(200).json(compiledPostData)
        })
        .catch(err => { console.log(err); res.sendStatus(500);});
    },
    getOnePost(req, res) {
        Post.findById(req.params.id)
        .select('-__v')
        .populate('userId', 'username')
        .populate('tips', 'title subject image')
        .then(async postData => {
            if (!postData) {
                res.status(404).json({message: "Post not found"});
            } else {
                const images = encodeImages(postData);
                postData.images = [];
                for (let i =0; i < postData.tips.length; i++) {
                    if (postData.tips[i].image) {
                        postData.tips[i].image.data = encodeSingleImage(postData.tips[i].data); // encode tips images
                    }
                }
                res.status(200).json({ data: postData, totalTips: postData.tipsReceived(), images: images })
            }
        })
        .catch(err => { 
            if (err.name === "CastError") {
                res.status(404).json({ message: "Post not found" });
            } else {
                console.log(err);
                res.sendStatus(500);
            }
        });
    },
    getUsersPosts(req, res) { // get all posts associated with a user.
        Post.find({userId: req.user._id})
            .select('-__v -userId -tips')
            .then( async postData => {
                if (!postData || postData.length === 0) {
                    return res.sendStatus(204);
                }
                let compiledPostData = [];
                for (let i = 0; i < postData.length; i++) {
                    let images = encodeImage(postData[i]);
                    postData[i].images = [];
                    const expires = await postData[i].expiresIn();
                    compiledPostData.push({ data: postData[i], totalTips: postData[i].tipsReceived(), images: images, expiresIn: expires });
                }
                res.status(200).json(compiledPostData);
            })
            .catch(err => { console.log(err); res.sendStatus(500); });
    }, 
    getUserPost(req, res) { // only user has access to this post, this is when they can view tips and edit the post
        Post.findOne({_id: req.params.id, userId: req.user._id})
            .select('-__v')
            .populate('tips', "title subject image")
            .then(async postDataObject  => {
                if (!postDataObject) {
                    return res.status(404).json({message: "Post not found or you do not have permissions to edit this post"});
                }
                const expires = await postDataObject.expiresIn();
                let postData = postDataObject.toJSON();
                const images = encodeImages(postDataObject);
                postData.images = [];
                for (let i = 0; i < postData.tips.length; i++) {
                    if (postData.tips[i].image) {
                        postData.tips[i].image = {
                            data: encodeSingleImage(postData.tips[i].image.data) // encode tips images
                        }  
                    }
                }
                res.status(200).json({ data: postData, totalTips: postDataObject.tipsReceived(), images: images, expiresIn: expires  })
            })
            .catch(err => { 
                if (err.name === "CastError") {
                    res.status(404).json({ message: "Post not found" });
                } else {
                    console.log(err)
                    res.status(500).json(err);
                }
             });
    },
    createPost(req, res) {
        Post.create([{
            title: req.body.title,
            date: req.body.date,
            summary: req.body.summary,
            userId: req.user._id,
            video: req.body.video || null,
            contactNumber: req.body.contactNumber || "000-000-0000"
        }],
        { new: true, runValidators: true })
        .then(postData => res.status(200).json({message: "Post Created Successfully"}))
        .catch(err => {
            if (err._message === "Post validation failed") {
                return res.status(400).json({ errorMessage: err.message, errorType: err._message })
            } else if (err.name === "CastError") {
                if (err.kind === "date") {
                    return res.status(400).json({ errorMessage: "You must enter a valid date format for the date value" })
                }
                return res.status(400).json({ errorMessage: err.message })
            }
            res.status(500).json(err);
        });
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
                    res.status(404).json({message: "That Post was not found or does not belong to you"})
                } else {
                    res.status(200).json({ message: "Image added successfully" })
                }
                fs.rm(path.join(__dirname + "../../imageUploads/" + req.file.filename), {}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                
            })
            .catch(err => {
                fs.rm(path.join(__dirname + "../../imageUploads/" + req.file.filename), {}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                if (err.name === "CastError") {
                    if (err.kind === "ObjectId") {
                        return res.status(400).json({message: "Post not found"})
                    }
                }
                res.status(500).json(err); 
                });
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
                    res.status(404).json({ message: "That Post was not found" })
                } else if (postData.images.length === 0) {
                    res.status(200).json({ message: "This post contains no images" })
                } else {  
                    res.status(200).json({ message: "Image Removed Successfully"})
                }
            })
            .catch(err => {
                if (err.name === "CastError") {
                    if (err.value === req.body.id) {
                        return res.status(404).json({ message: "That Post was not found" })
                    }
                    return res.status(404).json({message: "Image Id not found"})
                }
                res.status(500).json(err); 
            });
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
            postObj.video = req.body.video;
        }
        if (!postObj) {
            return res.status(400).json({ message: 'You must enter a value to update!' })
        }
        Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, postObj, { new: true, runValidators: true })
            .select('-__v -userId')
            .populate('userId', 'username')
            .then(postData => {
                if (!postData) {
                    res.status(404).json({ message: "That Post was not found" })
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
            .catch(err => { 
                if (err._message === "Validation failed") {
                    return res.status(400).json({errorMessage: err.message, errorType: err._message })
                } else if (err.name === "CastError") {
                    if (err.kind === "date") {
                        return res.status(400).json({errorMessage: "You must enter a valid date format for the date value"})
                    }
                    return res.status(400).json({errorMessage: err.message})
                }
                res.status(500).json(err);
            });
    },
    deletePost(req, res) {
        Post.findOneAndDelete({_id: req.params.id, userId: req.user._id})
        .then(postData => {
            if (!postData) {
                res.status(404).json({ message: "Post not found" })
            } else {
                res.status(200).json({ message: "Post deleted successfully" })
            }
        })
        .catch(err => {res.sendStatus(500); console.log(err);})
    },
    renewPost(req, res) {
        //this function will take the data from the post
    }
}

module.exports = postControllers;