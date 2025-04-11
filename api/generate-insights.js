// api/generate-insights.js
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get business data from request body
    const businessData = req.body;
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OpenAI API key');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Initialize OpenAI with API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Log that we're starting the API call (for debugging)
    console.log('Making OpenAI API call...');
    
    // Format business profile
    const businessProfile = `
Business: ${businessData.businessName || 'N/A'}
Industry: ${businessData.industry || 'N/A'}
Description: ${businessData.description || 'N/A'}
Stage: ${businessData.stage || 'N/A'}
Employees: ${businessData.employees || 'N/A'}
Location: ${businessData.location || 'N/A'}
Monthly Revenue: $${businessData.financials?.monthlyRevenue || '0'}
Monthly Expenses: $${businessData.financials?.monthlyExpenses || '0'}
Funding Stage: ${businessData.financials?.fundingStage || 'N/A'}
Primary Goal: ${businessData.goals?.primaryGoal || 'N/A'}
Top Challenge: ${businessData.goals?.topChallenge || 'N/A'}
Market Factors: ${businessData.marketFactors?.length > 0 ? businessData.marketFactors.join(', ') : 'None specified'}
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert business growth advisor. Analyze business profiles and provide strategic insights."
        },
        {
          role: "user",
          content: `I need a comprehensive business growth analysis for this business profile:\n\n${businessProfile}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Return the response
    return res.status(200).json({ 
      success: true,
      data: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in API function:', error);
    return res.status(500).json({ 
      error: 'Failed to generate insights', 
      details: error.message 
    });
  }
}