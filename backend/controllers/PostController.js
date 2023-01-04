import Post from "../models/PostModel.js";
import path from "path";
import fs from "fs";
import { Sequelize } from "sequelize";

// Get Post With Pagination
export const getPost = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.title || "";
    const offset = limit * page;
    const totalRows = await Post.count({
        where: {
            title: {
                [Sequelize.Op.like]: `%${search}%`
            }
        }
    });
    const totalPage = Math.ceil(totalRows / limit);
    console.log(totalRows);

    try {
        const result = await Post.findAll({
            where: {
                title: {
                    [Sequelize.Op.like]: `%${search}%`
                }
            },
            limit: limit,
            offset: offset,
            order: [
                ['id', 'DESC']
            ],
        });

        res.json({
            result: result,
            page: page,
            limit: limit,
            totalRows: totalRows,
            totalPage: totalPage
        });
    } catch (error) {
        console.log(error.message);
    }
};

// Get All Post
export const getAllPost = async (req, res) => {
    try {
        const response = await Post.findAndCountAll({
            order: Sequelize.literal("id DESC")
        });
        res.json(response);
    } catch (error) {
        console.log(error.message);
    }
};

// Get Post By ID/Slug
export const getPostById = async (req, res) => {
    try {
        const response = await Post.findOne({
            where: {
                slug: req.params.slug
            }
        });
        res.json(response);
    } catch (error) {
        console.log(error.message);
    }
};

// Create Post
export const createPost = (req, res) => {
    if(req.files === null) return res.status(400).json({message: "No File Uploaded"});
    const title = req.body.title;
    const slug = req.body.slug;
    const category = req.body.category;
    const content = req.body.content;
    const file = req.files.file;
    const fileSize = file.data.length;
    const extension = path.extname(file.name);
    const fileName = file.md5 + extension;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    const allowedType = [".png", ".jpg", ".jpeg"];
    if(!allowedType.includes(extension.toLowerCase())) return res.status(422).json({message: "Invalid Images"});

    if(fileSize > 5000000) return res.status(422).json({message: "Images must be less than 5MB"});

    file.mv(`./public/images/${fileName}`, async(err) => {
        if(err) return res.status(500).json({message: err.message});

        try {
            await Post.create({title: title, slug: slug, image: fileName, url: url, content: content, category: category});
            res.status(201).json({message: "Post Created"});
        } catch (error) {
            console.log(error.message);
        }
    })
};

// Update Post
export const updatePost = async (req, res) => {
    const post = await Post.findOne({
        where: {
            slug: req.params.slug
        }
    });
    if(!post) return res.status(404).json({message: "No Data Found"});

    let fileName = "";
    if(req.files === null) {
        fileName = post.image;
    } else {
        const file = req.files.file;
        const fileSize = file.data.length;
        const extension = path.extname(file.name);
        fileName = file.md5 + extension;

        const allowedType = [".png", ".jpg", ".jpeg"];
        if(!allowedType.includes(extension.toLowerCase())) return res.status(422).json({message: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({message: "Images must be less than 5MB"});

        const filepath = `./public/images/${post.image}`;
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err) => {
            if(err) return res.status(500).json({message: err.message});
        })
    }

    const title = req.body.title;
    const slug = req.body.slug;
    const category = req.body.category;
    const content = req.body.content;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    try {
        await Post.update({title: title, slug: slug, image: fileName, url: url, content: content, category: category}, {
            where: {
                slug: req.params.slug
            }
        });
        res.status(200).json({message: "Updated Successfully"});
    } catch (error) {
        console.log(error.message);
    }
};

// Delete Post
export const deletePost = async (req, res) => {
    const post = await Post.findOne({
        where: {
            slug: req.params.slug
        }
    });
    if(!post) return res.status(404).json({message: "No Data Found"});

    try {
        const filepath = `./public/images/${post.image}`;
        fs.unlinkSync(filepath);
        await Post.destroy({
            where: {
                slug: req.params.slug
            }
        });
        res.status(200).json({message: "Post Deleted Successfully"})
    } catch (error) {
        console.log(error.message);
    }
};