import { User } from '../module/user.model.js';
import ApiError from '../utilities/ApiError.js';
import ApiResponse from '../utilities/ApiResponse.js';
import {asyncHandler } from '../utilities/asyncHandler.js'
import { uploadOnCloudinary } from '../utilities/cloudinary.js';
import sendEmail from '../utilities/sendEmail.js';
import crypto from "crypto";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-posts'); // Assuming 'posts' is analogous to 'lectures' in Blog model
    // const totalUsers = users.length;
    return res
        .status(200)
        .json(new ApiResponse(200, users, "All users present"));
});
const filterByPincode=asyncHandler(async(req,res)=>{
    const {pincode}=req.params;
    const users=await User.find({pincode:pincode}).select("-password -refreshToken");
    return res
        .status(200)
        .json(new ApiResponse(200,users,"User filtered by pincode successfully"))
})
const generateAccessandrefershToken=async(userid)=>{
    try {
        console.log("Generating tokens for user ID:", userid);
        
        const user=await User.findById(userid);
        if (!user) {
            console.error("User not found for ID:", userid);
            throw new Error("User not found");
        }
        
        console.log("User found:", user.email);
        console.log("ACCESS_TOKEN_SECRET exists:", !!process.env.ACCESS_TOKEN_SECRET);
        console.log("REFRESH_TOKEN_SECRET exists:", !!process.env.REFRESH_TOKEN_SECRET);
        
        const accessToken=user.generateAccessToken();
        console.log("Access token generated:", !!accessToken);
        
        const refreshToken=user.generateRefreshToken();
        console.log("Refresh token generated:", !!refreshToken);
        
        user.refreshToken=refreshToken;
        await user.save({ validateBeforeSave:false});
        console.log("User saved with refresh token");

        return {accessToken,refreshToken}

        
    } catch (error) {
        console.error("Token generation error details:", error);
        throw new ApiError(500,"unable to generate access and refresh token: " + error.message)
    }
}
const options={
    maxAge:7*24*60*60*1000,

   

    httpOnly:true,

    secure:true,
    sameSite:'None'
}
const register = asyncHandler(async (req, res) => {
    const { fullname, email, password, department, batch, role, bio, studentId, employeeId, collegeCode } = req.body;

    // Validate required fields
    if ([fullname, email, password, department, collegeCode].some((item) => item?.trim() === '')) {
        throw new ApiError(400, "Fullname, email, password, department, and college code are required");
    }

    // Validate role
    if (role && !['STUDENT', 'TEACHER', 'COLLEGE_ADMIN'].includes(role)) {
        throw new ApiError(400, "Invalid role. Only STUDENT, TEACHER, and COLLEGE_ADMIN are allowed");
    }

    const userRole = role || 'STUDENT';

    // Additional validation based on role
    if (userRole === 'STUDENT' && !studentId) {
        throw new ApiError(400, "Student ID is required for students");
    }

    if (userRole === 'TEACHER' && !employeeId) {
        throw new ApiError(400, "Employee ID is required for teachers");
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    // Set up college information based on college code
    const collegeMap = {
        'IIITU': { name: 'Indian Institute of Information Technology Una', domain: 'iiitu.ac.in' },
        'IIITA': { name: 'Indian Institute of Information Technology Allahabad', domain: 'iiita.ac.in' },
        'IITD': { name: 'Indian Institute of Technology Delhi', domain: 'iitd.ac.in' },
        'IITB': { name: 'Indian Institute of Technology Bombay', domain: 'iitb.ac.in' },
        'IITK': { name: 'Indian Institute of Technology Kanpur', domain: 'iitk.ac.in' },
        'IITM': { name: 'Indian Institute of Technology Madras', domain: 'iitm.ac.in' },
        'IITKGP': { name: 'Indian Institute of Technology Kharagpur', domain: 'iitkgp.ac.in' },
        'IITR': { name: 'Indian Institute of Technology Roorkee', domain: 'iitr.ac.in' },
        'DTU': { name: 'Delhi Technological University', domain: 'dtu.ac.in' },
        'NSUT': { name: 'Netaji Subhas University of Technology', domain: 'nsut.ac.in' }
    };

    const collegeData = collegeMap[collegeCode];
    if (!collegeData) {
        throw new ApiError(400, "Invalid college code");
    }

    // Extract domain from email and validate against college
    const emailDomain = email.split('@')[1];
    if (emailDomain !== collegeData.domain) {
        throw new ApiError(400, `Email must be from ${collegeData.domain} for ${collegeData.name}`);
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Handle avatar upload (optional)
    let avatarUrl = 'https://res.cloudinary.com/default/image/upload/v1/default-avatar.png';
    if (req.file) {
        const avatar = await uploadOnCloudinary(req.file.path);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }

    // Create user directly (no approval needed)
    const user = await User.create({
        fullname,
        email,
        password,
        department,
        batch,
        studentId,
        employeeId,
        role: userRole,
        bio,
        avatar: avatarUrl,
        isActive: true,
        collegeInfo: {
            collegeName: collegeData.name,
            collegeDomain: collegeData.domain,
            collegeCode: collegeCode
        }
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
}); 
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find user by email only (more secure)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found with this email");
    }

    // Users are auto-approved based on college email domain

    // Check if user is active
    if (!user.isActive) {
        throw new ApiError(403, "Your account has been deactivated. Please contact admin.");
    }

    // Verify password
    const isPasswordCorrect = await user.verifyPassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessandrefershToken(user._id);

    // Get user without sensitive data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .status(200)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, 'Login successful'));
});

const logout=asyncHandler(async(req,res)=>{

    const user=req.user;
    if(!user){
        throw new ApiError(404,"no user logged in");
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
            {refreshToken:undefined}
        },{
            new:true
        }

    )
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logout "))
})

const getProfile=asyncHandler(async(req,res)=>{
    const user=req.user;
    res
    .status(200)
    .json(new ApiResponse(200,user,"User data"));
})
const forgot=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({
        email
    })
    if(!user){
        throw new ApiError(400,"User does not exists ");
    }

    const resetToken=await user.generatePasswordResetToken();
    await user.save();
    let ans=process.env.FRONTEND_URL;
    console.log(ans)
    const resetPasswordURL=`${ans}/reset/${resetToken}`;
    console.log(resetPasswordURL);
    try {
        await sendEmail(email,'AASA HI',"heelo jiii");



        res.status(200).json(new ApiResponse(200,`Reset password token has been sent to ${email} successfully`))
        
    } catch (error) {
        user.forgotPasswordExpiry=undefined;
        user.forgotPasswordToken=undefined;
        await user.save();
        console.log(error)
        res.status(500).json(new ApiError(500,"email not send"))
    }
});

const reset=asyncHandler(async(req,res)=>{

    const {password}=req.body;

    const {resetToken}=req.params;

    const forgotPasswordToken=crypto//encrypt krka store krana 
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');


    const user=await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    })

    if(!user){
        throw new ApiError(404,"user not found or token expired");
    }
    user.password=password;
    user.forgotPasswordToken=undefined;
    user.forgotPasswordExpiry=undefined;

    user.save();
    return res
        .status(400)
        .json( new ApiResponse(200,"successfully changed"));
    

})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    console.log(req.body)
    const {oldPassword,newPassword}=req.body;
    // if(newPassword!=confPassword){
    //     throw new ApiError(400,"newpassword and confpassword is not same")
    // }

    const user=await User.findById(req.user?._id)
    console.log(user)
    const isPasswordValids=await user.verifyPassword(oldPassword)
    console.log(isPasswordValids)
    if(!isPasswordValids){
        throw new ApiError(401,"unauthorized access wrong password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})// baaki sab same rhta hai

    return res
    .status(200)
    .json(new ApiResponse(200,"password changed successfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    const user=req.user;
    // console.log(user)
    return res
    .status(200)
    .json(new ApiResponse(200,user,"current user fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email,Pincode,State,address}=req.body
    console.log(req.body)
    if(!fullname||!email|!Pincode||!State||!address){
        throw new ApiError(404,"all fields are required")
    }
    const newuser= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
            {fullname,email,Pincode,State,address}
        },
        {
            new:
            true
        }
    ).select("-password -refreshToken")
    console.log(newuser);
    return res
        .status(200)
        .json(new ApiResponse(200,newuser,"Account details updated successfully"))
})
const calculateTotalRevenue = asyncHandler(async (req, res) => {
    const users = await User.find({}).populate('isSubscribed', 'price');
    let totalRevenue = 0;

    users.forEach(user => {
        user.isSubscribed.forEach(subscription => {
            totalRevenue += parseFloat(subscription.price);
        });
    });

    return res.status(200).json(new ApiResponse(200, totalRevenue, "Total revenue calculated successfully"));
});



// export {register,login,logout,getProfile,forgot,reset,updateAccountDetails,changeCurrentPassword,getCurrentUser};-----------



// Get users by college domain (for college admin)
const getUsersByCollege = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, department } = req.query;
    const userCollege = req.user.collegeInfo.collegeDomain;
    
    let query = { 'collegeInfo.collegeDomain': userCollege };
    
    if (role) query.role = role;
    if (department) query.department = department;
    
    const users = await User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    const total = await User.countDocuments(query);
    
    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: users.length,
                totalItems: total
            }
        }, "Users fetched successfully")
    );
});

// Create college admin
const createCollegeAdmin = asyncHandler(async (req, res) => {
    const { fullname, email, password, department } = req.body;
    
    if ([fullname, email, password, department].some(item => !item?.trim())) {
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
        throw new ApiError(409, "User with this email already exists");
    }
    
    const admin = await User.create({
        fullname,
        email,
        password,
        department,
        role: 'COLLEGE_ADMIN',
        isActive: true
    });
    
    const createdAdmin = await User.findById(admin._id).select("-password -refreshToken");
    
    return res.status(201).json(
        new ApiResponse(201, createdAdmin, "College admin created successfully")
    );
});

export {
    register,
    login,
    logout,
    getProfile,
    forgot,
    reset,
    updateAccountDetails,
    changeCurrentPassword,
    getCurrentUser,
    getAllUsers,
    filterByPincode,
    calculateTotalRevenue,
    getUsersByCollege,
    createCollegeAdmin
};

