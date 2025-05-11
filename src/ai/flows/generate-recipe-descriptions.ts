// src/ai/flows/generate-recipe-descriptions.ts
'use server';

/**
 * @fileOverview Generates a brief description of a recipe based on its title and ingredients.
 *
 * - generateRecipeDescription - A function that generates a recipe description.
 * - GenerateRecipeDescriptionInput - The input type for the generateRecipeDescription function.
 * - GenerateRecipeDescriptionOutput - The return type for the generateRecipeDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeDescriptionInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe.'),
  ingredients: z.string().describe('A comma-separated list of ingredients used in the recipe.'),
});

export type GenerateRecipeDescriptionInput = z.infer<typeof GenerateRecipeDescriptionInputSchema>;

const GenerateRecipeDescriptionOutputSchema = z.object({
  description: z.string().describe('A brief description of the recipe.'),
});

export type GenerateRecipeDescriptionOutput = z.infer<typeof GenerateRecipeDescriptionOutputSchema>;

export async function generateRecipeDescription(
  input: GenerateRecipeDescriptionInput
): Promise<GenerateRecipeDescriptionOutput> {
  return generateRecipeDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeDescriptionPrompt',
  input: {schema: GenerateRecipeDescriptionInputSchema},
  output: {schema: GenerateRecipeDescriptionOutputSchema},
  prompt: `You are a recipe expert. Generate a brief, engaging description for the following recipe, highlighting its key flavors and ingredients.\n\nRecipe Title: {{{recipeTitle}}}\nIngredients: {{{ingredients}}}\n\nDescription:`,
});

const generateRecipeDescriptionFlow = ai.defineFlow(
  {
    name: 'generateRecipeDescriptionFlow',
    inputSchema: GenerateRecipeDescriptionInputSchema,
    outputSchema: GenerateRecipeDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
