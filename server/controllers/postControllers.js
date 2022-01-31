const { Post, Category, Tip } = require("../models");
const fs = require('fs');
const path = require('path');
const { addImages, removeImages, format_date } = require('../utils/helpers')
const zipCodes = require("../utils/zipCodes.json");

function removeTempImages(req) {
    for (let i = 0; i < req.files.length; i++) {
        fs.rm(path.join(__dirname + "../../public/temp/" + req.files[i].filename), {}, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

const postControllers = {
    getAllPosts(req, res) { // add sorting to getAllPosts
        let search = {}
        if (req.query.categoryId) {
            search.categoryId = req.query.categoryId;
            if (req.query.subCategory) {
                search.subCategory = req.query.subCategory;
            }
        } if (req.query.lon && req.query.lat && req.query.maxDistance) { // find all posts within a radius of one point.
            if (req.query.maxDistance < 1) {
                return res.status(400).json({ errorMessage: "The smallest search radius allowed is 1 mile."})
            }
            search.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [req.query.lon, req.query.lat]
                    },
                    $maxDistance: req.query.maxDistance <= 250 ? Math.round(req.query.maxDistance * 1609.34) : Math.round(250 * 1609.34) // converts miles into meters
                }
            }
        }
        let sort = null;
        if (req.query.sort) {
            switch (req.query.sort) {
                case "Most Recent":
                    sort = { createdAt: "desc" };
                    break;
                case "Most Recent Inv":
                    sort = { createdAt: "asc" };
                    break;
                case "Popular":
                    sort = { views: "desc" };
                    break;
                case "Popular Inv":
                    sort = { views: "asc" };
                    break;
                case "Reward":
                    sort = { reward: "desc" };
                    break;
                case "Reward Inv":
                    sort = { reward: "asc" };
                    break;
                case "Date of Incident":
                    sort = { date: "desc" }
                    break;
                case "Date of Incident Inv":
                    sort = { date: "asc" }
            }
        }
        if (search.location) {
            Post.find(search, null, {allowDiskUse: true})  
            .select('-__v -contactNumber -reward -tips')
            .populate({
                    path: "userId",
                    model: "User",
                    select: "username"
            })
            .populate({
                path: "categoryId",
                model: "Category",
                select: "_id category"
            })
            .sort(sort).then(postDataObject => {
                if (postDataObject.length === 0) {
                    return res.sendStatus(204); // No Content Found
                }
                let compiledPostData = [];
                let markers = [];

                // Set up manual pagination for geoJSON query
                let limit = parseInt(req.query.limit) || 20; 
                limit = limit > 100 ? 100 : limit < 1 ? 1 : limit;
                const totalPages = Math.ceil(postDataObject.length / limit);
                let page = parseInt(req.query.page) || 1;
                page = totalPages <= page ? totalPages : page <= 0 ? 1 : page;

                const startingIndex = (page === 1) ? 0 : (page - 1) * limit;

                const endingIndex = postDataObject.length % limit === 0 ? page * limit : page === totalPages ?
                (page - 1) * limit + postDataObject.length % limit : page * limit;
                
                for (let i = startingIndex; i < endingIndex; i++) {
                    let postData = postDataObject[i].toJSON();
                    postData.date = format_date(postData.date);
                    postData.images = postData.images[0];
                    delete postData.userId._id;
                    delete postData.userId.id;
                    compiledPostData.push({ data: postData });
                    markers.push({
                        lat: postData.location.coordinates[1],
                        lon: postData.location.coordinates[0],
                        _id: postData._id,
                        title: postData.title,
                        summary: postData.summary
                    })
                }
                
                res.status(200).json({posts: compiledPostData, pageData: {
                    totalDocs: postDataObject.length,
                    limit: limit,
                    totalPages: totalPages,
                    page: page,
                    hasPrevPage: page > 1,
                    hasNextPage: page < totalPages,
                    prevPage: page >= 2 && page <= totalPages ? page - 1 : null,
                    nextPage: page > 0 && page < totalPages ? page + 1 : null,
                },
                markers: markers,
                message: req.query.maxDistance > 250 ? "The maximum search radius is 250 miles. You tried to search for " + req.query.maxDistance + " miles. The search results only represent a 250 mile radius" : undefined});
            }).catch(err => {
                if (err.code === 2) {
                    return res.status(400).json({ errorMessage: "The Longitude or Latitude values are invalid"})
                }
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message })
            })
        } else {
            const options = {
                select: '-__v -contactNumber -reward -tips',
                populate: [{
                    path: "userId",
                    model: "User",
                    select: "username"
                },
                {
                    path: "categoryId",
                    model: "Category",
                    select: "_id category"
                }],
                sort: sort,
                page: req.query.page || 1,
                limit: req.query.limit ? parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) < 1 ? 1 : parseInt(req.query.limit) : 20,
                allowDiskUse: true
            }
            Post.paginate(search, options, (err, results) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
                }
                let compiledPostData = [];
                let markers = [];
                for (let i = 0; i < results.docs.length; i++) {
                    let postData = results.docs[i].toJSON();
                    postData.date = format_date(postData.date);
                    postData.images = postData.images[0];
                    delete postData.userId._id;
                    delete postData.userId.id;
                    compiledPostData.push({ data: postData });
                    markers.push({
                        lat: postData.location.coordinates[1],
                        lon: postData.location.coordinates[0],
                        _id: postData._id,
                        title: postData.title,
                        summary: postData.summary
                    })
                }
                delete results.docs;
                res.status(200).json({ posts: compiledPostData, pageData: results, markers: markers });
            })
        }
    },
    getOnePost(req, res) {
        Post.findOne({ _id: req.params.id })
            .select('-__v -reward')
            .populate('userId', 'username')
            .populate({
                path: "tips",
                model: "Tip",
                select: "_id title subject userId anonymous createdAt image",
                populate: { path: "userId", model: "User", select: "username" }
            })
            .populate('categoryId', "_id category")
            .then(async postDataObject => {
                if (!postDataObject) {
                    return res.status(404).json({ errorMessage: "Post not found" });
                }
                let postData = postDataObject.toJSON();
                postData.date = format_date(postData.date);
                delete postData.userId._id;
                delete postData.userId.id;
                for (let i = 0; i < postData.tips.length; i++) {
                    if (postData.tips[i].anonymous === true) {
                        postData.tips[i].userId.username = "Anonymous";
                    }
                    postData.tips[i].createdAt = format_date(postData.tips[i].createdAt);
                    delete postData.tips[i].anonymous;
                    delete postData.tips[i].userId._id;
                    delete postData.tips[i].userId.id;
                }
                delete postData.id;
                res.status(200).json({ data: postData, totalTips: postDataObject.tipsReceived() });
            })
            .catch(err => {
                if (err.name === "CastError") {
                    res.status(404).json({ errorMessage: "Post not found" });
                } else {
                    console.log(err);
                    res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message })
                }
            });
    },
    getUsersPosts(req, res) { // get all posts associated with a user.
        let sort = null;
        if (req.query.sort) {
            switch (req.query.sort) {
                case "Most Recent":
                    sort = { createdAt: "desc" };
                    break;
                case "Most Recent Inv":
                    sort = { createdAt: "asc" };
                    break;
                case "Popular":
                    sort = { views: "desc" };
                    break;
                case "Popular Inv":
                    sort = { views: "asc" };
                    break;
                case "Reward":
                    sort = { reward: "desc" };
                    break;
                case "Reward Inv":
                    sort = { reward: "asc" };
                    break;
                case "Date of Incident":
                    sort = { date: "desc" }
                    break;
                case "Date of Incident Inv":
                    sort = { date: "asc" }
            }
        }
        Post.find({ userId: req.user._id })
            .select('-__v -userId -reward -lat -lon')
            .populate('categoryId', "_id category")
            .sort(sort)
            .then(async postDataObject => {
                if (!postDataObject || postDataObject.length === 0) {
                    return res.sendStatus(204);
                }
                let compiledPostData = [];
                for (let i = 0; i < postDataObject.length; i++) {
                    let postData = postDataObject[i].toJSON();
                    postData.date = format_date(postData.date);
                    postData.images = postData.images[0];
                    delete postData.tips;
                    const expires = await postDataObject[i].expiresIn();
                    compiledPostData.push({ data: postData, totalTips: postDataObject[i].tipsReceived(), expiresIn: expires });
                }
                res.status(200).json(compiledPostData);
            })
            .catch(err => { res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }); });
    },
    getUserPost(req, res) { // only user has access to this post, this is when they can view tips, edit the post, or send contact requests
        Post.findOne({ _id: req.params.id, userId: req.user._id })
            .select('-__v -reward -userId')
            .populate({
                path: "tips",
                model: "Tip",
                select: "_id title subject userId anonymous",
                populate: { path: "userId", model: "User", select: "username" }
            })
            .populate('categoryId', "_id category")
            .then(async postDataObject => {
                if (!postDataObject) {
                    return res.status(404).json({ errorMessage: "Post not found or you do not have permissions to edit this post" });
                }
                const expires = await postDataObject.expiresIn();
                let postData = postDataObject.toJSON();
                postData.date = format_date(postData.date);

                for (let i = 0; i < postData.tips.length; i++) {
                    if (postData.tips[i].image) {
                        postData.tips[i].image = {
                            data: encodeSingleImage(postData.tips[i].image.data) // encode tips images
                        }
                    } if (postData.tips[i].anonymous === true) {
                        postData.tips[i].userId.username = "Anonymous";
                    }
                    delete postData.tips[i].anonymous;
                    delete postData.tips[i].userId._id;
                    delete postData.tips[i].userId.id;
                }
                postData.sameUser = true; // used for front end to tell if its the same user
                res.status(200).json({ data: postData, totalTips: postDataObject.tipsReceived(), expiresIn: expires })
            })
            .catch(err => {
                if (err.name === "CastError") {
                    res.status(404).json({ errorMessage: "Post not found" });
                } else {
                    console.log(err)
                    res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
                }
            });
    },
    async createPost(req, res) {
        if (req.body.subCategory) {
            try {
                const categoryData = await Category.findById(req.body.categoryId).lean()
                if (!categoryData || Object.keys(categoryData).length === 0) {
                    removeTempImages(req);
                    return res.status(400).json({errorMessage: "The category you selected was not found!"})
                }
                if (!categoryData.subCategories.includes(req.body.subCategory)) {
                    removeTempImages(req);
                    return res.status(400).json({ errorMessage: "The category you selected does not contain the sub category " + req.body.subCategory });
                }
            } catch (err) {
                if (err.name === "CastError") {
                    removeTempImages(req);
                    return res.status(400).json({ errorMessage: "Category not found, please enter a valid category id" });
                }
                removeTempImages(req);
                return res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            }
        }
        let video = undefined;
        if (req.body.video) {
            try {
                video = req.body.video.replace("watch?v=", "embed/");
            } catch(err) { // add more error handling here ******************************************
                removeTempImages(req);
                return res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            }
        }
        Post.create([{
            title: req.body.title,
            date: req.body.date,
            summary: req.body.summary,
            userId: req.user._id,
            categoryId: req.body.categoryId,
            subCategory: req.body.subCategory || undefined,
            video: video,
            contactNumber: req.body.contactNumber || "000-000-0000",
            location: {coordinates: [req.body.lon, req.body.lat]}
        }],
            { new: true, runValidators: true })
            .then(postData => {
                if (req.files.length > 0) {
                    let images = [];
                    fs.mkdirSync(path.join(__dirname + "../../public/" + postData[0]._id));
                    for (let i = 0; i < req.files.length; i++) {
                        fs.copyFile(path.join(__dirname + "../../public/temp/" + req.files[i].filename), 
                            path.join(__dirname + "../../public/" + postData[0]._id + "/" + req.files[i].filename), (err) => {
                                if (err) console.log(err);
                            });
                        fs.rm(path.join(__dirname + "../../public/temp/" + req.files[i].filename), {}, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        images.push("/" + postData[0]._id + "/" + req.files[i].filename);
                    }
                    Post.findByIdAndUpdate(postData[0]._id, {images: images}, { new: true, runValidators: true}).lean().then(postData => {
                        res.status(200).json({ message: "Post Created Successfully" });
                    }).catch(err => {
                        res.status(500).json({errorMessage: "Image upload failed, post creation terminated", error: err, errMessage: err.message})
                        fs.rmdir(path.join(__dirname + "../../public/" + postData[0]._id), (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        removeTempImages(req);
                        Post.deleteOne({_id: postData._id});
                    })
                } else res.status(200).json({ message: "Post Created Successfully" });
            })
            .catch(err => {
                fs.rmdir(path.join(__dirname + "../../public/" + postData[0]._id), { recursive: true }, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                removeTempImages(req);
                if (err._message === "Post validation failed") {
                    if (err.errors.categoryId) {
                        return res.status(400).json({ errorMessage: "Category not found, please enter a valid category id" });
                    } if (err.errors.video) {
                        return res.status(400).json({ errorMessage: "Video link must be a valid youtube link" });
                    } if (err.errors.summary) {
                        if (err.errors.summary.properties.type === "maxlength") {
                            return res.status(400).json({ errorMessage: "Your summary can not exceed 2000 characters long" });
                        } if (err.errors.summary.properties.type === "required") {
                            return res.status(400).json({ errorMessage: "You must have a summary for your post" });
                        }
                    }
                    return res.status(400).json({ errorMessage: err.message, errorType: err._message });
                } else if (err.name === "CastError") {
                    if (err.kind === "date") {
                        return res.status(400).json({ errorMessage: "You must enter a valid date format for the date value" });
                    }
                    return res.status(400).json({ errorMessage: err.message });
                }
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            });
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
                removeTempImages(req);
                if (err.name === "CastError") {
                    return res.status(404).json({ errorMessage: "That Post was not found" });
                }
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            })

            if (req.body.removeImages && req.files.length > 0) {
                const totalImages = prePostData.images.length - req.body.removeImages.length + req.files.length;
                if (totalImages > 5) {
                    removeTempImages(req);
                    return res.status(400).json({ errorMessage: "You can have upto 5 images total. With your current changes their would be " + totalImages + " images total" })
                }
            }
            let i = 0;
            if (req.body.removeImages) {
                if (Array.isArray(req.body.removeImages)) {
                    while (i < req.body.removeImages.length) {
                        const results = await removeImages(i, req);
                        if (results.status === 200) {
                            i++
                        } else {
                            return res.status(results.status).json({ message: results.message, failedOn: i });
                            
                        }
                    }
                } else {
                    const results = await removeImages(undefined, req);
                    if (results.status !== 200) {
                        return res.status(results.status).json({ message: results.message });
                        
                    }
                }
                
            }
            i = 0;
            if (req.files.length > 0) {
                if (req.files.length + prePostData.images.length > 5 && !req.body.removeImages) {
                    removeTempImages(req);
                    return res.status(400).json({ errorMessage: "You can have upto 5 images total. With your current changes their would be " + (req.files.length + prePostData.images.length) + " images total" })
                }
                while (i < req.files.length) {
                    const results = await addImages(i, req);
                    if (results.status = 200) {
                        i++
                    } else {
                        removeTempImages(req);
                        return res.status(results.status).json({ message: results.message, failedOn: i });
                        
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
        if (Object.keys(postObj).length === 0 && !req.body.removeImages && req.files.length === 0) {
            return res.status(400).json({ errorMessage: 'You must enter a value to update' });
        }
        if ((req.body.removeImages || req.files.length > 0) && Object.keys(postObj).length === 0) {
            return res.status(200).json({ message: 'Images updated successfully' });
        }
        Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, postObj, { new: true, runValidators: true })
            .select('-__v -userId')
            .then(postData => {
                if (!postData) {
                    res.status(404).json({ errorMessage: "That Post was not found" })
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
                    return res.status(400).json({ errorMessage: err.message, errorType: err._message })
                } else if (err.name === "CastError") {
                    if (err.kind === "date") {
                        return res.status(400).json({ errorMessage: "You must enter a valid date format for the date value" })
                    }
                    if (err.kind === "ObjectId" && err.path === "_id") {
                        return res.status(404).json({ errorMessage: "That Post was not found" });
                    }
                    return res.status(400).json({ errorMessage: err.message })
                }
                res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message });
            });
    },
    deletePost(req, res) {
        Post.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
            .then(postData => {
                if (!postData) {
                    res.status(404).json({ errorMessage: "Post not found" })
                } else {
                    res.status(200).json({ message: "Post deleted successfully" })
                    Tip.deleteMany({postId: req.params.id}).catch(err => console.log(err));
                    fs.rmdir(path.join(__dirname + "../../public/" + postData._id), { recursive: true }, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            })
            .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
    },
    renewPost(req, res) {
        //this function will reset the exportation clock 
        //this can be done by updating the created at value to be Date.now(). 
        // can only be done after 60 days
        Post.findOne({ _id: req.params.id, userId: req.user._id })
            .lean()
            .select('createdAt')
            .then(postData => {
                if (!postData || Object.keys(postData).length === 0) {
                    return res.status(404).json({ errorMessage: "Post not found or you do not have permissions to edit this post" });
                }
                //credit: https://stackabuse.com/javascript-get-number-of-days-between-dates/
                const date1 = new Date(postData.createdAt);
                const date2 = new Date.now();

                // One day in milliseconds
                const oneDay = 1000 * 60 * 60 * 24;

                // Calculating the time difference between two dates
                const diffInTime = date2.getTime() - date1.getTime();

                // Calculating the no. of days between two dates
                const diffInDays = Math.round(diffInTime / oneDay);
                if (diffInDays <= 60) {
                    Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { createdAt: Date.now() }, { new: true, runValidators: true })
                        .lean()
                        .then(postData => res.status(200).json("Your Post has been renewed"))
                        .catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
                } else {
                    res.status(400).json({ errorMessage: "You can only renew a post if it's at least 60 days old" })
                }
            }).catch(err => res.status(500).json({ errorMessage: "Unknown Error", error: err, errMessage: err.message }))
    },
    getZipCode(req, res) {
        const zip = req.params.zipCode.toString();
        const latLon = zipCodes.zips[zip];
        if (latLon) {
            res.status(200).json({coords: latLon});
        } else {
            res.status(400).json({ errorMessage: "Zip code not found!"});
        }
    },
    featurePost(req, res) {
        // this will be used to allow a user to feature their posts. They will need to pay for it though.
        // Future development
    },
    setReward(req, res) {
        // This route will process payment for the reward at time of creation for the post
        // Future development
    }
}

module.exports = postControllers;