import OpenAI from 'openai';
import { logger } from '../../utils/logger.js';

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey: apiKey
  });
  logger.info('OpenAI client initialized');
}

export interface GeneratedBrief {
  companyName: string;
  companyDescription: string;
  jobDescription: string;
  deadline: string;
}

const briefPrompts = {
  fr: `Tu es un directeur créatif qui génère des briefs professionnels pour des projets de design.
Crée un brief fictif mais réaliste pour une entreprise qui a besoin de services créatifs.

IMPORTANT: Utilise du markdown léger dans les descriptions pour mettre en valeur les informations clés:
- Utilise **gras** pour les éléments importants (nom du produit, couleurs, style)
- N'utilise PAS de listes à puces dans les descriptions
- Reste naturel dans la rédaction

Format de réponse JSON strictement en français:
{
  "companyName": "Nom de l'entreprise (inventé, créatif)",
  "companyDescription": "Description de l'entreprise incluant : ce qu'ils vendent/font, pourquoi leur produit se distingue, leur audience cible, et l'ambiance qu'ils veulent transmettre (3-4 phrases). Utilise **gras** pour les mots clés importants.",
  "jobDescription": "Description détaillée du travail à réaliser incluant : le type de création demandée (logo, packaging, affiche, site web, etc.), le style souhaité, les couleurs de la marque, et toute préférence spécifique du client (3-4 phrases). Utilise **gras** pour les éléments critiques.",
  "deadline": "Nombre de jours (entre 2 et 10 jours)"
}

Varie les secteurs : tech, alimentaire, mode, sport, culture, éducation, santé, etc.
Varie les types de projets : identité visuelle, packaging, affiche, site web, application mobile, illustration, animation, etc.
Sois créatif avec les noms d'entreprises et leurs histoires.`,

  en: `You are a creative art director for a community of creatives.
Generate a stimulating and original creative brief for a project.
The brief should be detailed but accessible, inspiring and achievable within the given time.

JSON response format:
{
  "title": "Catchy brief title",
  "description": "Detailed project description (2-3 sentences)",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "constraints": ["Constraint 1", "Constraint 2"]
}

Vary project types: graphic design, illustration, photography, animation, 3D design, typography, etc.
Be creative and propose interesting challenges that encourage experimentation.`
};

export async function generateBrief(language: 'fr' | 'en' = 'fr'): Promise<GeneratedBrief> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized');
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: briefPrompts[language]
        },
        {
          role: 'user',
          content: 'Génère un nouveau brief créatif.'
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const brief = JSON.parse(response) as GeneratedBrief;
    logger.info('Brief generated successfully');
    
    return brief;
  } catch (error) {
    logger.error('Error generating brief:', error);
    
    // Fallback brief in case of error
    const fallbackBriefs = [
      {
        companyName: "Café Nuage",
        companyDescription: "Nous sommes un petit café artisanal qui torréfie son propre café. Notre produit se distingue par sa **qualité supérieure** et son processus de torréfaction unique. Notre audience cible est les **amateurs de café exigeants**. Nous voulons transmettre une ambiance **chaleureuse et authentique**.",
        jobDescription: "Vous devez créer un nouveau **packaging** pour notre café signature. Nous voulons un design **minimaliste** qui met en valeur l'artisanat. Utilisez des **tons terre** et notre couleur principale qui est le **marron foncé**. Assurez-vous que le nom du produit soit bien visible.",
        deadline: "5 jours"
      },
      {
        companyName: "TechVert",
        companyDescription: "Nous sommes une startup qui développe des **solutions technologiques écologiques**. Notre produit principal est une application de suivi carbone. Notre audience cible est les **entreprises soucieuses de l'environnement**. Nous voulons transmettre **innovation et responsabilité**.",
        jobDescription: "Créez une **affiche promotionnelle** pour notre nouvelle application. Le design doit être **moderne et épuré** avec des éléments naturels. Utilisez du **vert et du blanc** comme couleurs principales. Incluez notre slogan et des visuels représentant la technologie et la nature.",
        deadline: "7 jours"
      },
      {
        companyName: "Atelier Lumière",
        companyDescription: "Nous sommes un studio de design d'intérieur spécialisé dans **l'éclairage**. Nos créations se distinguent par leur **élégance et leur fonctionnalité**. Notre clientèle est **haut de gamme**. Nous voulons véhiculer **luxe et innovation**.",
        jobDescription: "Concevez une nouvelle **identité visuelle complète** pour notre studio. Nous recherchons un style **sophistiqué et contemporain**. Les couleurs doivent évoquer la lumière : **or, blanc, et noir**. Le logo doit être **adaptable** à différents supports.",
        deadline: "10 jours"
      }
    ];
    
    return fallbackBriefs[Math.floor(Math.random() * fallbackBriefs.length)];
  }
}