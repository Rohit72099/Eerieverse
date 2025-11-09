import { Navbar } from "@/components/Navbar";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { useEffect, useState } from "react";
import { storyAPI } from "@/lib/api";

interface Story {
  id: string;
  _id: string;
  title: string;
  content: string;
  genre: string;
  writer: {
    username: string;
  };
  likes: number;
  isLiked?: boolean;
  comments: number;
  createdAt: string;
}

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await storyAPI.getAllStories();
        const fetchedStories = data.stories || [];
        setAllStories(fetchedStories);
        setStories(fetchedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Filter stories based on selected genre
  useEffect(() => {
    if (selectedGenre === "All") {
      setStories(allStories);
    } else {
      const filtered = allStories.filter(story => 
        story.genre.toLowerCase() === selectedGenre.toLowerCase()
      );
      setStories(filtered);
    }
  }, [selectedGenre, allStories]);

  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Get unique genres from all stories
  const getAvailableGenres = () => {
    const genres = new Set(allStories.map(story => story.genre));
    return Array.from(genres).sort();
  };

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] overflow-hidden border-b border-border">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        
        <div className="container relative mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-shadow-glow animate-fade-in px-4">
            Share Your Dark Tales
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl animate-fade-in px-4">
            A community for horror, thriller, and dark fantasy storytellers
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity animate-pulse-glow text-sm sm:text-base"
            asChild
          >
            <Link to="/create">
              <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Writing
            </Link>
          </Button>
        </div>
      </section>

      {/* Stories Feed */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2">
              {selectedGenre === "All" ? "Latest Stories" : `${selectedGenre} Stories`}
            </h2>
            <p className="text-muted-foreground">
              {selectedGenre === "All" 
                ? "Discover the darkest tales from our community" 
                : `Explore ${selectedGenre.toLowerCase()} stories`}
            </p>
          </div>
          
          {/* Genre Filter Pills */}
          <div className="hidden md:flex gap-2 flex-wrap">
            <Button
              key="All"
              variant={selectedGenre === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => handleGenreFilter("All")}
              className={selectedGenre === "All" ? "bg-primary" : "border-border hover:border-accent hover:bg-accent/10"}
            >
              All
            </Button>
            {getAvailableGenres().map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenreFilter(genre)}
                className={selectedGenre === genre ? "bg-primary" : "border-border hover:border-accent hover:bg-accent/10"}
              >
                {genre}
              </Button>
            ))}
          </div>
          
          {/* Mobile Genre Filter */}
          <div className="md:hidden mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                key="All"
                variant={selectedGenre === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenreFilter("All")}
                className={selectedGenre === "All" ? "bg-primary" : "border-border hover:border-accent"}
              >
                All
              </Button>
              {getAvailableGenres().map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenreFilter(genre)}
                  className={selectedGenre === genre ? "bg-primary" : "border-border hover:border-accent"}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Story Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {selectedGenre === "All" 
                ? "No stories yet. Be the first to share your tale!" 
                : `No ${selectedGenre} stories found. Try another genre or share your own ${selectedGenre} tale!`}
            </p>
            <Button asChild>
              <Link to="/create">Write the First Story</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {stories.map((story) => (
              <StoryCard
                key={story._id || story.id}
                id={story._id || story.id}
                title={story.title}
                excerpt={story.content.substring(0, 150) + '...'}
                author={story.writer.username}
                genre={story.genre}
                likes={story.likes || 0}
                isLiked={story.isLiked || false}
                comments={story.comments || 0}
                readTime={getReadTime(story.content)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button for Mobile */}
      <Link to="/create">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 md:hidden rounded-full h-14 w-14 p-0 shadow-glow animate-pulse-glow bg-gradient-to-r from-primary to-accent"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
