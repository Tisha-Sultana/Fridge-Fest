"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { ChefHat, Loader2, Sparkles, AlertTriangle, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateRecipes, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';

const formSchema = z.object({
  ingredients: z.string().min(3, { message: 'Please list at least one ingredient (e.g., "eggs").' })
  .max(500, {message: 'Ingredient list is too long. Please keep it under 500 characters.'}),
});

type FormValues = z.infer<typeof formSchema>;
type Recipe = GenerateRecipesOutput['recipes'][0];

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-card rounded-lg overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> 
          {recipe.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>
        {recipe.steps && recipe.steps.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-primary mb-2">Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {/* Footer can be used for additional info like prep time or servings if available in future */}
      </CardFooter>
    </Card>
  );
}

export default function RecipeForm() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setNoResults(false);

    try {
      const result = await generateRecipes({ ingredients: data.ingredients });
      if (result.recipes && result.recipes.length > 0) {
        setRecipes(result.recipes);
      } else {
        setNoResults(true);
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred while generating recipes. Please check your connection or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-secondary/50 p-6">
          <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl text-primary">
            <Sparkles className="h-7 w-7 text-accent" />
            What's In Your Fridge?
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            List your ingredients (e.g., chicken, broccoli, soy sauce) and let AI find tasty recipes for you!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="ingredients" className="text-lg font-medium">Your Ingredients</Label>
              <Textarea
                id="ingredients"
                placeholder="Enter ingredients separated by commas..."
                {...form.register('ingredients')}
                className="mt-2 min-h-[120px] text-base p-3 rounded-md focus:ring-accent focus:border-accent"
                rows={4}
                aria-label="Ingredients input field"
              />
              {form.formState.errors.ingredients && (
                <p className="text-sm text-destructive mt-1.5">{form.formState.errors.ingredients.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 rounded-md font-semibold transition-colors duration-200">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Discovering Recipes...
                </>
              ) : (
                'Find My Feast!'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error Generating Recipes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {noResults && !isLoading && (
        <Card className="shadow-md rounded-lg text-center p-6">
          <CardContent className="p-0">
            <ChefHat className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <CardTitle className="text-xl text-muted-foreground">No Recipes Found</CardTitle>
            <p className="text-muted-foreground mt-2">
              We couldn't find any recipes with those ingredients. Try different or more ingredients.
            </p>
          </CardContent>
        </Card>
      )}
      
      {recipes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-primary">Your Recipe Suggestions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6"> {/* Adjusted grid for potentially longer cards */}
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.title + index} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
