const db = require('./connection');
const { Post, Tip, Category, User } = require('../models');
require('dotenv').config();

db.once('open', async () => {

    //await Category.deleteMany({});

    Category.insertMany([
        {
            category: "Theft"
        },
        {
            category: "Assault and Battery"
        },
        {
            category: "Vehicle Offenses" //hit and runs
        },
        {
            category: "Missing Person"
        },
        {
            category: "Property Damage"
        },
        {
            category: "Cyber Crimes"
        },
        {
            category: "Drug Related"
        },
        {
            category: "Home Invasion"
        },
        {
            category: "Other"
        },
    ]);
    console.log("Categories Seeded");
    
    await User.create({
        username: 'Site Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        admin: true
    });
    console.log("Admin Seeded");
    process.exit();
});