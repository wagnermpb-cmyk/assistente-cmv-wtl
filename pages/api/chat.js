export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "ERRO: ANTHROPIC_API_KEY nao configurada." });
  }

  // Test: list models available
  try {
    const testResponse = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        "x-api-key": apiKey.trim(),
        "anthropic-version": "2023-06-01",
      },
    });
    const testText = await testResponse.text();
    return res.status(200).json({ 
      reply: "KEY_TEST: status=" + testResponse.status + " keyprefix=" + apiKey.trim().substring(0,20) + "... models=" + testText.substring(0, 300)
    });
  } catch (error) {
    return res.status(200).json({ reply: "KEY_TEST_ERROR: " + error.message });
  }
}
