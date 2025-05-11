import { ChefHat } from 'lucide-react';
import RecipeForm from '@/app/(components)/recipe-form';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <header className="w-full py-6 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto flex items-center justify-center gap-3 px-4">
          <ChefHat size={40} aria-label="Chef Hat Icon" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Fridge Feast</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 flex-grow w-full max-w-3xl">
        <RecipeForm />
      </main>
      <footer className="w-full py-4 text-center text-muted-foreground text-xs md:text-sm">
        <p>&copy; {new Date().getFullYear()} Fridge Feast. Spice up your meals!</p>
      </footer>
    </div>
  );
}
