import mongoose, { Schema } from "mongoose";

const feedSchema = new Schema({
    // Reference to the actual post (polymorphic)
    postType: {
        type: String,
        enum: ['EVENT', 'LOST_FOUND', 'ANNOUNCEMENT'],
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    postModel: {
        type: String,
        required: true,
        enum: ['Event', 'LostFound', 'Announcement']
    },
    
    // Denormalized fields for efficient querying
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        maxLength: 300,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    collegeInfo: {
        collegeName: String,
        collegeDomain: String,
        collegeCode: String
    },
    
    // Visibility and targeting
    isPublic: {
        type: Boolean,
        default: true
    },
    targetAudience: {
        type: [String],
        enum: ['STUDENTS', 'TEACHERS', 'ALL'],
        default: ['ALL']
    },
    targetDepartments: [{
        type: String,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA', 'ADMIN', 'ALL']
    }],
    targetBatches: [{
        type: String,
        match: [/^\d{4}$/, 'Batch must be a 4-digit year']
    }],
    
    // Engagement metrics
    interactions: {
        views: {
            type: Number,
            default: 0
        },
        likes: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            likedAt: {
                type: Date,
                default: Date.now
            }
        }],
        shares: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            sharedAt: {
                type: Date,
                default: Date.now
            },
            platform: {
                type: String,
                enum: ['WHATSAPP', 'EMAIL', 'COPY_LINK', 'OTHER'],
                default: 'OTHER'
            }
        }],
        comments: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true,
                maxLength: 500,
                trim: true
            },
            isEdited: {
                type: Boolean,
                default: false
            },
            editedAt: Date,
            replies: [{
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                content: {
                    type: String,
                    required: true,
                    maxLength: 300,
                    trim: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    
    // Content classification (for smart parsing)
    aiClassification: {
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        extractedEntities: {
            dates: [Date],
            locations: [String],
            items: [String],
            departments: [String]
        },
        suggestedTags: [String],
        originalPrompt: String
    },
    
    // Priority and status
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED'],
        default: 'PUBLISHED'
    },
    
    // Scheduling
    scheduledFor: Date,
    publishedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: Date,
    
    // Tags and categorization
    tags: [{
        type: String,
        trim: true,
        maxLength: 50
    }],
    
    // Moderation
    isModerated: {
        type: Boolean,
        default: false
    },
    moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    moderationNotes: String,
    
    // Analytics
    analytics: {
        peakViews: {
            count: { type: Number, default: 0 },
            date: Date
        },
        engagementRate: {
            type: Number,
            default: 0
        },
        lastActivityAt: {
            type: Date,
            default: Date.now
        }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient querying
feedSchema.index({ postType: 1, status: 1, publishedAt: -1 });
feedSchema.index({ author: 1, createdAt: -1 });
feedSchema.index({ department: 1, publishedAt: -1 });
feedSchema.index({ targetAudience: 1, publishedAt: -1 });
feedSchema.index({ tags: 1 });
feedSchema.index({ priority: -1, publishedAt: -1 });
feedSchema.index({ scheduledFor: 1 });
feedSchema.index({ expiresAt: 1 });
feedSchema.index({ 'interactions.views': -1 });

// Compound index for feed queries
feedSchema.index({ 
    status: 1, 
    isPublic: 1, 
    publishedAt: -1,
    expiresAt: 1 
});

// Text index for search
feedSchema.index({ 
    title: 'text', 
    summary: 'text', 
    tags: 'text' 
});

// Virtual for engagement statistics
feedSchema.virtual('engagementStats').get(function() {
    const likes = this.interactions.likes.length;
    const comments = this.interactions.comments.length;
    const shares = this.interactions.shares.length;
    const views = this.interactions.views;
    
    return {
        likes,
        comments,
        shares,
        views,
        totalEngagement: likes + comments + shares,
        engagementRate: views > 0 ? ((likes + comments + shares) / views) * 100 : 0
    };
});

// Virtual for checking if post is currently active
feedSchema.virtual('isActive').get(function() {
    const now = new Date();
    const isPublished = this.status === 'PUBLISHED';
    const isScheduled = !this.scheduledFor || this.scheduledFor <= now;
    const isNotExpired = !this.expiresAt || this.expiresAt > now;
    
    return isPublished && isScheduled && isNotExpired;
});

// Method to increment view count
feedSchema.methods.incrementViews = function() {
    this.interactions.views += 1;
    this.analytics.lastActivityAt = new Date();
    
    // Update peak views if current views are higher
    if (this.interactions.views > this.analytics.peakViews.count) {
        this.analytics.peakViews.count = this.interactions.views;
        this.analytics.peakViews.date = new Date();
    }
    
    return this.save();
};

// Method to toggle like
feedSchema.methods.toggleLike = function(userId) {
    const userIdStr = userId.toString();
    const likeIndex = this.interactions.likes.findIndex(
        like => like.user.toString() === userIdStr
    );
    
    if (likeIndex > -1) {
        this.interactions.likes.splice(likeIndex, 1);
        return { action: 'removed', newCount: this.interactions.likes.length };
    } else {
        this.interactions.likes.push({ user: userId });
        this.analytics.lastActivityAt = new Date();
        return { action: 'added', newCount: this.interactions.likes.length };
    }
};

// Method to add comment
feedSchema.methods.addComment = function(userId, content) {
    const comment = {
        user: userId,
        content: content.trim()
    };
    
    this.interactions.comments.push(comment);
    this.analytics.lastActivityAt = new Date();
    
    return this.interactions.comments[this.interactions.comments.length - 1];
};

// Method to add reply to comment
feedSchema.methods.addReply = function(commentId, userId, content) {
    const comment = this.interactions.comments.id(commentId);
    if (!comment) {
        throw new Error('Comment not found');
    }
    
    const reply = {
        user: userId,
        content: content.trim()
    };
    
    comment.replies.push(reply);
    this.analytics.lastActivityAt = new Date();
    
    return reply;
};

// Method to check if user can see this post
feedSchema.methods.isVisibleToUser = function(user) {
    if (!this.isActive) return false;
    
    // Public posts are visible to all
    if (this.isPublic && this.targetAudience.includes('ALL')) return true;
    
    // Check target audience
    if (user.role === 'STUDENT' && this.targetAudience.includes('STUDENTS')) {
        // Check department filter
        if (this.targetDepartments.length === 0 || 
            this.targetDepartments.includes('ALL') ||
            this.targetDepartments.includes(user.department)) {
            
            // Check batch filter
            if (this.targetBatches.length === 0 || 
                this.targetBatches.includes(user.batch)) {
                return true;
            }
        }
    }
    
    if (user.role === 'TEACHER' && this.targetAudience.includes('TEACHERS')) {
        if (this.targetDepartments.length === 0 || 
            this.targetDepartments.includes('ALL') ||
            this.targetDepartments.includes(user.department)) {
            return true;
        }
    }
    
    // Author can always see their posts
    if (this.author.toString() === user._id.toString()) return true;
    
    // Superadmin can see all
    if (user.role === 'SUPERADMIN') return true;
    
    return false;
};

// Static method to get personalized feed for user
feedSchema.statics.getPersonalizedFeed = function(user, options = {}) {
    const {
        page = 1,
        limit = 20,
        postType = null,
        department = null,
        sortBy = 'recent' // 'recent', 'popular', 'trending'
    } = options;
    
    let query = {
        status: 'PUBLISHED',
        $or: [
            { scheduledFor: { $exists: false } },
            { scheduledFor: { $lte: new Date() } }
        ],
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    };
    
    // Add post type filter
    if (postType) query.postType = postType;
    
    // Add department filter
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
    
    return this.find(query)
        .populate('author', 'fullname department role studentId avatar')
        .populate('postId')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);
};

// Pre-save hook to update analytics
feedSchema.pre('save', function(next) {
    if (this.isModified('interactions')) {
        const stats = this.engagementStats;
        this.analytics.engagementRate = stats.engagementRate;
    }
    next();
});

export const Feed = mongoose.model("Feed", feedSchema);
