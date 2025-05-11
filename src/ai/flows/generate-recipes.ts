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
      steps: z.array(z.string()).describe('An array of strings, where each string is a step in the recipe preparation.'),
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
- An ordered list of steps (as an array of strings) to prepare the recipe.

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

