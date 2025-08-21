import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: [200, "Title cannot exceed 200 characters"]
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: [1000, "Description cannot exceed 1000 characters"]
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxLength: [200, "Location cannot exceed 200 characters"]
    },
    eventDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date > Date.now();
            },
            message: "Event date must be in the future"
        }
    },
    eventTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"]
    },
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizerDepartment: {
        type: String,
        required: true,
        enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MBA', 'ADMIN']
    },
    eventType: {
        type: String,
        enum: ['WORKSHOP', 'FEST', 'CLUB_ACTIVITY', 'SEMINAR', 'COMPETITION', 'OTHER'],
        default: 'OTHER'
    },
    maxParticipants: {
        type: Number,
        min: 1,
        default: null // null means unlimited
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true,
        maxLength: 50
    }],
    attachments: [{
        type: String, // cloudinary URLs
        maxLength: 5 // max 5 attachments
    }],
    // Participant responses
    responses: {
        going: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            respondedAt: {
                type: Date,
                default: Date.now
            }
        }],
        interested: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            respondedAt: {
                type: Date,
                default: Date.now
            }
        }],
        notGoing: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            respondedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancellationReason: {
        type: String,
        maxLength: 500
    }
}, { timestamps: true });

// Indexes for better performance
eventSchema.index({ eventDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ organizerDepartment: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ tags: 1 });

// Virtual for participant counts
eventSchema.virtual('participantCounts').get(function() {
    return {
        going: this.responses.going.length,
        interested: this.responses.interested.length,
        notGoing: this.responses.notGoing.length,
        total: this.responses.going.length + this.responses.interested.length + this.responses.notGoing.length
    };
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
    if (!this.maxParticipants) return false;
    return this.responses.going.length >= this.maxParticipants;
};

// Method to get user's response
eventSchema.methods.getUserResponse = function(userId) {
    const userIdStr = userId.toString();
    
    if (this.responses.going.some(response => response.user.toString() === userIdStr)) {
        return 'going';
    }
    if (this.responses.interested.some(response => response.user.toString() === userIdStr)) {
        return 'interested';
    }
    if (this.responses.notGoing.some(response => response.user.toString() === userIdStr)) {
        return 'notGoing';
    }
    return 'none';
};

// Method to update user response
eventSchema.methods.updateUserResponse = function(userId, newResponse) {
    const userIdStr = userId.toString();
    
    // Remove user from all response arrays
    this.responses.going = this.responses.going.filter(r => r.user.toString() !== userIdStr);
    this.responses.interested = this.responses.interested.filter(r => r.user.toString() !== userIdStr);
    this.responses.notGoing = this.responses.notGoing.filter(r => r.user.toString() !== userIdStr);
    
    // Add to appropriate array
    if (newResponse === 'going') {
        this.responses.going.push({ user: userId });
    } else if (newResponse === 'interested') {
        this.responses.interested.push({ user: userId });
    } else if (newResponse === 'notGoing') {
        this.responses.notGoing.push({ user: userId });
    }
};

export const Event = mongoose.model("Event", eventSchema);
