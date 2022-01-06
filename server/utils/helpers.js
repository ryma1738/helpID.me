const { Post } = require("../models");
const fs = require("fs");
const path  =  require("path");

module.exports = {
    addImages: async (index, req) => {
        try {
            fs.copyFile(path.join(__dirname + "../../public/temp/" + req.files[index].filename),
                path.join(__dirname + "../../public/" + req.params.id + "/" + req.files[index].filename), (err) => {
                    if (err) return { message: "Image failed to save correctly", status: 500 };
                });

            const postData = await Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, {
                $push: {
                    images: "/" + req.params.id + "/" + req.files[index].filename
                }
            }, { new: true, runValidators: true })
            .select('-__v -userId')

            fs.rm(path.join(__dirname + "../../public/temp/" + req.files[index].filename), {}, (err) => {
                if (err) {
                    console.log({errorMessage: "Failed to delete file in temp folder", error: err});
                }
            });

            if (!postData) {
                return { message: "That Post was not found or does not belong to you", status: 404 };
            } else {
                return { message: "Image added successfully", status: 200 };
            }
            
        } catch(err) {
            fs.rm(path.join(__dirname + "../../public/temp/" + req.files[index].filename), {}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            fs.rm(path.join(__dirname + "../../public/" + req.body.id + "/" + req.files[index].filename), {}, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            if (err.name === "CastError") {
                if (err.kind === "ObjectId") {
                    return { message: "Post not found", status: 404 };
                }
            }
            return { message: err, status: 500 };
        }
    },
    removeImages: async (index, req) => {
        try {
            const postData = await Post.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, {
                $pull: {
                    images: index ? req.body.removeImages[index] : req.body.removeImages
                }
            }, { new: true, runValidators: true })

            if (!postData) {
                return { message: "That Post was not found", status: 404 };
            } else if (postData.images.length === 0) {
                return { message: "This post contains no images", status: 200 };
            } else {
                let imagePath = (index ? req.body.removeImages[index] : req.body.removeImages).replace("/images/", '');
                fs.rm(path.join(__dirname + "/../public/" + imagePath), {}, (err) => {
                    if (err) {
                        if (err.code === 'ENOENT' ) {
                            return { message: "Image to remove Not found", status: 400 }
                        } else console.log(err)
                    }
                });
                return { message: "Image Removed Successfully", status: 200 };
            }
        } catch (err) {
            if (err.name === "CastError") {
                if (err.value === req.body.id) {
                    return { message: "That Post was not found", status: 404 };
                }
                return { message: "Image Id not found", status: 400 };
            }
            return { message: [err, err.message], status: 500 };
        }
    },
    format_date: date => {
        return `${new Date(date).getMonth() + 1}/${new Date(date).getDate()}/${new Date(
            date
        ).getFullYear()}`;
    }
}