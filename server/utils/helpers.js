module.exports = {
    encodeImages: postData => {
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
    },

    encodeImage: postData => {
        if (postData.images[0]) {
            let image = Buffer.from(postData.images[0].data).toString('base64');
            return {
                _id: postData.images[0]._id,
                contentType: postData.images[0].contentType,
                imageBase64: image
            };
        } else return [];

    },
    encodeSingleImage: image => {
            return Buffer.from(image).toString('base64');
            
    }
}