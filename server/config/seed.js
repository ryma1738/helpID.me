const db = require('./connection');
const { Post, Tip, Category, User } = require('../models');
require('dotenv').config();

db.once('open', async () => {

    await Category.deleteMany({});
    await User.deleteOne({ username: 'Site Admin'})

    Category.insertMany([
        {
            category: "Assault/Threats",
            subCategories: ["Assault", "Aggravated Assault"]
        },
        {
            category: "Arson",
            subCategories: ["Business", "Private Property", "Public Property"]
        },
        {
            category: "Auto Theft",
        },
        {
            category: "Burglary",
            subCategories: ["Business", "Private Property"],
            hint: "Not Robbery, which involves force against a person"
        },
        {
            category: "Damaged Property",
            subCategories: ["Private Vehicle", "Graffiti", "Business", "Private Property", "Public Property"]
        },
        {
            category: "Forgery, Fraud, Financial Crime",
        },
        {
            category: "Drug Activity",
        },
        {
            category: "Health/Safety",
        },
        {
            category: "Homicide",
        },
        {
            category: "Missing Person",
        },
        {
            category: "Fugitive Sightings",
        },
        {
            category: "Kidnapping",
            subCategories: ["Minor", "Adult", "Custody Dispute", "Custodial Interference"]
        },
        {
            category: "Larceny/Theft",
            subCategories: ["Failure to Pay", "Pickpocket", "Porch Theft", "Purse Snatch", "Shoplift / Retail Theft", "Striping a Vehicle for Parts", "Theft from Private Yards"],
            hint: "Not burglary, robbery, auto theft"
        },
        {
            category: "Morals",
            subCategories: ["Obscene Conduct/Lewdness"]
        },
        {
            category: "Public Order",
            subCategories: ["Riot", "Unlawful Assembly"]
        },
        {
            category: "Robbery",
            subCategories: ["Bank/Financial Institution", "Business", "Street", "Residential"],
            hint: "Using force to take property from another"
        },
        {
            category: "Sexual Offenses/Rape",
            subCategories: ["Adult", "Juvenile"]
        },
        {
            category: "Suspicious Activity",
            subCategories: ["Suspicious Packages"]
        },
        {
            category: "Traffic Offenses",
            subCategories: ["Hit and Run", "Fleeing", "Possible DUI/DWI"]
        },
        {
            category: "Trespassing",
        },
        {
            category: "Weapons Offenses",
            subCategories: ["Brandishing Weapon", "Drive-by Shooting", "Unlawful Discharge of Firearm"]
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