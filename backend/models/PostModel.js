import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Post = db.define("post", {
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    image: DataTypes.STRING,
    url: DataTypes.STRING,
    content: DataTypes.STRING,
    category: DataTypes.STRING,
}, {
    freezeTableName: true
});

export default Post;

(async() => {
    await db.sync();
})();