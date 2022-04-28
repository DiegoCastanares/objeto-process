import mongoose from "mongoose";

const userCollection = 'User';
const userSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model(userCollection,userSchema);
export default User;