import mongoose, { Schema } from "mongoose";

const lostFoundSchema = new Schema({
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
    itemType: {
        type: String,
        enum: ['LOST', 'FOUND'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'ELECTRONICS', 'BOOKS', 'CLOTHING', 'ACCESSORIES', 
            'DOCUMENTS', 'KEYS', 'SPORTS_EQUIPMENT', 'OTHER'
        ],
        default: 'OTHER'
    },
    itemName: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, "Item name cannot exceed 100 characters"]
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxLength: [200, "Location cannot exceed 200 characters"]
    },
    dateTime: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date <= Date.now();
            },
            message: "Date cannot be in the future"
        }
    },
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contactInfo: {
        phone: {
            type: String,
            match: [/^[6-9]\d{9}$/, "Please provide a valid phone number"]
        },
        email: {
            type: String,
            lowercase: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
        },
        alternateContact: {
            type: String,
            maxLength: 200
        }
    },
    images: [{
        type: String, // cloudinary URLs
        maxLength: 3 // max 3 images
    }],
    tags: [{
        type: String,
        trim: true,
        maxLength: 50
    }],
    color: {
        type: String,
        trim: true,
        maxLength: 50
    },
    brand: {
        type: String,
        trim: true,
        maxLength: 100
    },
    size: {
        type: String,
        trim: true,
        maxLength: 50
    },
    distinguishingFeatures: {
        type: String,
        trim: true,
        maxLength: 500
    },
    rewardOffered: {
        amount: {
            type: Number,
            min: 0
        },
        description: {
            type: String,
            maxLength: 200
        }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'CLOSED'],
        default: 'ACTIVE'
    },
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    resolutionNotes: {
        type: String,
        maxLength: 500
    },
    claims: [{
        claimant: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        claimMessage: {
            type: String,
            required: true,
            maxLength: 500
        },
        claimDate: {
            type: Date,
            default: Date.now
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationNotes: {
            type: String,
            maxLength: 300
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    }
}, { timestamps: true });

// Indexes for better performance
lostFoundSchema.index({ itemType: 1 });
lostFoundSchema.index({ category: 1 });
lostFoundSchema.index({ location: 1 });
lostFoundSchema.index({ reporter: 1 });
lostFoundSchema.index({ status: 1 });
lostFoundSchema.index({ dateTime: -1 });
lostFoundSchema.index({ tags: 1 });

// Virtual for days since reported
lostFoundSchema.virtual('daysSinceReported').get(function() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add a claim
lostFoundSchema.methods.addClaim = function(claimantId, message) {
    // Check if user already claimed
    const existingClaim = this.claims.find(
        claim => claim.claimant.toString() === claimantId.toString()
    );
    
    if (existingClaim) {
        throw new Error('You have already claimed this item');
    }
    
    this.claims.push({
        claimant: claimantId,
        claimMessage: message
    });
};

// Method to verify a claim
lostFoundSchema.methods.verifyClaim = function(claimId, isVerified, notes) {
    const claim = this.claims.id(claimId);
    if (!claim) {
        throw new Error('Claim not found');
    }
    
    claim.isVerified = isVerified;
    if (notes) {
        claim.verificationNotes = notes;
    }
    
    // If verified and this is a LOST item, mark as resolved
    if (isVerified && this.itemType === 'LOST') {
        this.status = 'RESOLVED';
        this.resolvedBy = claim.claimant;
        this.resolvedAt = new Date();
    }
};

// Method to mark as resolved
lostFoundSchema.methods.markResolved = function(resolvedByUserId, notes) {
    this.status = 'RESOLVED';
    this.resolvedBy = resolvedByUserId;
    this.resolvedAt = new Date();
    if (notes) {
        this.resolutionNotes = notes;
    }
};

// Static method to find similar items
lostFoundSchema.statics.findSimilarItems = function(item) {
    const oppositeType = item.itemType === 'LOST' ? 'FOUND' : 'LOST';
    
    return this.find({
        itemType: oppositeType,
        status: 'ACTIVE',
        category: item.category,
        $or: [
            { itemName: new RegExp(item.itemName, 'i') },
            { tags: { $in: item.tags } },
            { color: item.color },
            { brand: item.brand }
        ]
    }).populate('reporter', 'fullname email studentId department');
};

export const LostFound = mongoose.model("LostFound", lostFoundSchema);
