exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages, contextTitle } = JSON.parse(event.body);
    const apiKey = process.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: { message: "API key not configured in Netlify." } }) };
    }

    // Automatically detect if it's a Gemini Key or OpenAI key
    const isGemini = apiKey.startsWith('AIzaSy');
    const endpoint = isGemini 
      ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const model = isGemini ? 'gemini-1.5-flash' : 'gpt-3.5-turbo';

    const systemPrompt = `You are an expert tutor helping a university student study "${contextTitle}". Be concise, encouraging, and extremely clear.`;
    
    // Ensure system prompt is the first message
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
