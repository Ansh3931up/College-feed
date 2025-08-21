import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from "crypto";

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, "min length is 2"],
        maxLength: [50, "max length is 50"]
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be more than 8 character']
    },
    studentId: {
        type: String,
        required: function() { return this.role === 'STUDENT'; },
        trim: true
    },
    employeeId: {
        type: String,
        required: function() { return this.role === 'TEACHER'; },
        trim: true
    },
    collegeInfo: {
        collegeName: {
            type: String,
            required: true,
            trim: true
        },
        collegeDomain: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        collegeCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        }
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    batch: {
        type: String,
        required: function() { return this.role === 'STUDENT'; },
        trim: true
    },
    avatar: {
        type: String, // cloudinary url
        default: 'https://res.cloudinary.com/default/image/upload/v1/default-avatar.png'
    },
    refreshToken: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['STUDENT', 'TEACHER', 'COLLEGE_ADMIN'],
        default: 'STUDENT'
    },
    bio: {
        type: String,
        maxLength: [500, 'Bio cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

// Extract college info from email domain
userSchema.pre("save", function (next) {
    if (this.email && !this.collegeInfo.collegeDomain) {
        const emailParts = this.email.split('@');
        if (emailParts.length === 2) {
            this.collegeInfo.collegeDomain = emailParts[1];
            
            // Set college name and code based on domain (can be expanded)
            const collegeMap = {
                'iiitu.ac.in': { name: 'Indian Institute of Information Technology Una', code: 'IIITU' },
                'iiita.ac.in': { name: 'Indian Institute of Information Technology Allahabad', code: 'IIITA' },
                'iitd.ac.in': { name: 'Indian Institute of Technology Delhi', code: 'IITD' },
                // Add more colleges as needed
            };
            
            const collegeData = collegeMap[this.collegeInfo.collegeDomain];
            if (collegeData) {
                this.collegeInfo.collegeName = collegeData.name;
                this.collegeInfo.collegeCode = collegeData.code;
            } else {
                // Default for unknown domains
                this.collegeInfo.collegeName = 'Unknown Institution';
                this.collegeInfo.collegeCode = 'UNK';
            }
        }
    }
    next();
});

userSchema.methods.verifyPassword = async function (password) {
    if (!this.password || !password) {
        throw new Error("password or this.password is not defined");
    }
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullname: this.fullname,
            role: this.role,
            department: this.department,
            studentId: this.studentId,
            employeeId: this.employeeId,
            collegeInfo: this.collegeInfo
        },
        process.env.ACCESS_TOKEN_SECRET || 'default-access-secret',
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
}

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min from now
    return resetToken;
}

export const User = mongoose.model("User", userSchema);
