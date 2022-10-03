const db = require('./connection');
const { Post, Tip, Category, User } = require('../models');
const faker = require("faker");
const fs = require('fs');
const path = require("path");
const bcrypt = require("bcrypt");
require('dotenv').config();

db.once('open', async () => {
// try {

    await Category.deleteMany({});
    await User.deleteMany({});
    await Post.deleteMany({});
    await Tip.deleteMany({});

//     Category.insertMany([
//         {
//             category: "Assault/Threats",
//             subCategories: ["Assault", "Aggravated Assault"]
//         },
//         {
//             category: "Arson",
//             subCategories: ["Business", "Private Property", "Public Property"]
//         },
//         {
//             category: "Auto Theft",
//         },
//         {
//             category: "Burglary",
//             subCategories: ["Business", "Private Property"],
//             hint: "Not Robbery, which involves force against a person"
//         },
//         {
//             category: "Damaged Property",
//             subCategories: ["Private Vehicle", "Graffiti", "Business", "Private Property", "Public Property"]
//         },
//         {
//             category: "Forgery, Fraud, Financial Crime",
//         },
//         {
//             category: "Drug Activity",
//         },
//         {
//             category: "Health/Safety",
//         },
//         {
//             category: "Homicide",
//         },
//         {
//             category: "Missing Person",
//         },
//         {
//             category: "Fugitive Sightings",
//         },
//         {
//             category: "Kidnapping",
//             subCategories: ["Minor", "Adult", "Custody Dispute", "Custodial Interference"]
//         },
//         {
//             category: "Larceny/Theft",
//             subCategories: ["Failure to Pay", "Pickpocket", "Porch Theft", "Purse Snatch", "Shoplift / Retail Theft", "Striping a Vehicle for Parts", "Theft from Private Yards"],
//             hint: "Not burglary, robbery, auto theft"
//         },
//         {
//             category: "Morals",
//             subCategories: ["Obscene Conduct/Lewdness"]
//         },
//         {
//             category: "Public Order",
//             subCategories: ["Riot", "Unlawful Assembly"]
//         },
//         {
//             category: "Robbery",
//             subCategories: ["Bank/Financial Institution", "Business", "Street", "Residential"],
//             hint: "Using force to take property from another"
//         },
//         {
//             category: "Sexual Offenses/Rape",
//             subCategories: ["Adult", "Juvenile"]
//         },
//         {
//             category: "Suspicious Activity",
//             subCategories: ["Suspicious Packages"]
//         },
//         {
//             category: "Traffic Offenses",
//             subCategories: ["Hit and Run", "Fleeing", "Possible DUI/DWI"]
//         },
//         {
//             category: "Trespassing",
//         },
//         {
//             category: "Weapons Offenses",
//             subCategories: ["Brandishing Weapon", "Drive-by Shooting", "Unlawful Discharge of Firearm"]
//         },
//         {
//             category: "Other"
//         },
//     ]);
//     console.log("Categories Seeded");

//     let users = []
//     const password = await bcrypt.hash("Password", 10);
//     for (let i = 0; i < 20000; i++) {
//         users.push({
//             username: "user_" + i,
//             email: "user_" + i + "@gmail.com",
//             password: password,
//             phoneNumber: faker.phone.phoneNumberFormat(0)
//         })
//     }
//     await User.insertMany(users, { new: true, runValidators: true })
//     const userData = await User.find({}).select("_id").lean();
//     let userIds = [];
//     for (let i = 0; i < userData.length; i++) {
//         userIds.push(userData[i]._id);
//     }
//     console.log("Users Seeded");

//     let posts = []
//     const image = "/1581977710_bbb.jpg"
//     const image1 = "/life_is_strange___blazing_up_by_friedrichsteiner-dar73po.png"
//     const image2 = "/1535796377_steamuserimages-a.akamaihd.net.jpg"
//     const image3 = "/life_is_strange___chloe_s_thinking_time_by_katewindhelm-d8g3ycv.jpg"
//     const images = [image, image1, image2, image3]
//     const categories = await Category.find({}).select("_id").lean();
//     let categoryIds = [];
//     for (let i = 0; i < categories.length; i++) {
//         categoryIds.push(categories[i]._id);
//     }

//     for (let i = 0; i < 12000; i++) {
//         let post = {
//             title: faker.name.title(),
//             date: faker.date.past(1),
//             summary: faker.lorem.paragraph(2),
//             userId: faker.random.arrayElement(userIds),
//             categoryId: faker.random.arrayElement(categoryIds),
//             subCategory: undefined,
//             images: [faker.random.arrayElement(images), faker.random.arrayElement(images), faker.random.arrayElement(images), faker.random.arrayElement(images)],
//             video: undefined,
//             reward: faker.finance.amount(),
//             contactNumber: "000-000-0000",
//             location: {coordinates: [faker.address.longitude(-124.6509, -66.8628), faker.address.latitude(47.455, 24.3959)]}
//         }
//         posts.push(post)
//     }

//     await Post.insertMany(posts);
//     console.log("Posts Seeded")

//     const getPosts = await Post.find({}).select("_id").lean()
//     let postIds = [];
//     for (let i = 0; i < getPosts.length; i++) {
//         postIds.push(getPosts[i]._id);
//     }

//     let tips = [];
//     for (let i = 0; i < 8000; i++) {
//         tips.push({
//             title: faker.lorem.words(3),
//             subject: faker.lorem.paragraph(2),
//             userId: faker.random.arrayElement(userIds),
//             postId: faker.random.arrayElement(postIds)
//         })
//     }

//     await Tip.insertMany(tips)

//     const tipsForPosts = await Tip.find({}).select("_id postId").lean();
//     let i = 0;
//     while (i < tipsForPosts.length) {
//        await Post.findByIdAndUpdate(tipsForPosts[i].postId, { $push: { tips: tipsForPosts[i]._id } }).lean()
//        i++;
//     }
        

//     console.log("Tips Seeded")

//     await User.create({
//         username: 'Site Admin',
//         email: process.env.ADMIN_EMAIL,
//         password: process.env.ADMIN_PASSWORD,
//         admin: true
//     });
//     console.log("Admin Seeded");
// } catch(err) {
//     console.log(err)
// }
    process.exit();
});