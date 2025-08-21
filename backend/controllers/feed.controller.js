import ApiResponse from "../utilities/ApiResponse.js";
import ApiError from "../utilities/ApiError.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { Feed } from "../module/feed.model.js";
import { Event } from "../module/event.model.js";
import { LostFound } from "../module/lostFound.model.js";
import { Announcement } from "../module/announcement.model.js";
import { classifyAndStructurePost } from "../utilities/openaiService.js";

// AI-powered smart post classification endpoint
export const smartClassifyPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
        throw new ApiError(400, "Content is required for classification");
    }
    
    try {
        console.log("Classifying content with OpenAI:", content);
        
        // Use OpenAI to classify and structure the post
        const classification = await classifyAndStructurePost(content);
        
        if (!classification.success) {
            throw new ApiError(500, "Failed to classify post content");
        }
        
        console.log("Classification result:", classification);
        
        return res.status(200).json(
            new ApiResponse(
                200, 
                {
                    classification: classification.data,
                    confidence: classification.confidence,
                    fallback: classification.fallback || false,
                    originalContent: content
                }, 
                "Post classified successfully"
            )
        );
        
    } catch (error) {
        console.error("Smart classification error:", error);
        throw new ApiError(500, `Classification failed: ${error.message}`);
    }
});

// Create and publish post in one step (simplified)
export const createAndPublishPost = asyncHandler(async (req, res) => {
    const { content, attachments = [] } = req.body;
    const userId = req.user._id;
    
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    
    let classificationResult; // Declare in outer scope
    
    try {
        console.log("Creating and publishing post with OpenAI:", content);
        
        // Step 1: Classify the content
        classificationResult = await classifyAndStructurePost(content);
        
        if (!classificationResult.success) {
            throw new ApiError(500, "Failed to classify post content");
        }
        
        const classification = classificationResult.data;
        console.log("Classification:", classification);
        console.log("User info:", {
            id: userId,
            department: req.user.department,
            collegeInfo: req.user.collegeInfo
        });
        
        // Step 2: Create the appropriate post type
        let createdPost;
        const commonData = {
            author: userId,
            collegeInfo: req.user.collegeInfo
        };
        
        switch (classification.postType) {
            case 'EVENT':
                const { Event } = await import('../module/event.model.js');
                createdPost = await Event.create({
                    ...classification,
                    organizer: userId,
                    organizerDepartment: req.user.department || classification.organizerDepartment,
                    collegeInfo: req.user.collegeInfo
                });
                break;
                
            case 'LOST_FOUND':
                const { LostFound } = await import('../module/lostFound.model.js');
                createdPost = await LostFound.create({
                    ...classification,
                    reporter: userId,
                    collegeInfo: req.user.collegeInfo
                });
                break;
                
            case 'ANNOUNCEMENT':
                const { Announcement } = await import('../module/announcement.model.js');
                createdPost = await Announcement.create({
                    ...classification,
                    issuedBy: userId, // Required field
                    department: req.user.department || classification.department,
                    collegeInfo: req.user.collegeInfo,
                    announcementType: classification.category === 'academic' ? 'ACADEMIC' : 
                                    classification.category === 'administrative' ? 'ADMINISTRATIVE' :
                                    classification.category === 'event' ? 'EVENT' : 'NOTICE'
                });
                break;
                
            default:
                throw new ApiError(400, "Invalid post type");
        }
        
        // Step 3: Create feed entry
        const feedEntry = await Feed.create({
            postModel: classification.postType === 'LOST_FOUND' ? 'LostFound' : 
            classification.postType === 'EVENT' ? 'Event' : 'Announcement',
            postId: createdPost._id,
            author: userId,
            postType: classification.postType,
            title: classification.title, // Required field
            summary: classification.description?.slice(0, 300) || classification.content?.slice(0, 300), // Optional summary
            department: req.user.department,
            collegeInfo: req.user.collegeInfo,
            isPublic: true,
            targetAudience: ['ALL'],
            visibility: 'PUBLIC'
        });
        
        // Step 4: Populate and return the complete post
        const populatedFeed = await Feed.findById(feedEntry._id)
            .populate('author', 'fullname email studentId employeeId department collegeInfo')
            .populate('postId');
        
        return res.status(201).json(
            new ApiResponse(
                201, 
                {
                    feedPost: populatedFeed,
                    classification: classification,
                    confidence: classificationResult.confidence,
                    fallback: classificationResult.fallback || false
                }, 
                "Post created and published successfully"
            )
        );
        
    } catch (error) {
        console.error("Create and publish error:", error);
        
        // Return detailed validation errors for debugging
        if (error.name === 'ValidationError') {
            const validationErrors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
                value: error.errors[key].value
            }));
            
            return res.status(400).json(
                new ApiResponse(
                    400,
                    {
                        validationErrors,
                        classification: classificationResult?.data,
                        userInfo: {
                            id: userId,
                            department: req.user.department,
                            collegeInfo: req.user.collegeInfo
                        }
                    },
                    `Validation failed: ${error.message}`
                )
            );
        }
        
        throw new ApiError(500, `Failed to create post: ${error.message}`);
    }
});

// Smart post classification utility
const classifyPostIntent = (content) => {
    const text = content.toLowerCase();
    
    // Keywords for different post types
    const eventKeywords = [
        'workshop', 'event', 'seminar', 'fest', 'competition', 'meeting',
        'session', 'training', 'conference', 'webinar', 'hackathon',
        'tomorrow', 'today', 'next week', 'upcoming', 'at ', 'pm', 'am',
        'lab', 'auditorium', 'hall', 'room'
    ];
    
    const lostFoundKeywords = [
        'lost', 'found', 'missing', 'wallet', 'phone', 'keys', 'bag',
        'book', 'laptop', 'charger', 'bottle', 'umbrella', 'glasses',
        'yesterday', 'today', 'near', 'library', 'canteen', 'hostel',
        'reward', 'please contact', 'if found'
    ];
    
    const announcementKeywords = [
        'notice', 'announcement', 'important', 'deadline', 'exam',
        'result', 'schedule', 'holiday', 'closed', 'postponed',
        'cancelled', 'department', 'circular', 'admission'
    ];
    
    // Calculate scores for each type
    let eventScore = 0;
    let lostFoundScore = 0;
    let announcementScore = 0;
    
    eventKeywords.forEach(keyword => {
        if (text.includes(keyword)) eventScore++;
    });
    
    lostFoundKeywords.forEach(keyword => {
        if (text.includes(keyword)) lostFoundScore++;
    });
    
    announcementKeywords.forEach(keyword => {
        if (text.includes(keyword)) announcementScore++;
    });
    
    // Extract entities
    const dateRegex = /\b(?:tomorrow|today|next week|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}-\d{1,2}-\d{4}))\b/gi;
    const timeRegex = /\b\d{1,2}:\d{2}\s*(?:am|pm)\b/gi;
    const locationRegex = /\b(?:lab|library|canteen|hostel|auditorium|hall|room|near|at)\s+\w+/gi;
    
    const extractedEntities = {
        dates: text.match(dateRegex) || [],
        times: text.match(timeRegex) || [],
        locations: text.match(locationRegex) || []
    };
    
    // Determine classification
    let postType = 'ANNOUNCEMENT'; // default
    let confidence = 0.3;
    
    const maxScore = Math.max(eventScore, lostFoundScore, announcementScore);
    
    if (maxScore > 0) {
        if (eventScore === maxScore) {
            postType = 'EVENT';
            confidence = Math.min(0.9, 0.4 + (eventScore * 0.1));
        } else if (lostFoundScore === maxScore) {
            postType = 'LOST_FOUND';
            confidence = Math.min(0.9, 0.4 + (lostFoundScore * 0.1));
        } else {
            postType = 'ANNOUNCEMENT';
            confidence = Math.min(0.9, 0.4 + (announcementScore * 0.1));
        }
    }
    
    return {
        postType,
        confidence,
        extractedEntities,
        scores: { eventScore, lostFoundScore, announcementScore }
    };
};

// Create smart post from natural language input
const createSmartPost = asyncHandler(async (req, res) => {
    const { content, attachments = [] } = req.body;
    const userId = req.user._id;
    
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }
    
    try {
        console.log("Creating smart post with OpenAI classification:", content);
        
        // Use OpenAI to classify and structure the post
        const classificationResult = await classifyAndStructurePost(content);
        
        if (!classificationResult.success) {
            throw new ApiError(500, "Failed to classify post content");
        }
        
        const classification = classificationResult.data;
        console.log("OpenAI classification result:", classification);
        
        // Generate preview data using OpenAI classification
        let previewData = {
            ...classification, // Use all fields from OpenAI classification
            author: userId,
            collegeInfo: req.user.collegeInfo,
            attachments: attachments,
            originalContent: content,
            confidence: classificationResult.confidence,
            fallback: classificationResult.fallback || false
        };
        
        // Add user-specific fields based on post type
        switch (classification.postType) {
            case 'EVENT':
                previewData = {
                    ...previewData,
                    organizer: userId,
                    organizerDepartment: req.user.department || classification.organizerDepartment
                };
                break;
                
            case 'LOST_FOUND':
                previewData = {
                    ...previewData,
                    reporter: userId
                };
                break;
                
            case 'ANNOUNCEMENT':
                previewData = {
                    ...previewData,
                    author: userId,
                    department: req.user.department || classification.department
                };
                break;
        }
        
        return res.status(200).json(
            new ApiResponse(200, previewData, "AI-powered smart post preview generated successfully")
        );
        
    } catch (error) {
        console.error("Smart post creation error:", error);
        throw new ApiError(500, `Smart post creation failed: ${error.message}`);
    }
});

// Finalize and publish the post
const publishPost = asyncHandler(async (req, res) => {
    const { postType, ...postData } = req.body;
    const userId = req.user._id;
    
    let createdPost;
    let feedPost;
    
    try {
        switch (postType) {
            case 'EVENT':
                createdPost = await Event.create({
                    ...postData,
                    organizer: userId,
                    organizerDepartment: req.user.department
                });
                
                feedPost = await Feed.create({
                    postType: 'EVENT',
                    postId: createdPost._id,
                    postModel: 'Event',
                    author: userId,
                    title: createdPost.title,
                    summary: createdPost.description.slice(0, 300),
                    department: req.user.department,
                    collegeInfo: req.user.collegeInfo,
                    targetAudience: ['ALL'],
                    aiClassification: postData.classification
                });
                break;
                
            case 'LOST_FOUND':
                createdPost = await LostFound.create({
                    ...postData,
                    reporter: userId
                });
                
                feedPost = await Feed.create({
                    postType: 'LOST_FOUND',
                    postId: createdPost._id,
                    postModel: 'LostFound',
                    author: userId,
                    title: createdPost.title,
                    summary: createdPost.description.slice(0, 300),
                    department: req.user.department,
                    collegeInfo: req.user.collegeInfo,
                    targetAudience: ['ALL'],
                    aiClassification: postData.classification
                });
                break;
                
            case 'ANNOUNCEMENT':
                // Only teachers and admins can create announcements
                if (req.user.role === 'STUDENT') {
                    throw new ApiError(403, "Students cannot create announcements");
                }
                
                createdPost = await Announcement.create({
                    ...postData,
                    issuedBy: userId,
                    department: postData.department || req.user.department
                });
                
                feedPost = await Feed.create({
                    postType: 'ANNOUNCEMENT',
                    postId: createdPost._id,
                    postModel: 'Announcement',
                    author: userId,
                    title: createdPost.title,
                    summary: createdPost.content.slice(0, 300),
                    department: createdPost.department,
                    collegeInfo: req.user.collegeInfo,
                    targetAudience: postData.targetAudience?.students?.all ? ['ALL'] : ['TEACHERS'],
                    aiClassification: postData.classification
                });
                break;
                
            default:
                throw new ApiError(400, "Invalid post type");
        }
        
        // Populate the created post
        await feedPost.populate('author', 'fullname department role studentId avatar');
        await feedPost.populate('postId');
        
        return res.status(201).json(
            new ApiResponse(201, {
                feedPost,
                originalPost: createdPost
            }, "Post published successfully")
        );
        
    } catch (error) {
        // Cleanup if something went wrong
        if (createdPost) {
            await createdPost.deleteOne();
        }
        if (feedPost) {
            await feedPost.deleteOne();
        }
        throw error;
    }
});

// Get personalized feed
const getFeed = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        postType, 
        department, 
        sortBy = 'recent' 
    } = req.query;
    
    const user = req.user;
    
    // Build query to filter by college
    let query = {
        status: 'PUBLISHED',
        'collegeInfo.collegeDomain': user.collegeInfo.collegeDomain,
        $or: [
            { scheduledFor: { $exists: false } },
            { scheduledFor: { $lte: new Date() } }
        ],
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    };
    
    // Add filters
    if (postType) query.postType = postType;
    if (department) query.department = department;
    
    // Determine sort order
    let sortOptions = {};
    switch (sortBy) {
        case 'popular':
            sortOptions = { 'interactions.views': -1, publishedAt: -1 };
            break;
        case 'trending':
            sortOptions = { 'analytics.engagementRate': -1, publishedAt: -1 };
            break;
        default:
            sortOptions = { priority: -1, publishedAt: -1 };
    }
    
    const feed = await Feed.find(query)
        .populate('author', 'fullname department role studentId employeeId avatar collegeInfo')
        .populate('postId')
        .sort(sortOptions)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    
    // Filter posts based on user visibility
    const visiblePosts = feed.filter(post => post.isVisibleToUser(user));
    
    return res.status(200).json(
        new ApiResponse(200, {
            posts: visiblePosts,
            pagination: {
                current: parseInt(page),
                hasNext: visiblePosts.length === parseInt(limit),
                count: visiblePosts.length
            }
        }, "Feed fetched successfully")
    );
});

// Get single post details
const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const feedPost = await Feed.findById(id)
        .populate('author', 'fullname department role studentId avatar')
        .populate('postId')
        .populate('interactions.comments.user', 'fullname department role studentId avatar')
        .populate('interactions.comments.replies.user', 'fullname department role studentId avatar');
    
    if (!feedPost) {
        throw new ApiError(404, "Post not found");
    }
    
    // Check if user can view this post
    if (!feedPost.isVisibleToUser(req.user)) {
        throw new ApiError(403, "You don't have permission to view this post");
    }
    
    // Increment view count
    await feedPost.incrementViews();
    
    return res.status(200).json(
        new ApiResponse(200, feedPost, "Post details fetched successfully")
    );
});

// Like/Unlike post
const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    
    const feedPost = await Feed.findById(id);
    if (!feedPost) {
        throw new ApiError(404, "Post not found");
    }
    
    const result = feedPost.toggleLike(userId);
    await feedPost.save();
    
    return res.status(200).json(
        new ApiResponse(200, {
            action: result.action,
            newCount: result.newCount
        }, `Post ${result.action === 'added' ? 'liked' : 'unliked'} successfully`)
    );
});

// Add comment to post
const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }
    
    const feedPost = await Feed.findById(id);
    if (!feedPost) {
        throw new ApiError(404, "Post not found");
    }
    
    const comment = feedPost.addComment(userId, content);
    await feedPost.save();
    
    // Populate the new comment
    await feedPost.populate('interactions.comments.user', 'fullname department role studentId avatar');
    const populatedComment = feedPost.interactions.comments.id(comment._id);
    
    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    );
});

// Add reply to comment
const addReply = asyncHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!content?.trim()) {
        throw new ApiError(400, "Reply content is required");
    }
    
    const feedPost = await Feed.findById(id);
    if (!feedPost) {
        throw new ApiError(404, "Post not found");
    }
    
    const reply = feedPost.addReply(commentId, userId, content);
    await feedPost.save();
    
    return res.status(201).json(
        new ApiResponse(201, reply, "Reply added successfully")
    );
});

// Event-specific actions
const respondToEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { response } = req.body; // 'going', 'interested', 'notGoing'
    const userId = req.user._id;
    
    if (!['going', 'interested', 'notGoing', 'none'].includes(response)) {
        throw new ApiError(400, "Invalid response. Must be 'going', 'interested', 'notGoing', or 'none'");
    }
    
    const feedPost = await Feed.findById(id).populate('postId');
    if (!feedPost || feedPost.postType !== 'EVENT') {
        throw new ApiError(404, "Event not found");
    }
    
    const event = feedPost.postId;
    
    // Check if event is full
    if (response === 'going' && event.isFull()) {
        throw new ApiError(400, "Event is full");
    }
    
    event.updateUserResponse(userId, response);
    await event.save();
    
    return res.status(200).json(
        new ApiResponse(200, {
            response,
            participantCounts: event.participantCounts
        }, `Event response updated to ${response}`)
    );
});

// Lost & Found specific actions
const claimItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;
    
    if (!message?.trim()) {
        throw new ApiError(400, "Claim message is required");
    }
    
    const feedPost = await Feed.findById(id).populate('postId');
    if (!feedPost || feedPost.postType !== 'LOST_FOUND') {
        throw new ApiError(404, "Lost & Found post not found");
    }
    
    const lostFoundItem = feedPost.postId;
    
    try {
        lostFoundItem.addClaim(userId, message);
        await lostFoundItem.save();
        
        return res.status(200).json(
            new ApiResponse(200, lostFoundItem, "Claim submitted successfully")
        );
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});

export {
    createSmartPost,
    publishPost,
    getFeed,
    getPostById,
    toggleLike,
    addComment,
    addReply,
    respondToEvent,
    claimItem
};
