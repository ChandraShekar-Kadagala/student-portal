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
    
    const systemPrompt = `You are an expert tutor helping a university student study "${contextTitle}". Be concise, encouraging, and extremely clear.`;

    let response;
    let data;

    if (isGemini) {
      // Use Native Gemini REST API
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      // Convert OpenAI messages format to Gemini format
      const geminiContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Prepend system instructions as a user prompt (or use systemInstruction if supported)
      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: geminiContents
      };

      response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      data = await response.json();

      if (data.error) {
        return { statusCode: 500, body: JSON.stringify({ error: { message: data.error.message } }) };
      }

      // Convert Gemini response back to OpenAI format so frontend doesn't break
      const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiContent) {
        return { statusCode: 500, body: JSON.stringify({ error: { message: "Invalid response from Gemini API" } }) };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choices: [{ message: { content: aiContent } }]
        })
      };

    } else {
      // Use OpenAI API
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: formattedMessages
        })
      });

      data = await response.json();

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
