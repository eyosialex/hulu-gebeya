const prisma = require('../../prisma/client');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const fs = require('fs');

const runAiVerification = async (locationId) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  // 1. Fetch location details
  const location = await prisma.location.findUnique({
    where: { id: locationId }
  });

  if (!location) throw new Error('Location not found');
  if (!location.imageUrl) throw new Error('Location has no image attached to verify.');

  // 2. Resolve local file (assuming imageUrl from our upload module looks like '/uploads/123-img.jpg')
  const localFileName = location.imageUrl.replace('/uploads/', '');
  const localFilePath = path.join(__dirname, '../../../public/uploads', localFileName);

  if (!fs.existsSync(localFilePath)) {
    throw new Error('Attached image file not found on the local server.');
  }

  // 3. Determine MIME type and read buffer
  const ext = path.extname(localFilePath).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';

  const base64Data = Buffer.from(fs.readFileSync(localFilePath)).toString('base64');

  // 4. Initialize AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are an AI automated moderator for "SmartMap".
Your task is to analyze this image to verify if it represents the claimed location.

Claimed Location Name: ${location.name}
Claimed Category: ${location.category}
Claimed Description: ${location.description || 'none provided'}

Does this image match the description and category? 
Respond strictly with valid JSON only in the following format (no markdown, no backticks):
{
  "valid": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}
`;

  // 5. Query Gemini Vision
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType
            }
          },
          { text: prompt }
        ]
      }
    ]
  });

  // 6. Parse Response securely
  let aiData;
  try {
    let cleanJson = response.text.trim();
    if (cleanJson.startsWith('\`\`\`json')) {
      cleanJson = cleanJson.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    }
    aiData = JSON.parse(cleanJson);
  } catch (error) {
    throw new Error('AI returned an invalid response format.');
  }

  // 7. Apply Logic (If highly confident and valid -> Auto-Approve!)
  let newStatus = location.status;
  if (aiData.valid && aiData.confidence >= 0.8) {
    newStatus = 'APPROVED';
  } else if (!aiData.valid && aiData.confidence >= 0.8) {
    newStatus = 'REJECTED';
  }

  const updatedLocation = await prisma.location.update({
    where: { id: locationId },
    data: { status: newStatus }
  });

  // Log the AI verification as a system activity
  await prisma.activityLog.create({
    data: {
      userId: location.createdById,
      action: 'AI_VERIFICATION_PROCESSED',
      details: `AI checked ${location.name}. Result: ${aiData.valid ? 'VALIDATED' : 'REJECTED'}. Reasoning: ${aiData.reasoning}`,
      points: aiData.valid ? 10 : 0, // Bonus points if validated by AI!
      coins: aiData.valid ? 5 : 0
    }
  });

  if (aiData.valid) {
    await prisma.user.update({
      where: { id: location.createdById },
      data: {
        points: { increment: 10 },
        coins: { increment: 5 }
      }
    });
  }

  return {
    aiAnalysis: aiData,
    finalStatus: newStatus,
    message: 'AI Verification Processed'
  };
};

module.exports = {
  runAiVerification
};
