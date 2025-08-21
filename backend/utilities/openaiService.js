import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY});

/**
 * Classify user input and generate structured post data
 * @param {string} userInput - The natural language input from user
 * @returns {Promise<Object>} - Classified post data with type and structured fields
 */
export const classifyAndStructurePost = async (userInput) => {
  // Check if OpenAI should be bypassed (for testing when quota exceeded)
  if (process.env.BYPASS_OPENAI === 'true') {
    console.log('🔧 Bypassing OpenAI, using fallback classification only');
    return fallbackClassification(userInput);
  }

  try {
    const systemPrompt = `You are a smart college feed post classifier. Analyze the user's input and classify it into one of three types:

1. **EVENT** - Workshops, seminars, fests, club activities, competitions, meetings
2. **LOST_FOUND** - Lost items, found items, missing belongings
3. **ANNOUNCEMENT** - Official notices, department announcements, policy updates, deadlines

For each classification, extract relevant information and return a JSON response in this exact format:

For EVENT:
{
  "postType": "EVENT",
  "title": "extracted event title",
  "description": "extracted description", 
  "location": "extracted location or 'TBD'",
  "eventDate": "extracted date in YYYY-MM-DD format (must be future date)",
  "eventTime": "extracted time in HH:MM format or '09:00'",
  "eventType": "WORKSHOP|SEMINAR|FEST|CLUB_ACTIVITY|COMPETITION|OTHER",
  "organizerDepartment": "CSE|ECE|ME|CE|EE|IT|MBA|ADMIN",
  "isPublic": true
}

For LOST_FOUND:
{
  "postType": "LOST_FOUND", 
  "title": "Lost/Found: item name",
  "description": "detailed description",
  "itemType": "LOST|FOUND",
  "category": "ELECTRONICS|BOOKS|CLOTHING|ACCESSORIES|DOCUMENTS|KEYS|SPORTS_EQUIPMENT|OTHER",
  "itemName": "specific item name",
  "location": "last known location or found location",
  "dateTime": "ISO date string or current date",
  "contactInfo": {
    "preferredMethod": "email|phone"
  }
}

For ANNOUNCEMENT:
{
  "postType": "ANNOUNCEMENT",
  "title": "extracted announcement title", 
  "content": "extracted content",
  "department": "CSE|ECE|ME|CE|EE|IT|MBA|ADMIN|ALL",
  "priority": "HIGH|MEDIUM|LOW",
  "category": "academic|administrative|event|deadline|policy|other",
  "isOfficial": true
}

Return ONLY the JSON object, no other text.`;

    const userPrompt = `Classify this input: "${userInput}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    const classifiedData = JSON.parse(response);
    
    // Validate that we got a valid post type
    const validTypes = ['EVENT', 'LOST_FOUND', 'ANNOUNCEMENT'];
    if (!validTypes.includes(classifiedData.postType)) {
      throw new Error('Invalid post type classification');
    }

    return {
      success: true,
      data: classifiedData,
      confidence: 'high' // Could be enhanced with confidence scoring
    };

  } catch (error) {
    console.error('OpenAI classification error:', error);
    
    // Check if it's a rate limit error and provide specific message
    if (error.status === 429) {
      console.log('⚠️ OpenAI rate limit exceeded, using fallback classification');
    } else if (error.code === 'insufficient_quota') {
      console.log('⚠️ OpenAI quota exceeded, using fallback classification');
    }
    
    // Fallback classification based on keywords
    return fallbackClassification(userInput);
  }
};

/**
 * Fallback classification when OpenAI fails
 * @param {string} userInput 
 * @returns {Object}
 */
const fallbackClassification = (userInput) => {
  const input = userInput.toLowerCase();
  
  // Event keywords
  const eventKeywords = ['workshop', 'seminar', 'fest', 'event', 'competition', 'meeting', 'talk', 'conference', 'hackathon'];
  // Lost & Found keywords  
  const lostFoundKeywords = ['lost', 'found', 'missing', 'misplaced', 'dropped', 'left'];
  // Announcement keywords
  const announcementKeywords = ['announce', 'notice', 'circular', 'deadline', 'exam', 'schedule', 'policy', 'update'];

  let postType = 'ANNOUNCEMENT'; // Default
  
  if (eventKeywords.some(keyword => input.includes(keyword))) {
    postType = 'EVENT';
  } else if (lostFoundKeywords.some(keyword => input.includes(keyword))) {
    postType = 'LOST_FOUND';
  }

  // Generate basic structure based on classification
  switch (postType) {
    case 'EVENT':
      // Set event date to tomorrow to ensure it's in the future
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        success: true,
        data: {
          postType: 'EVENT',
          title: userInput.slice(0, 100),
          description: userInput,
          location: 'TBD',
          eventDate: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD format, tomorrow
          eventTime: '09:00',
          eventType: 'OTHER', // Fixed: uppercase and valid enum
          organizerDepartment: 'CSE',
          isPublic: true
        },
        confidence: 'low',
        fallback: true
      };
      
    case 'LOST_FOUND':
      const isLost = input.includes('lost') || input.includes('missing');
      return {
        success: true,
        data: {
          postType: 'LOST_FOUND',
          title: `${isLost ? 'Lost' : 'Found'}: ${userInput.slice(0, 50)}`,
          description: userInput,
          itemType: isLost ? 'LOST' : 'FOUND',
          category: 'OTHER',
          itemName: 'Item',
          location: 'Campus',
          dateTime: new Date().toISOString(),
          contactInfo: {
            preferredMethod: 'email'
          }
        },
        confidence: 'low', 
        fallback: true
      };
      
    default:
      return {
        success: true,
        data: {
          postType: 'ANNOUNCEMENT',
          title: userInput.slice(0, 100),
          content: userInput,
          department: 'ALL',
          priority: 'MEDIUM',
          category: 'other',
          isOfficial: false
        },
        confidence: 'low',
        fallback: true
      };
  }
};

export default { classifyAndStructurePost };
