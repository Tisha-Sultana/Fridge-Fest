
// src/ai/flows/generate-recipe-image.ts
'use server';

/**
 * @fileOverview Generates an image for a recipe.
 *
 * - generateRecipeImage - A function that generates an image for a recipe.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe.'),
  recipeDescription: z.string().describe('A brief description of the recipe.'),
});

export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

const GenerateRecipeImageOutputSchema = z.object({
  imageDataUri: z.string().describe("A data URI of the generated image of the recipe. Expected format: 'data:image/png;base64,<encoded_data>'."),
});

export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

export async function generateRecipeImage(
  input: GenerateRecipeImageInput
): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async ({ recipeTitle, recipeDescription }) => {
    // Add fallbacks and sanitize title and description for the prompt
    const titleForImage = (recipeTitle?.trim() || "a delicious looking dish")
      .replace(/\n+/g, ' ') // Replace newlines with a space
      .trim(); // Trim again in case of leading/trailing spaces from replacement

    let descriptionForImage = (recipeDescription?.trim() || "A beautifully prepared meal, ready to eat")
      .replace(/\n+/g, ' ') // Replace newlines with a space
      .trim(); // Trim again

    // Truncate description if it's too long to prevent overly complex prompts
    const MAX_DESC_LENGTH = 150;
    if (descriptionForImage.length > MAX_DESC_LENGTH) {
      descriptionForImage = descriptionForImage.substring(0, MAX_DESC_LENGTH - 3) + "...";
    }

    const promptString = `Photorealistic image of a cooked dish: ${titleForImage}. ${descriptionForImage}. Food photography style, well-lit.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: promptString,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Required for image generation
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }

    return { imageDataUri: media.url };
  }
);

