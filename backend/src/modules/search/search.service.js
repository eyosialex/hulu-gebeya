const prisma = require('../../prisma/client');
const { GoogleGenAI } = require('@google/genai');

const ragSearch = async (query) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  // Initialize Gen AI SDK
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 1. Retrieve all approved locations to build the context
  const locations = await prisma.location.findMany({
    where: { status: 'APPROVED' },
    select: {
      name: true,
      category: true,
      description: true,
      latitude: true,
      longitude: true,
      verificationScore: true
    }
  });

  if (locations.length === 0) {
    return 'No verified locations available right now to search through.';
  }

  // 2. Build the Document Context
  let contextStr = 'Here is the current database of verified SmartMap locations:\n';
  locations.forEach((loc, index) => {
    contextStr += `\n[${index + 1}] Name: ${loc.name} | Category: ${loc.category} | Desc: ${loc.description || 'N/A'}\n`;
    contextStr += `    Coordinates: (${loc.latitude}, ${loc.longitude}) | Score: ${loc.verificationScore}\n`;
  });

  // 3. Construct the RAG Prompt
  const prompt = `
System Context: You are SmartMap AI, a helpful location-based assistant. 
You answer user questions strictly based on the provided database context below.
If the database context does not contain the answer, say "I couldn't find that in the SmartMap database." Do not invent locations.

Database Context:
${contextStr}

User Question: ${query}

Provide a concise, helpful response:
`;

  // 4. Generate the response
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return {
    answer: response.text,
    sourceLocationsSearched: locations.length
  };
};

module.exports = {
  ragSearch
};
