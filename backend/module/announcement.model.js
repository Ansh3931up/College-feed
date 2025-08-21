import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: [200, "Title cannot exceed 200 characters"]
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: [2000, "Content cannot exceed 2000 characters"]
    },
    department: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA', 'ADMIN', 'ALL']
    },
    issuedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    announcementType: {
        type: String,
        enum: [
            'NOTICE', 'TIMETABLE', 'EXAMINATION', 'ADMISSION', 
            'SCHOLARSHIP', 'PLACEMENT', 'ACADEMIC', 'ADMINISTRATIVE', 
            'EMERGENCY', 'HOLIDAY', 'EVENT', 'OTHER'
        ],
        default: 'NOTICE'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    targetAudience: {
        students: {
            all: {
                type: Boolean,
                default: false
            },
            departments: [{
                type: String,
                enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA']
            }],
            batches: [{
                type: String,
                match: [/^\d{4}$/, 'Batch must be a 4-digit year']
            }],
            specificStudents: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        },
        teachers: {
            all: {
                type: Boolean,
                default: false
            },
            departments: [{
                type: String,
                enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA', 'ADMIN']
            }],
            specific: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        }
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        url: {
            type: String, // cloudinary URL
            required: true
        },
        fileType: {
            type: String,
            enum: ['IMAGE', 'PDF', 'DOC', 'EXCEL', 'OTHER'],
            required: true
        },
        fileSize: {
            type: Number, // in bytes
            required: true
        }
    }],
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        validate: {
            validator: function(date) {
                return !date || date > this.validFrom;
            },
            message: "Valid until date must be after valid from date"
        }
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true,
        maxLength: 50
    }],
    readBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    acknowledgmentRequired: {
        type: Boolean,
        default: false
    },
    acknowledgedBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            maxLength: 200
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    scheduledFor: {
        type: Date
    }
}, { timestamps: true });

// Indexes for better performance
announcementSchema.index({ department: 1 });
announcementSchema.index({ issuedBy: 1 });
announcementSchema.index({ announcementType: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ validFrom: 1, validUntil: 1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ tags: 1 });
announcementSchema.index({ isActive: 1, isPublished: 1 });

// Virtual for checking if announcement is currently valid
announcementSchema.virtual('isCurrentlyValid').get(function() {
    const now = new Date();
    const validFrom = this.validFrom || this.createdAt;
    const validUntil = this.validUntil;
    
    return now >= validFrom && (!validUntil || now <= validUntil);
});

// Virtual for read status statistics
announcementSchema.virtual('readStats').get(function() {
    return {
        totalReads: this.readBy.length,
        totalAcknowledgments: this.acknowledgedBy.length,
        readPercentage: 0 // This would need to be calculated based on target audience
    };
});

// Method to mark as read by user
announcementSchema.methods.markAsRead = function(userId) {
    const userIdStr = userId.toString();
    const alreadyRead = this.readBy.some(read => read.user.toString() === userIdStr);
    
    if (!alreadyRead) {
        this.readBy.push({ user: userId });
    }
};

// Method to acknowledge by user
announcementSchema.methods.acknowledge = function(userId, notes = '') {
    const userIdStr = userId.toString();
    const alreadyAcknowledged = this.acknowledgedBy.some(ack => ack.user.toString() === userIdStr);
    
    if (!alreadyAcknowledged) {
        this.acknowledgedBy.push({ 
            user: userId,
            notes: notes
        });
        // Also mark as read
        this.markAsRead(userId);
    }
};

// Method to check if user should see this announcement
announcementSchema.methods.isVisibleToUser = function(user) {
    if (!this.isActive || !this.isPublished || !this.isCurrentlyValid) {
        return false;
    }
    
    // Check if scheduled for future
    if (this.scheduledFor && this.scheduledFor > new Date()) {
        return false;
    }
    
    const { targetAudience } = this;
    
    // For students
    if (user.role === 'STUDENT') {
        if (targetAudience.students.all) return true;
        
        if (targetAudience.students.departments.includes(user.department)) return true;
        
        if (targetAudience.students.batches.includes(user.batch)) return true;
        
        if (targetAudience.students.specificStudents.some(id => id.toString() === user._id.toString())) {
            return true;
        }
    }
    
    // For teachers
    if (user.role === 'TEACHER') {
        if (targetAudience.teachers.all) return true;
        
        if (targetAudience.teachers.departments.includes(user.department)) return true;
        
        if (targetAudience.teachers.specific.some(id => id.toString() === user._id.toString())) {
            return true;
        }
    }
    
    // Superadmin can see all
    if (user.role === 'SUPERADMIN') return true;
    
    return false;
};

// Static method to get announcements for a user
announcementSchema.statics.getForUser = function(user, options = {}) {
    const { 
        page = 1, 
        limit = 20, 
        department = null, 
        type = null, 
        priority = null 
    } = options;
    
    let query = {
        isActive: true,
        isPublished: true,
        $or: [
            { validUntil: { $exists: false } },
            { validUntil: { $gte: new Date() } }
        ],
        $or: [
            { scheduledFor: { $exists: false } },
            { scheduledFor: { $lte: new Date() } }
        ]
    };
    
    // Add filters
    if (department) query.department = department;
    if (type) query.announcementType = type;
    if (priority) query.priority = priority;
    
    return this.find(query)
        .populate('issuedBy', 'fullname department role')
        .sort({ isPinned: -1, priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

export const Announcement = mongoose.model("Announcement", announcementSchema);
