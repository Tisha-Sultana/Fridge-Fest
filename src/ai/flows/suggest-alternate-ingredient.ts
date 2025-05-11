// src/ai/flows/suggest-alternate-ingredient.ts
'use server';

/**
 * @fileOverview Suggests an alternative for a given ingredient within the context of a specific recipe.
 *
 * - suggestAlternateIngredient - A function that suggests an alternative ingredient.
 * - SuggestAlternateIngredientInput - The input type for the suggestAlternateIngredient function.
 * - SuggestAlternateIngredientOutput - The return type for the suggestAlternateIngredient function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternateIngredientInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe.'),
  recipeDescription: z
    .string()
    .describe(
      'The description of the recipe, which includes context about its key flavors and ingredients.'
    ),
  recipeSteps: z
    .array(z.string())
    .describe('The preparation steps for the recipe.'),
  ingredientToReplace: z
    .string()
    .describe(
      'The specific ingredient the user wants an alternative for (e.g., "cumin", "coriander powder").'
    ),
});

export type SuggestAlternateIngredientInput = z.infer<typeof SuggestAlternateIngredientInputSchema>;

const SuggestAlternateIngredientOutputSchema = z.object({
  originalIngredient: z.string().describe('The ingredient that was asked to be replaced.'),
  suggestedAlternative: z
    .string()
    .describe(
      'The suggested alternative ingredient, including quantity if relevant (e.g., "1/2 tsp paprika").'
    ),
  notes: z.string().optional().describe('Additional notes, such as impact on flavor, preparation, or if it is not recommended to substitute. For example: "This will make the dish slightly sweeter." or "It is best not to substitute this ingredient."'),
});

export type SuggestAlternateIngredientOutput = z.infer<typeof SuggestAlternateIngredientOutputSchema>;

export async function suggestAlternateIngredient(
  input: SuggestAlternateIngredientInput
): Promise<SuggestAlternateIngredientOutput> {
  return suggestAlternateIngredientFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternateIngredientPrompt',
  input: {schema: SuggestAlternateIngredientInputSchema},
  output: {schema: SuggestAlternateIngredientOutputSchema},
  prompt: `You are an expert chef providing cooking advice. A user is making a recipe and needs an alternative for a specific ingredient.

Recipe Details:
Title: {{{recipeTitle}}}
Description: {{{recipeDescription}}}
Steps:
{{#each recipeSteps}}
- {{{this}}}
{{/each}}

Ingredient to Replace: "{{{ingredientToReplace}}}"

Your task is to suggest a suitable alternative. Your response should:
1. Identify the 'originalIngredient' as "{{{ingredientToReplace}}}".
2. Provide a 'suggestedAlternative'. This should be a common and reasonable substitute. Include quantity if it's different or important (e.g., "1/2 tsp of paprika instead of 1 tsp of chili powder"). If no direct quantity conversion is possible, provide the alternative ingredient name.
3. In 'notes', briefly explain any significant impact on flavor or texture, any necessary preparation for the alternative, or if it's generally not advisable to substitute the ingredient. If no good alternative exists, explain why.

Example for 'notes': "Using maple syrup instead of honey will give a slightly different sweetness and a hint of maple flavor." or "Turmeric can be used for color, but won't replicate the smoky flavor of paprika." or "It's difficult to find a direct substitute for saffron's unique flavor and aroma."

Output in the specified JSON format.`,
});

const suggestAlternateIngredientFlow = ai.defineFlow(
  {
    name: 'suggestAlternateIngredientFlow',
    inputSchema: SuggestAlternateIngredientInputSchema,
    outputSchema: SuggestAlternateIngredientOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
