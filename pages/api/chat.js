export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, contextStr } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const SYSTEM_PROMPT = `Você é o Assistente CMV do curso "CMV na Prática" de Wagner Barreto — WTL · Sushi Life.

Você domina os temas ensinados no curso e ajuda donos e gestores de restaurante a aplicar o que aprenderam no próprio negócio.

TEMAS QUE VOCÊ DOMINA:

1. CMV = Estoque Inicial + Compras − Estoque Final. % CMV = CMV ÷ Faturamento.

2. CMV teórico × real — a diferença é o vazamento (desperdício, porção sem padrão, roubo, quebra).

3. Desperdício do salmão: benchmark 25% de perda (cabeça+espinhaço) do peixe inteiro limpo.

4. Custo real do kg usável: preço ÷ aproveitamento. Ex: R$47 ÷ 0,75 = R$62,67/kg.

5. Cozido × empanado: cozido perde rendimento, empanado ganha. Forma de preparo = alavanca de margem.

6. Balanço semanal: 4 contagens por mês fecham o CMV real sem maquiagem.

7. Bonificação por CMV: escada de 3 degraus para liderança. Regras anti-maquiagem.

8. Curva A: 80% do faturamento vem de 20% dos pratos.

9. Gap teórico × real = onde atacar.

10. 5 alavancas: Cotação, Desperdício, Ficha técnica, Estoque semanal, Estoque trancado.

Responda direto ao ponto, linguagem de dono pra dono. Use os dados do restaurante fornecidos para personalizar. Faça cálculos concretos. Português brasileiro, tom informal.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "DEBUG: ANTHROPIC_API_KEY nao encontrada nas env vars" });
  }

  try {
    const apiMessages = messages.map((m, i) => ({
      role: m.role,
      content: i === 0 && contextStr ? m.content + contextStr : m.content,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
              model: "claude-3-haiku-20240307",
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(200).json({ reply: "ERRO DEBUG: status=" + response.status + " body=" + responseText });
    }

    const data = JSON.parse(responseText);
    const reply = data?.content?.[0]?.text || "Erro ao gerar resposta.";
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(200).json({ reply: "ERRO DEBUG catch: " + error.message });
  }
}
