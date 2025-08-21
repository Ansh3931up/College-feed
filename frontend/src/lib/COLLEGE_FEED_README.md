# College Feed System API Documentation

This document describes the new college feed system API that replaces the previous blog-based system with a smart, intent-based posting system.

## Overview

The college feed system supports three main post types:
1. **Event Posts** - For workshops, fests, club activities (with Going/Interested/Not Going responses)
2. **Lost & Found Posts** - To report lost items or announce found items
3. **Official Announcements** - For notices, timetables, and campus-wide updates

## Key Features

### 🧠 Smart Post Classification
- Natural language input automatically detects post intent
- Single text input generates structured post previews
- Users can edit and refine before publishing

### 👥 Role-Based System
- **Students**: Auto-approved with college email (format: 22206@iiitu.ac.in)
- **Teachers**: Require super admin approval after document submission
- **Super Admin**: College director with full system access

### 🎯 Intelligent Targeting
- Posts can target specific departments, batches, or roles
- Personalized feed based on user profile
- Department-wise filtering and sorting

## Authentication System

### Student Registration
```typescript
import { useAuth } from '@/lib';

const { registerAsStudent } = useAuth();

await registerAsStudent({
  fullname: "John Doe",
  email: "22206@iiitu.ac.in", // Must follow college email format
  password: "SecurePass123",
  department: "CSE",
  batch: "2022",
  bio: "Computer Science student interested in AI",
  avatar: avatarFile // Optional
});
```

### Teacher Registration (Creates Approval Request)
```typescript
const { registerAsTeacher } = useAuth();

await registerAsTeacher({
  fullname: "Dr. Jane Smith",
  email: "jane.smith@iiitu.ac.in",
  password: "SecurePass123",
  department: "CSE",
  employeeId: "EMP001",
  designation: "ASSISTANT_PROFESSOR",
  qualification: "PhD in Computer Science",
  experience: 5,
  contactNumber: "9876543210",
  address: {
    street: "123 University Road",
    city: "Allahabad",
    state: "Uttar Pradesh",
    pincode: "211015"
  },
  resume: resumeFile,
  idProof: idProofFile
});
```

### Login
```typescript
const { login } = useAuth();

await login({
  email: "22206@iiitu.ac.in",
  password: "SecurePass123"
});
```

## Smart Post Creation

### Step 1: Generate Preview from Natural Language
```typescript
import { useSmartPostCreation } from '@/lib';

const { generatePreview, postPreview } = useSmartPostCreation();

// User types naturally
await generatePreview(
  "Lost my black wallet near the library yesterday evening. Contains ID cards and some cash. Please contact if found.",
  [imageFile] // Optional attachments
);

// System automatically classifies as LOST_FOUND post
console.log(postPreview.postType); // "LOST_FOUND"
console.log(postPreview.classification.confidence); // 0.85
```

### Step 2: Edit and Refine Preview
```typescript
const { editPreview, publishFinalPost } = useSmartPostCreation();

// Edit the generated preview
editPreview({
  ...postPreview,
  title: "Lost Black Wallet - Reward Offered",
  itemName: "Black Leather Wallet",
  category: "ACCESSORIES",
  location: "Near Central Library",
  contactInfo: {
    phone: "9876543210",
    alternateContact: "Room 204, Hostel A"
  }
});

// Publish the final post
await publishFinalPost(postPreview);
```

## Feed System

### Get Personalized Feed
```typescript
import { useFeed } from '@/lib';

const { posts, loading, refetch } = useFeed({
  postType: "EVENT", // Optional filter
  department: "CSE", // Optional filter
  sortBy: "recent" // "recent", "popular", "trending"
});
```

### Post Interactions
```typescript
import { usePost } from '@/lib';

const { 
  post, 
  toggleLike, 
  addComment, 
  respondToEvent, 
  claimItem 
} = usePost(postId);

// Like/unlike a post
await toggleLike();

// Add a comment
await addComment("Great event! Looking forward to it.");

// Respond to an event
await respondToEvent("going"); // "going" | "interested" | "notGoing" | "none"

// Claim a lost/found item
await claimItem("I think this is my wallet. I lost it yesterday around 3 PM near the library.");
```

## Admin Functions

### Teacher Request Management
```typescript
import { useTeacherRequests } from '@/lib';

const { 
  requests, 
  approveRequest, 
  rejectRequest, 
  requestInfo 
} = useTeacherRequests({
  status: "PENDING",
  department: "CSE"
});

// Approve a teacher request
await approveRequest({ 
  id: requestId, 
  notes: "All documents verified. Welcome to the team!" 
});

// Reject a request
await rejectRequest({ 
  id: requestId, 
  reason: "Incomplete documentation", 
  notes: "Please submit experience certificates" 
});

// Request additional information
await requestInfo({ 
  id: requestId, 
  message: "Please provide latest qualification certificates" 
});
```

## Post Types in Detail

### Event Posts
```typescript
interface Event {
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  eventTime: string; // "14:30"
  eventType: "WORKSHOP" | "FEST" | "CLUB_ACTIVITY" | "SEMINAR" | "COMPETITION" | "OTHER";
  maxParticipants?: number;
  responses: {
    going: Array<{ user: string; respondedAt: Date }>;
    interested: Array<{ user: string; respondedAt: Date }>;
    notGoing: Array<{ user: string; respondedAt: Date }>;
  };
}
```

### Lost & Found Posts
```typescript
interface LostFoundItem {
  title: string;
  description: string;
  itemType: "LOST" | "FOUND";
  category: "ELECTRONICS" | "BOOKS" | "CLOTHING" | "ACCESSORIES" | "DOCUMENTS" | "KEYS" | "OTHER";
  itemName: string;
  location: string;
  dateTime: Date;
  contactInfo: {
    phone?: string;
    alternateContact?: string;
  };
  images: string[];
  status: "ACTIVE" | "RESOLVED" | "CLOSED";
  claims: Array<{
    claimant: string;
    claimMessage: string;
    isVerified: boolean;
  }>;
}
```

### Announcements
```typescript
interface Announcement {
  title: string;
  content: string;
  department: string;
  announcementType: "NOTICE" | "TIMETABLE" | "EXAMINATION" | "ADMISSION" | "SCHOLARSHIP" | "PLACEMENT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  targetAudience: {
    students: {
      all: boolean;
      departments: string[];
      batches: string[];
    };
    teachers: {
      all: boolean;
      departments: string[];
    };
  };
  attachments: Array<{
    filename: string;
    url: string;
    fileType: "IMAGE" | "PDF" | "DOC";
  }>;
  isPinned: boolean;
  isUrgent: boolean;
}
```

## Smart Classification Examples

### Event Detection
```
Input: "Workshop on Docker tomorrow at 5pm in CSE Lab"
Output: {
  postType: "EVENT",
  confidence: 0.89,
  extractedEntities: {
    dates: ["tomorrow"],
    times: ["5pm"],
    locations: ["CSE Lab"]
  }
}
```

### Lost & Found Detection
```
Input: "Found a blue water bottle near the canteen this morning"
Output: {
  postType: "LOST_FOUND",
  confidence: 0.92,
  extractedEntities: {
    dates: ["this morning"],
    locations: ["near the canteen"],
    items: ["blue water bottle"]
  }
}
```

### Announcement Detection
```
Input: "Important notice: Classes will be suspended tomorrow due to maintenance work"
Output: {
  postType: "ANNOUNCEMENT",
  confidence: 0.85,
  extractedEntities: {
    dates: ["tomorrow"],
    departments: []
  }
}
```

## Error Handling

```typescript
import { useAuth } from '@/lib';

const { login, loginError } = useAuth();

try {
  await login({ email, password });
} catch (error) {
  if (loginError?.includes('pending approval')) {
    // Show approval pending message
  } else if (loginError?.includes('college email')) {
    // Show email format error
  } else {
    // Handle other errors
  }
}
```

## Form Validation

```typescript
import { useFormValidation } from '@/lib';

const { 
  validateCollegeEmail, 
  validateStudentId, 
  validateBatch,
  validatePassword,
  validatePhone
} = useFormValidation();

// Validate college email format
const isValidEmail = validateCollegeEmail("22206@iiitu.ac.in"); // true

// Validate student ID
const isValidStudentId = validateStudentId("22206"); // true

// Validate batch year
const isValidBatch = validateBatch("2022"); // true
```

## Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_DEBUG=false
```

## Migration from Legacy System

The new system is backward compatible with the old API. Legacy components can continue using the old API while new components use the college feed system:

```typescript
// Legacy (still works)
import { userAPI, blogAPI } from '@/lib';

// New college system (recommended)
import { collegeUserAPI, feedAPI } from '@/lib';
```

## Best Practices

1. **Use Smart Classification**: Let the system detect post intent from natural language
2. **Validate Input**: Always validate college emails and student IDs
3. **Handle Approvals**: Check user approval status before allowing actions
4. **Target Appropriately**: Use department and batch targeting for relevant content
5. **Error Boundaries**: Implement proper error handling for all API calls
6. **Real-time Updates**: Use refetch functions to keep data current

## Support

For issues or questions about the college feed system, contact the development team or refer to the API documentation in the backend repository.
