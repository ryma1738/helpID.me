const { Schema, model } = require('mongoose');

const categoriesSchema = new Schema(
    {
        category: {
            type: String,
            unique: true,
            required: true
        },
        subCategories: {
            type: [String]
        },
        hint: {
            type: String
        }
    }
);

const Category = model('Category', categoriesSchema);

module.exports = Category;