import { Navbar } from "@/components/Navbar";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Heart, Bookmark, PenSquare, Users, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { storyAPI, userAPI } from "@/lib/api";
import { Link } from "react-router-dom";

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

interface Follower {
  _id: string;
  username: string;
  name: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [likedStories, setLikedStories] = useState<Story[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedLoading, setLikedLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stories");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.username) return;
      
      try {
        setLoading(true);
        const [storiesData, profileData, followersData, followingData] = await Promise.all([
          storyAPI.getUserStories(),
          userAPI.getUserProfile(user.username),
          userAPI.getFollowers(user.username),
          userAPI.getFollowing(user.username),
        ]);

        setUserStories(storiesData.stories || []);
        setFollowersCount(profileData.user.followersCount || 0);
        setFollowingCount(profileData.user.followingCount || 0);
        setFollowers(followersData.followers || []);
        setFollowing(followingData.following || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.username]);

  // Fetch liked stories count on mount and when tab is active
  useEffect(() => {
    const fetchLikedStories = async () => {
      try {
        if (activeTab === 'liked') {
          setLikedLoading(true);
        }
        const data = await storyAPI.getLikedStories();
        setLikedStories(data.stories || []);
      } catch (error) {
        console.error('Error fetching liked stories:', error);
      } finally {
        setLikedLoading(false);
      }
    };

    fetchLikedStories();
  }, [activeTab]);

  // Fetch saved stories count on mount and when tab is active
  useEffect(() => {
    const fetchSavedStories = async () => {
      try {
        if (activeTab === 'bookmarked') {
          setSavedLoading(true);
        }
        const data = await storyAPI.getSavedStories();
        setSavedStories(data.stories || []);
      } catch (error) {
        console.error('Error fetching saved stories:', error);
      } finally {
        setSavedLoading(false);
      }
    };

    fetchSavedStories();
  }, [activeTab]);


  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Profile Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary shadow-glow flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-3xl sm:text-4xl font-bold">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold truncate">{user?.name || 'User'}</h1>
                <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl break-words">
                @{user?.username || 'username'} · Storyteller on EerieVerse
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8 text-sm">
                <div>
                  <span className="font-bold text-xl sm:text-2xl text-primary">{userStories.length}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Stories</p>
                </div>
                <button
                  onClick={() => setFollowersDialogOpen(true)}
                  className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="font-bold text-xl sm:text-2xl text-primary">{followersCount}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Followers</p>
                </button>
                <button
                  onClick={() => setFollowingDialogOpen(true)}
                  className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="font-bold text-xl sm:text-2xl text-primary">{followingCount}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Following</p>
                </button>
                <div>
                  <span className="font-bold text-xl sm:text-2xl text-primary">{likedStories.length}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Liked</p>
                </div>
                <div>
                  <span className="font-bold text-xl sm:text-2xl text-primary">{savedStories.length}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Saved</p>
                </div>
                <div>
                  <span className="font-bold text-xl sm:text-2xl text-primary">
                    {userStories.reduce((sum, story) => sum + (story.likes || 0), 0)}
                  </span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Total Likes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary mb-6 sm:mb-8">
            <TabsTrigger value="stories" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <PenSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Liked</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">My Stories</h2>
              <p className="text-muted-foreground">Tales I've written and shared</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : userStories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stories yet. Start writing your first tale!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStories.map((story) => (
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
          </TabsContent>

          <TabsContent value="liked">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Liked Stories</h2>
              <p className="text-muted-foreground">Stories that captured my dark heart</p>
            </div>
            {likedLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : likedStories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No liked stories yet.</p>
                <p className="text-sm text-muted-foreground">Start exploring and like stories you enjoy!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedStories.map((story) => (
                  <StoryCard
                    key={story._id || story.id}
                    id={story._id || story.id}
                    title={story.title}
                    excerpt={story.content.substring(0, 150) + '...'}
                    author={story.writer.username}
                    genre={story.genre}
                    likes={story.likes || 0}
                    isLiked={story.isLiked || true}
                    comments={story.comments || 0}
                    readTime={getReadTime(story.content)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">Saved Stories</h2>
              <p className="text-muted-foreground">Stories to revisit in the dead of night</p>
            </div>
            {savedLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : savedStories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No saved stories yet.</p>
                <p className="text-sm text-muted-foreground">Click the bookmark icon on stories to save them for later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStories.map((story) => (
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Followers Dialog */}
      <Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {followers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No followers yet</p>
            ) : (
              <div className="space-y-4">
                {followers.map((follower) => (
                  <Link
                    key={follower._id}
                    to={`/user/${follower.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setFollowersDialogOpen(false)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(follower.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{follower.name}</p>
                      <p className="text-sm text-muted-foreground">@{follower.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {following.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Not following anyone yet</p>
            ) : (
              <div className="space-y-4">
                {following.map((followed) => (
                  <Link
                    key={followed._id}
                    to={`/user/${followed.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setFollowingDialogOpen(false)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(followed.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{followed.name}</p>
                      <p className="text-sm text-muted-foreground">@{followed.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
