import { Navbar } from "@/components/Navbar";
import { StoryCard } from "@/components/StoryCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Users } from "lucide-react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchAPI } from "@/lib/api";

interface Story {
  _id: string;
  id: string;
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

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  followersCount: number;
  followingCount: number;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const navigate = useNavigate();

  // Debug: Log query parameter
  useEffect(() => {
    console.log("📋 Search query from URL:", query);
  }, [query]);
  const [activeTab, setActiveTab] = useState<"stories" | "users">("stories");
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [storiesCount, setStoriesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setStories([]);
        setUsers([]);
        setError(null);
        setStoriesCount(0);
        setUsersCount(0);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log("🔍 Searching for:", query);
        console.log("🔍 API Base URL:", import.meta.env.VITE_API_URL || 'http://localhost:5000');
        
        const [storiesData, usersData] = await Promise.all([
          searchAPI.searchStories(query).catch(err => {
            console.error("❌ Stories search error:", err);
            throw err;
          }),
          searchAPI.searchUsers(query).catch(err => {
            console.error("❌ Users search error:", err);
            throw err;
          }),
        ]);

        console.log("✅ Search results - Stories:", storiesData);
        console.log("✅ Search results - Users:", usersData);

        if (storiesData && storiesData.stories) {
          setStories(storiesData.stories);
          setStoriesCount(storiesData.count || storiesData.stories.length);
        } else {
          setStories([]);
          setStoriesCount(0);
        }

        if (usersData && usersData.users) {
          setUsers(usersData.users);
          setUsersCount(usersData.count || usersData.users.length);
        } else {
          setUsers([]);
          setUsersCount(0);
        }
      } catch (error: any) {
        console.error("❌ Error searching:", error);
        console.error("❌ Error response:", error.response);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error config:", error.config);
        
        const errorMessage = error.response?.data?.message || error.message || "Failed to search. Please check your connection and try again.";
        setError(errorMessage);
        setStories([]);
        setUsers([]);
        setStoriesCount(0);
        setUsersCount(0);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Search Results
            </h1>
          </div>
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search stories and users..."
                  className="pl-10 bg-secondary border-border focus:border-accent"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="px-6">
                Search
              </Button>
            </div>
          </form>

          {query && (
            <p className="text-muted-foreground">
              Results for: <span className="font-semibold text-foreground">"{query}"</span>
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "stories" | "users")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary mb-6 sm:mb-8">
            <TabsTrigger value="stories" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
              {storiesCount > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {storiesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
              {usersCount > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {usersCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Stories Results */}
          <TabsContent value="stories">
            {error && (
              <div className="mb-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : !query ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Enter a search query to find stories</p>
              </div>
            ) : stories.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No stories found</p>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Found {storiesCount} {storiesCount === 1 ? "story" : "stories"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <StoryCard
                      key={story._id || story.id}
                      id={story._id || story.id}
                      title={story.title}
                      excerpt={story.content.substring(0, 150) + "..."}
                      author={story.writer.username}
                      genre={story.genre}
                      likes={story.likes || 0}
                      isLiked={story.isLiked || false}
                      comments={story.comments || 0}
                      readTime={getReadTime(story.content)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Users Results */}
          <TabsContent value="users">
            {error && (
              <div className="mb-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : !query ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Enter a search query to find users</p>
              </div>
            ) : users.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No users found</p>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Found {usersCount} {usersCount === 1 ? "user" : "users"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      to={`/user/${user.username}`}
                      className="p-4 rounded-lg border border-border bg-card hover:border-accent/50 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-lg font-bold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{user.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{user.followersCount} followers</span>
                            <span>{user.followingCount} following</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

