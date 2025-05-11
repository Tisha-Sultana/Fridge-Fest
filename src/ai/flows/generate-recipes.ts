// use server'
'use server';

/**
 * @fileOverview Recipe suggestion flow based on available ingredients.
 *
 * - generateRecipes - A function that generates recipe suggestions based on ingredients.
 * - GenerateRecipesInput - The input type for the generateRecipes function.
 * - GenerateRecipesOutput - The return type for the generateRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipesInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available for the recipe.'),
});
export type GenerateRecipesInput = z.infer<typeof GenerateRecipesInputSchema>;

const GenerateRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string().describe('The title of the recipe.'),
      description: z.string().describe('A brief description of the recipe.'),
      steps: z.array(z.string()).describe('An array of strings, where each string is a detailed step in the recipe preparation. Each step should be clear, concise, and easy to follow, including measurements where appropriate, cooking times, and temperatures if applicable. For example: "1. Preheat oven to 350°F (175°C). 2. Dice 1 medium onion and 2 cloves of garlic."'),
    })
  ).
  describe('An array of suggested recipes.'),
});
export type GenerateRecipesOutput = z.infer<typeof GenerateRecipesOutputSchema>;

export async function generateRecipes(input: GenerateRecipesInput): Promise<GenerateRecipesOutput> {
  return generateRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipesPrompt',
  input: {schema: GenerateRecipesInputSchema},
  output: {schema: GenerateRecipesOutputSchema},
  prompt: `You are a recipe suggestion AI. Given the following ingredients, suggest a few recipes that can be made.

Ingredients: {{{ingredients}}}

For each recipe, provide:
- A title.
- A brief description.
- An ordered list of **detailed** steps (as an array of strings) to prepare the recipe. Each step should be very specific, including measurements, cooking times, and temperatures where applicable. For example, instead of "Cook chicken", say "Pan-fry 1 lb of chicken breast, cut into 1-inch cubes, over medium-high heat for 5-7 minutes until golden brown and cooked through."

Output in JSON format.`,
});

const generateRecipesFlow = ai.defineFlow(
  {
    name: 'generateRecipesFlow',
    inputSchema: GenerateRecipesInputSchema,
    outputSchema: GenerateRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
