const { Post } = require("../models");
const fs = require('fs');
const path = require('path');
const { encodeImage, encodeImages, encodeSingleImage, addImages, removeImages } = require('../utils/helpers')

const postControllers = {
    getAllPosts(req, res) {
        let search = {}
        if (req.query.search) {
            search.$text = { $search: req.query.search };
        } if (req.query.categoryId) {
            search.categoryId = req.query.categoryId;
        }
        if (req.query.search) {
            Post.find(search,
                { score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } })
                .select('-__v -contactNumber -tips')
                .populate('userId', 'username')
                .populate('categoryId', "_id category")
                .then(async postDataObject => {
                    let compiledPostData = [];
                    for (let i = 0; i < postDataObject.length; i++) {
                        let postData = postDataObject[i].toJSON();
                        postData.images = encodeImage(postData);
                        delete postData.userId._id;
                        delete postData.userId.id;
                        compiledPostData.push({ data: postData, totalTips: postDataObject[i].tipsReceived() });
                    }
                    res.status(200).json(compiledPostData);
                })
                .catch(err => {
                    if (err.kind === "ObjectId") {
                        return res.status(400).json({ errorMessage: "categoryId is in an invalid format / is not a valid categoryId"})
                    }
                    res.status(500).json({ errorMessage: "Unknown Error", error: err });
                });
        } else {
            Post.find(search)
                .select('-__v -contactNumber -tips')
                .populate('userId', 'username')
                .populate('categoryId', "_id category")
                .then(async postDataObject => {
                    let compiledPostData = [];
                    for (let i = 0; i < postDataObject.length; i++) {
                        let postData = postDataObject[i].toJSON();
                        postData.images = encodeImage(postData);
                        delete postData.userId._id;
                        delete postData.userId.id;
                        compiledPostData.push({ data: postData, totalTips: postDataObject[i].tipsReceived() });
                    }
                    res.status(200).json(compiledPostData);
                })
                .catch(err => { res.status(500).json({ errorMessage: "Unknown Error", error: err}); });
        }
    },
    getOnePost(req, res) {
        Post.findOne({_id: req.params.id})
        .select('-__v')
        .populate('userId', 'username')
        .populate('tips', 'title subject image')
        .populate('categoryId', "_id category")
        .then(async postDataObject => {
            if (!postDataObject) {
                return res.status(404).json({ message: "Post not found" });
            }
            let postData = postDataObject.toJSON();
            postData.images = encodeImages(postDataObject);
            delete postData.userId._id;
            delete postData.userId.id;
            for (let i = 0; i < postData.tips.length; i++) {
                if (postData.tips[i].image) {
                    postData.tips[i].image = {
                        data: encodeSingleImage(postData.tips[i].image.data) // encode tips images
                    }
                }
            }
            res.status(200).json({ data: postData, totalTips: postDataObject.tipsReceived() })
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
            .populate('categoryId', "_id category")
            .then(async postDataObject => {
                if (!postDataObject || postDataObject.length === 0) {
                    return res.sendStatus(204);
                }
                let compiledPostData = [];
                for (let i = 0; i < postDataObject.length; i++) {
                    let postData = postDataObject[i].toJSON();
                    console.log(postData)
                    postData.images = encodeImage(postData);
                    const expires = await postDataObject[i].expiresIn();
                    compiledPostData.push({ data: postData, totalTips: postDataObject[i].tipsReceived(), expiresIn: expires });
                }
                res.status(200).json(compiledPostData);
            })
            .catch(err => { res.status(500).json({ errorMessage: "Unknown Error", error: err}); });
    }, 
    getUserPost(req, res) { // only user has access to this post, this is when they can view tips and edit the post
        Post.findOne({_id: req.params.id, userId: req.user._id})
            .select('-__v -userId')
            .populate('tips', "title subject image")
            .populate('categoryId', "_id category")
            .then(async postDataObject  => {
                if (!postDataObject) {
                    return res.status(404).json({message: "Post not found or you do not have permissions to edit this post"});
                }
                const expires = await postDataObject.expiresIn();
                let postData = postDataObject.toJSON();
                postData.images = encodeImages(postDataObject);

                for (let i = 0; i < postData.tips.length; i++) {
                    if (postData.tips[i].image) {
                        postData.tips[i].image = {
                            data: encodeSingleImage(postData.tips[i].image.data) // encode tips images
                        }  
                    }
                }
                res.status(200).json({ data: postData, totalTips: postDataObject.tipsReceived(), expiresIn: expires  })
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
        let images = []
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push({
                    data: fs.readFileSync(path.join(__dirname + "../../imageUploads/" + req.files[i].filename)),
                    contentType: req.files[i].mimetype
                })
            }
        }
        Post.create([{
            title: req.body.title,
            date: req.body.date,
            summary: req.body.summary,
            userId: req.user._id,
            categoryId: req.body.categoryId,
            images: images,
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
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                fs.rm(path.join(__dirname + "../../imageUploads/" + req.files[i].filename), {}, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    },
    editImageOrder(req, res) { // maybe
        //Add a feature that allows the user to change the order of the images. What ever image is first is the main one.
        // this can be done by allowing the user to drag and drop them into any order. Once complete it sends the order as an array
        //of the old array indexes, for example [5,3,1,2,0,4] vs [0,1,2,3,4,5], the entire image field is changed accordingly.
    },
    async editPost(req, res) { 
        // Images Editing starts
        if (req.body.removeImages || req.files.length > 0) {
            const prePostData = await Post.findOne({ _id: req.params.id, userId: req.user._id }).catch(err => {
                if (err.name === "CastError") {
                    return res.status(404).json({ message: "That Post was not found" });
                }
                res.status(500).json(err);
            })
            
            if (req.body.removeImages && req.files.length > 0) {
                const totalImages = prePostData.images.length - req.body.removeImages.length + req.files.length;
                if ( totalImages > 5) {
                    for (let i = 0; i < req.files.length; i++) {
                        fs.rm(path.join(__dirname + "/../imageUploads/" + req.files[i].filename), {}, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    return res.status(400).json({message: "You can have upto 5 images total. With your current changes their would be " + totalImages + " images total"})
                }
            }
            let i = 0;
            if (req.body.removeImages) {
                while (i < req.body.removeImages.length) {
                    const results = await removeImages(i, req);
                    if (results.status = 200) {
                        i++
                    } else {
                        return res.status(results.status).json({ message: results.message, failedOn: i });
                        //Please note that if one fails it stops but it may have uploaded some of the images. need to inform on the front end.
                    }
                }
            }    
            i = 0;
            if (req.files.length > 0) {
                if (req.files.length + prePostData.images.length > 5 && !req.body.removeImages) {
                    for (let i = 0; i < req.files.length; i++) {
                        fs.rm(path.join(__dirname + "/../imageUploads/" + req.files[i].filename), {}, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    return res.status(400).json({ message: "You can have upto 5 images total. With your current changes their would be " + (req.files.length + prePostData.images.length) + " images total" })
                }
                while (i < req.files.length) {
                    const results = await addImages(i, req);
                    if (results.status = 200) {
                        i++
                    } else {
                        return res.status(results.status).json({ message: results.message, failedOn: i });
                        //Please note that if one fails it stops but it may have uploaded some of the images. need to inform on the front end.
                    }
                }
            }       
        }
        // Basic edits start
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
        if (req.body.categoryId) {
            postObj.categoryId = req.body.categoryId;
        }
        if (Object.keys(postObj).length === 0 && !req.body.removeImages && req.files.length === 0) {
            return res.status(400).json({ message: 'You must enter a value to update' });
        }
        if ((req.body.removeImages || req.files.length > 0) && Object.keys(postObj).length === 0) {
            return res.status(200).json({ message: 'Images updated successfully' });
        }
        Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, postObj, { new: true, runValidators: true })
            .select('-__v -userId')
            .then(postData => {
                if (!postData) {
                    res.status(404).json({ message: "That Post was not found" })
                } else {
                    if (postData.images) {
                        const images = encodeImages(postData);
                        let data = postData.toJSON();
                        data.images = images;
                        res.status(200).json({ message: "Post updated successfully", data: data })
                    } else {
                        res.status(200).json({ message: "Post updated successfully", data: postData })
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
                    if (err.kind === "ObjectId" && err.path === "_id") {
                        return res.status(404).json({ message: "That Post was not found" });
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
        //this function will reset the exportation clock 
        //this can be done by updating the created at value to be Date.now(). 
        // can only be done after 60 days
    }
}

module.exports = postControllers;