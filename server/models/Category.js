const { Schema, model } = require('mongoose');

const categoriesSchema = new Schema(
    {
        category: {
            type: String,
            unique: true,
            required: true
        }
    }
);

const Category = model('Category', categoriesSchema);

module.exports = Category;