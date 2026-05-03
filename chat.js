export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing or invalid message' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY environment variable' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-3.5-mini',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const body = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: 'Anthropic API error', details: body });
      return;
    }

    const reply = body?.completion || body?.choices?.[0]?.message?.content || '';
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
