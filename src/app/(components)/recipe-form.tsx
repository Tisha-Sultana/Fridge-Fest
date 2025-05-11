
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { ChefHat, Loader2, Sparkles, AlertTriangle, BookOpen, ImageIcon, HelpCircle, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateRecipes, type GenerateRecipesOutput } from '@/ai/flows/generate-recipes';
import { generateRecipeImage } from '@/ai/flows/generate-recipe-image';
import { suggestAlternateIngredient, type SuggestAlternateIngredientOutput } from '@/ai/flows/suggest-alternate-ingredient';


const formSchema = z.object({
  ingredients: z.string().min(3, { message: 'Please list at least one ingredient (e.g., "eggs").' })
  .max(500, {message: 'Ingredient list is too long. Please keep it under 500 characters.'}),
});

type FormValues = z.infer<typeof formSchema>;

type RecipeTextDetails = GenerateRecipesOutput['recipes'][0];
type RecipeUIData = RecipeTextDetails & {
  id: string; 
  imageDataUri?: string | null; 
  imageError?: boolean;
};


function RecipeCard({ recipe }: { recipe: RecipeUIData }) {
  const [ingredientToReplace, setIngredientToReplace] = useState('');
  const [alternateSuggestion, setAlternateSuggestion] = useState<SuggestAlternateIngredientOutput | null>(null);
  const [isSuggestingAlternate, setIsSuggestingAlternate] = useState(false);
  const [alternateSuggestionError, setAlternateSuggestionError] = useState<string | null>(null);

  const handleSuggestAlternate = async () => {
    if (!ingredientToReplace.trim()) {
      setAlternateSuggestionError("Please enter an ingredient to find a swap for.");
      return;
    }
    setIsSuggestingAlternate(true);
    setAlternateSuggestion(null);
    setAlternateSuggestionError(null);

    try {
      const result = await suggestAlternateIngredient({
        recipeTitle: recipe.title,
        recipeDescription: recipe.description,
        recipeSteps: recipe.steps,
        ingredientToReplace: ingredientToReplace.trim(),
      });
      setAlternateSuggestion(result);
    } catch (err) {
      console.error(`Error suggesting alternate ingredient for ${recipe.title}:`, err);
      setAlternateSuggestionError("Sorry, couldn't fetch a suggestion right now. Please try again.");
    } finally {
      setIsSuggestingAlternate(false);
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full bg-card rounded-lg overflow-hidden">
      <div className="relative w-full aspect-[16/9] bg-muted">
        {recipe.imageDataUri === null && !recipe.imageError && (
          <Skeleton className="h-full w-full rounded-t-lg" />
        )}
        {typeof recipe.imageDataUri === 'string' && !recipe.imageError && (
          <Image
            src={recipe.imageDataUri}
            alt={`Image of ${recipe.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {recipe.imageError && (
          <Image
            src={`https://picsum.photos/seed/${encodeURIComponent(recipe.title)}/400/300`}
            alt="Error placeholder image for recipe"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover rounded-t-lg"
            data-ai-hint="food plate"
          />
        )}
        {recipe.imageDataUri === undefined && !recipe.imageError && recipe.imageDataUri !== null && (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20 rounded-t-lg">
            <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> 
          {recipe.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>
        {recipe.steps && recipe.steps.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-semibold text-primary mb-2">Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`alternate-ingredient-${recipe.id}`}>
            <AccordionTrigger className="text-md font-semibold text-primary hover:no-underline">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Need an Ingredient Swap?
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              <div className="space-y-3">
                <Label htmlFor={`alternate-ingredient-input-${recipe.id}`} className="text-sm font-medium text-muted-foreground">
                  Which ingredient are you missing?
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id={`alternate-ingredient-input-${recipe.id}`}
                    value={ingredientToReplace}
                    onChange={(e) => setIngredientToReplace(e.target.value)}
                    placeholder="e.g., 'cumin powder'"
                    disabled={isSuggestingAlternate}
                    className="flex-grow text-sm"
                  />
                  <Button onClick={handleSuggestAlternate} disabled={isSuggestingAlternate} size="sm" className="whitespace-nowrap">
                    {isSuggestingAlternate ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Find Swap"
                    )}
                  </Button>
                </div>
                
                {alternateSuggestionError && (
                  <Alert variant="destructive" className="mt-2 text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Suggestion Error</AlertTitle>
                    <AlertDescription>{alternateSuggestionError}</AlertDescription>
                  </Alert>
                )}
                {alternateSuggestion && (
                  <Card className="mt-3 p-4 bg-secondary/30 shadow-none">
                    <CardContent className="p-0 text-sm space-y-1.5">
                       <div className="flex items-center gap-2 font-semibold">
                         <Lightbulb className="h-4 w-4 text-accent"/> 
                         <span>Suggestion:</span>
                       </div>
                      <p><strong>Original:</strong> {alternateSuggestion.originalIngredient}</p>
                      <p><strong>Try Using:</strong> <span className="font-medium text-primary">{alternateSuggestion.suggestedAlternative}</span></p>
                      {alternateSuggestion.notes && <p className="mt-1 italic text-muted-foreground"><strong>Note:</strong> {alternateSuggestion.notes}</p>}
                    </CardContent>
                  </Card>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </CardContent>
    </Card>
  );
}

export default function RecipeForm() {
  const [recipes, setRecipes] = useState<RecipeUIData[]>([]);
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
        const recipesWithImageState: RecipeUIData[] = result.recipes.map((recipe, index) => ({
          ...recipe,
          id: `${recipe.title.replace(/\s+/g, '-')}-${index}`, // More robust ID
          imageDataUri: null, 
          imageError: false,
        }));
        setRecipes(recipesWithImageState);

        recipesWithImageState.forEach(async (recipe) => {
          try {
            const imageResult = await generateRecipeImage({
              recipeTitle: recipe.title,
              recipeDescription: recipe.description,
            });
            setRecipes(prevRecipes =>
              prevRecipes.map(r =>
                r.id === recipe.id ? { ...r, imageDataUri: imageResult.imageDataUri, imageError: false } : r
              )
            );
          } catch (imgErr) {
            console.error(`Failed to generate image for ${recipe.title}:`, imgErr);
            setRecipes(prevRecipes =>
              prevRecipes.map(r =>
                r.id === recipe.id ? { ...r, imageDataUri: undefined, imageError: true } : r
              )
            );
          }
        });

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
              {isLoading && !recipes.length ? ( 
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
