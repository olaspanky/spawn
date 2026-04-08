"use client";
import { useState, useEffect } from "react";
import { marketPrices } from "../../lib/mp";

const priceCategories = ["All", ...Array.from(new Set(marketPrices.map((i) => i.category)))];

interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions?: string;
  strYoutube?: string;
}

export default function PriceBoard() {
  const [activeTab, setActiveTab] = useState<"prices" | "recipes">("prices");
  const [activePriceCat, setActivePriceCat] = useState("All");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Price filtering
  const filteredPrices =
    activePriceCat === "All"
      ? marketPrices
      : marketPrices.filter((i) => i.category === activePriceCat);

  // Fetch recipes
  const fetchRecipes = async (query: string = "chicken") => {
    setLoading(true);
    setError("");
    try {
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      setRecipes(data.meals || []);
    } catch (err) {
      setError("Failed to load recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "recipes" && recipes.length === 0) {
      fetchRecipes();
    }
  }, [activeTab]);

  const filteredRecipes = recipes.filter((r) =>
    r.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="prices" className="py-20 px-4 bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-full mb-4">
            LOCAL MARKET + RECIPES
          </span>
          <h2 className="text-5xl font-bold tracking-tighter">Market Prices &amp; Recipes</h2>
          <p className="text-zinc-400 mt-3 text-lg">
            Fresh LOCAL rates • Delicious recipes using local ingredients
          </p>
        </div>

        {/* Sleek Tab Switcher (Netflix-style) */}
        <div className="flex justify-center mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 flex">
            <button
              onClick={() => setActiveTab("prices")}
              className={`px-10 py-3.5 rounded-xl font-semibold transition-all text-base ${
                activeTab === "prices"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Market Prices
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`px-10 py-3.5 rounded-xl font-semibold transition-all text-base ${
                activeTab === "recipes"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Recipe Ideas
            </button>
          </div>
        </div>

        {/* ====================== PRICES TAB ====================== */}
        {activeTab === "prices" && (
          <>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {priceCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivePriceCat(cat)}
                  className={`px-7 py-2.5 rounded-2xl text-sm font-medium transition-all border ${
                    activePriceCat === cat
                      ? "bg-emerald-500 text-black border-emerald-500 font-semibold"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price Cards - Modern & Clean */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPrices.map((item, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/50 group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                >
                  <div className="text-6xl mb-8 transition-transform group-hover:scale-110 duration-300">
                    {item.emoji}
                  </div>

                  <div className="mt-auto">
                    <h3 className="font-semibold text-xl text-white leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-emerald-400 text-3xl font-bold tracking-tighter">
                      ₦{item.price.toLocaleString()}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">{item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ====================== RECIPES TAB ====================== */}
        {activeTab === "recipes" && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <input
                type="text"
                placeholder="Search recipes... (e.g. jollof, egusi, suya)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRecipes(searchTerm)}
                className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-2xl px-6 py-4 text-lg placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => fetchRecipes(searchTerm || "chicken")}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 px-10 rounded-2xl font-semibold text-black transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {error && <p className="text-red-400 text-center py-8">{error}</p>}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-400 mt-6">Finding tasty recipes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.idMeal}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group hover:border-emerald-500/60 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="relative h-56">
                        <img
                          src={recipe.strMealThumb}
                          alt={recipe.strMeal}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-black/70 text-xs px-3 py-1 rounded-full">
                          {recipe.strArea}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white mb-2">
                          {recipe.strMeal}
                        </h3>
                        <p className="text-emerald-400 text-sm">{recipe.strCategory}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-zinc-400 py-16 text-lg">
                    No recipes found. Try another keyword.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <p className="text-center text-zinc-500 text-xs mt-16">
          Prices are estimates • Recipes powered by TheMealDB
        </p>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-zinc-900 max-w-2xl w-full rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedRecipe.strMealThumb}
              alt={selectedRecipe.strMeal}
              className="w-full h-80 object-cover"
            />

            <div className="p-8">
              <h2 className="text-3xl font-bold mb-2">{selectedRecipe.strMeal}</h2>
              <p className="text-emerald-400 mb-8">
                {selectedRecipe.strCategory} • {selectedRecipe.strArea}
              </p>

              <div className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {selectedRecipe.strInstructions}
              </div>

              {selectedRecipe.strYoutube && (
                <a
                  href={selectedRecipe.strYoutube}
                  target="_blank"
                  className="mt-8 inline-block text-emerald-400 hover:underline"
                >
                  Watch cooking video on YouTube →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}