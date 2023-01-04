import Users from "../../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Get Users
export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ["id", "username", "email"]
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
};

// Register User
export const Register = async(req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if(password !== confirmPassword) return res.status(400).json({message: "Password tidak sesuai"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    try {
        await Users.create({
            username: username,
            email: email,
            password: hashPassword
        })
        res.json({message: "Register Sucessfully!!!"})
    } catch (error) {
        console.log(error);
    }
};

// Login User
export const Login = async(req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({message: "Password salah"});
        const userId = user[0].id;
        const username = user[0].username;
        const email = user[0].email;

        const accessToken = jwt.sign({userId, username, email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "20s"
        });

        const refreshToken = jwt.sign({userId, username, email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "1d"
        });

        await Users.update({refresh_token: refreshToken}, {
            where: {
                id: userId
            }
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({message: "Email tidak ditemukan"});
    }
};


// Logout
export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({refresh_token: null}, {
        where: {
            id: userId
        }
    });
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
};

