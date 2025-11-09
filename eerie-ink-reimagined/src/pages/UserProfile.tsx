import { Navbar } from "@/components/Navbar";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, UserMinus, Users, UserCheck, PenSquare } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { userAPI, storyAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
}

interface Follower {
  _id: string;
  username: string;
  name: string;
}

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

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stories");
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        const [profileData, storiesData, followersData, followingData] = await Promise.all([
          userAPI.getUserProfile(username),
          userAPI.getUserStories(username),
          userAPI.getFollowers(username),
          userAPI.getFollowing(username),
        ]);

        setProfileUser(profileData.user);
        setUserStories(storiesData.stories || []);
        setFollowers(followersData.followers || []);
        setFollowing(followingData.following || []);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 404) {
          toast({
            title: "User not found",
            description: "The user you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate, toast]);

  const handleFollow = async () => {
    if (!profileUser) return;

    try {
      setFollowLoading(true);
      if (profileUser.isFollowing) {
        await userAPI.unfollowUser(profileUser.id);
        setProfileUser({ ...profileUser, isFollowing: false, followersCount: profileUser.followersCount - 1 });
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profileUser.name}`,
        });
      } else {
        await userAPI.followUser(profileUser.id);
        setProfileUser({ ...profileUser, isFollowing: true, followersCount: profileUser.followersCount + 1 });
        toast({
          title: "Following",
          description: `You are now following ${profileUser.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

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
                {getInitials(profileUser.name)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold truncate">{profileUser.name}</h1>
                {!isOwnProfile && (
                  <Button
                    variant={profileUser.isFollowing ? "outline" : "default"}
                    size="sm"
                    className="gap-2 flex-shrink-0"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {profileUser.isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        <span className="hidden sm:inline">Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Follow</span>
                      </>
                    )}
                  </Button>
                )}
                {isOwnProfile && (
                  <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                    <Link to="/profile">
                      <span className="hidden sm:inline">View My Profile</span>
                      <span className="sm:hidden">My Profile</span>
                    </Link>
                  </Button>
                )}
              </div>

              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl break-words">
                @{profileUser.username} · {profileUser.role} on EerieVerse
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
                  <span className="font-bold text-xl sm:text-2xl text-primary">{profileUser.followersCount}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Followers</p>
                </button>
                <button
                  onClick={() => setFollowingDialogOpen(true)}
                  className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="font-bold text-xl sm:text-2xl text-primary">{profileUser.followingCount}</span>
                  <p className="text-muted-foreground text-xs sm:text-sm">Following</p>
                </button>
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
          <TabsList className="grid w-full max-w-md grid-cols-1 bg-secondary mb-8">
            <TabsTrigger value="stories" className="gap-2">
              <PenSquare className="h-4 w-4" />
              Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold mb-2">{profileUser.name}'s Stories</h2>
              <p className="text-muted-foreground">Published tales by this storyteller</p>
            </div>
            {userStories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stories published yet.</p>
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

