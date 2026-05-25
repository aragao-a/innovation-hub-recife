'use server'

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface AIInput {
  title: string
  area: string
  keywords: string
  technical_description: string
}

interface AIResult {
  simplified_description: string
  ods_suggestions: number[]
  error?: string
}

export async function generateResearchSummary(input: AIInput): Promise<AIResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      simplified_description: '',
      ods_suggestions: [],
      error: 'ANTHROPIC_API_KEY não configurada no .env.local',
    }
  }

  const prompt = `Você é um assistente especializado em comunicação científica para o Hub de Inovação e Pesquisa do Recife.

Analise a pesquisa abaixo e faça duas coisas:

1. Escreva um resumo acessível (máximo 3 parágrafos) em linguagem clara e sem jargões técnicos, voltado para empresários e gestores públicos. Destaque o problema que a pesquisa resolve e seu potencial de aplicação prática.

2. Sugira quais dos 17 ODS (Objetivos de Desenvolvimento Sustentável da ONU) essa pesquisa está relacionada. Retorne apenas os números dos ODS relevantes.

---
TÍTULO: ${input.title}
ÁREA: ${input.area}
PALAVRAS-CHAVE: ${input.keywords}
DESCRIÇÃO TÉCNICA:
${input.technical_description}
---

Responda SOMENTE em JSON com este formato exato (sem markdown, sem \`\`\`):
{
  "simplified_description": "resumo acessível aqui",
  "ods_suggestions": [3, 9, 11]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)

    return {
      simplified_description: parsed.simplified_description || '',
      ods_suggestions: Array.isArray(parsed.ods_suggestions) ? parsed.ods_suggestions : [],
    }
  } catch (err) {
    console.error('AI generation error:', err)
    return {
      simplified_description: '',
      ods_suggestions: [],
      error: 'Falha ao gerar resumo com IA. Verifique sua chave API ou tente novamente.',
    }
  }
}
