import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator"
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validator: [validator.isEmail, "Invalid email format"],
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
        type: String,
        enum: { values: ["buyer", "employee", "admin","customerService"], message: "invalid role" },
        required: [true, "Role is required"],
        default:"buyer"

    },
    phone: {
        type: String,
        match: [/^01[0125][0-9]{8}$/, "Invalid phone format"],
        required: [true, "invalid phone number"]
    },
    // Auth
    refreshToken: { type: String },

}, { timestamps: true },)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})
userSchema.methods.matchPassword = async function (enteredPass) {
    return await bcrypt.compare(enteredPass, this.password)
}
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.refreshToken
    delete user.password
    return user
}
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;