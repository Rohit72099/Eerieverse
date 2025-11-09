import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, ArrowLeft, Bookmark, ThumbsUp, ThumbsDown, UserPlus, UserMinus } from "lucide-react";
import { useState, useEffect } from "react";
import { storyAPI, commentAPI, userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  writer: {
    username: string;
    name?: string;
    email?: string;
  };
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    name?: string;
  };
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  createdAt: string;
}

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await storyAPI.getStoryById(id);
        setStory(data.story);
        setIsLiked(data.story.isLiked || false);
        setLikeCount(data.story.likes || 0);
        setCommentCount(data.story.comments || 0);
        setIsSaved(data.story.isSaved || false);
        
        // Fetch author profile to get follow status and author ID
        if (data.story.writer?.username) {
          try {
            const profileData = await userAPI.getUserProfile(data.story.writer.username);
            setAuthorId(profileData.user.id);
            if (user) {
              setIsFollowingAuthor(profileData.user.isFollowing || false);
            }
          } catch (error) {
            console.error('Error fetching author profile:', error);
          }
        }
      } catch (error: any) {
        console.error('Error fetching story:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load story",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, toast, user]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      try {
        setCommentsLoading(true);
        const data = await commentAPI.getStoryComments(id);
        setComments(data.comments || []);
      } catch (error: any) {
        console.error('Error fetching comments:', error);
        // Don't show error toast for comments, just log it
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like stories",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    try {
      if (isLiked) {
        const response = await storyAPI.unlikeStory(id);
        setIsLiked(false);
        setLikeCount(response.likes || likeCount - 1);
      } else {
        const response = await storyAPI.likeStory(id);
        setIsLiked(true);
        setLikeCount(response.likes || likeCount + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleFollowAuthor = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    if (!story || !story.writer?.username) return;

    // Don't allow following yourself
    if (user.username === story.writer.username) {
      return;
    }

    try {
      setFollowLoading(true);
      
      // If we don't have authorId yet, fetch it first
      let userIdToFollow = authorId;
      if (!userIdToFollow) {
        const profileData = await userAPI.getUserProfile(story.writer.username);
        userIdToFollow = profileData.user.id;
        setAuthorId(userIdToFollow);
        setIsFollowingAuthor(profileData.user.isFollowing || false);
      }

      if (isFollowingAuthor) {
        await userAPI.unfollowUser(userIdToFollow);
        setIsFollowingAuthor(false);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${story.writer.username}`,
        });
      } else {
        await userAPI.followUser(userIdToFollow);
        setIsFollowingAuthor(true);
        toast({
          title: "Following",
          description: `You are now following ${story.writer.username}`,
        });
      }
    } catch (error: any) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await commentAPI.createComment(id, comment);
      
      // Add the new comment to the list
      setComments([response.comment, ...comments]);
      setCommentCount(commentCount + 1);
      setComment(""); // Clear the textarea
      
      toast({
        title: "Success",
        description: "Your comment has been posted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string, index: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like comments",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await commentAPI.likeComment(commentId);
      
      // Update the comment in the list
      const updatedComments = [...comments];
      updatedComments[index] = {
        ...updatedComments[index],
        likes: response.likes,
        dislikes: response.dislikes,
        isLiked: response.isLiked,
        isDisliked: response.isDisliked,
      };
      setComments(updatedComments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleDislikeComment = async (commentId: string, index: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to dislike comments",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await commentAPI.dislikeComment(commentId);
      
      // Update the comment in the list
      const updatedComments = [...comments];
      updatedComments[index] = {
        ...updatedComments[index],
        likes: response.likes,
        dislikes: response.dislikes,
        isLiked: response.isLiked,
        isDisliked: response.isDisliked,
      };
      setComments(updatedComments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to dislike comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!story) return;

    const storyUrl = window.location.href;
    const shareData = {
      title: story.title,
      text: `Check out this ${story.genre} story: ${story.title}`,
      url: storyUrl,
    };

    try {
      // Check if Web Share API is supported (mainly for mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Story shared successfully",
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(storyUrl);
        toast({
          title: "Link copied!",
          description: "Story link has been copied to your clipboard",
        });
      }
    } catch (error: any) {
      // User cancelled the share or clipboard API failed
      if (error.name !== 'AbortError') {
        // If it's not a user cancellation, try clipboard fallback
        try {
          await navigator.clipboard.writeText(storyUrl);
          toast({
            title: "Link copied!",
            description: "Story link has been copied to your clipboard",
          });
        } catch (clipboardError) {
          toast({
            title: "Error",
            description: "Failed to share story. Please copy the URL manually.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save stories",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    try {
      const response = await storyAPI.saveStory(id);
      setIsSaved(response.isSaved);
      toast({
        title: response.isSaved ? "Story saved!" : "Story unsaved",
        description: response.isSaved 
          ? "Story has been added to your saved stories" 
          : "Story has been removed from your saved stories",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save story",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Story Not Found</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Story Header */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Link>
        </Button>

        {/* Story Meta */}
        <div className="mb-8">
          <Badge className="mb-4 bg-primary/20 text-primary border border-primary/30">
            {story.genre}
          </Badge>
          
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
            {story.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <Link to={`/user/${story.writer.username}`} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary flex-shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm sm:text-base">
                    {story.writer.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">{story.writer.username}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <span className="hidden sm:inline">{getReadTime(story.content)} • </span>
                    {formatDate(story.createdAt)}
                  </p>
                </div>
              </Link>
              {user && user.username !== story.writer.username && (
                <Button
                  variant={isFollowingAuthor ? "outline" : "default"}
                  size="sm"
                  className="gap-2 flex-shrink-0"
                  onClick={handleFollowAuthor}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <span className="hidden sm:inline">Loading...</span>
                  ) : isFollowingAuthor ? (
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
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                className={`transition-all h-9 w-9 sm:h-10 sm:w-10 ${
                  isLiked ? "text-destructive border-destructive" : ""
                }`}
                onClick={handleLike}
                aria-label={isLiked ? "Unlike story" : "Like story"}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`transition-all h-9 w-9 sm:h-10 sm:w-10 ${
                  isSaved ? "text-primary border-primary" : ""
                }`}
                onClick={handleBookmark}
                aria-label={isSaved ? "Unsave story" : "Save story"}
              >
                <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleShare}
                className="h-9 w-9 sm:h-10 sm:w-10"
                aria-label="Share story"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Story Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {likeCount} likes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {commentCount} comments
            </span>
          </div>
        </div>

        {/* Story Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-12">
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-6 sm:py-8 border-y border-border mb-8 sm:mb-12 flex-wrap">
          <Button
            variant={isLiked ? "default" : "outline"}
            className={`gap-2 text-sm sm:text-base ${isLiked ? "bg-destructive hover:bg-destructive/90" : ""}`}
            onClick={handleLike}
            size="sm"
          >
            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
            <span>({likeCount})</span>
          </Button>
          <Button variant="outline" className="gap-2 text-sm sm:text-base" onClick={scrollToComments} size="sm">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Comment</span>
            <span className="sm:hidden">({commentCount})</span>
          </Button>
          <Button variant="outline" className="gap-2 text-sm sm:text-base" onClick={handleShare} size="sm">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        <div id="comments-section" className="mb-8">
          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Comments ({commentCount})
          </h2>

          {/* Add Comment */}
          {user ? (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg border border-border bg-card">
              <Textarea
                placeholder="Share your thoughts on this story..."
                className="mb-3 sm:mb-4 bg-secondary border-border focus:border-accent resize-none text-sm sm:text-base"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-primary to-accent text-sm sm:text-base"
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !comment.trim()}
                  size="sm"
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-sm sm:text-base text-muted-foreground">Please log in to comment</p>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((commentItem, index) => (
                <div
                  key={commentItem.id}
                  className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Link to={`/user/${commentItem.author.username}`} className="flex-shrink-0">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-accent/30 hover:border-accent transition-colors cursor-pointer">
                        <AvatarFallback className="bg-accent/20 text-accent font-semibold text-xs sm:text-sm">
                          {commentItem.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <Link
                          to={`/user/${commentItem.author.username}`}
                          className="font-semibold text-sm sm:text-base hover:text-primary transition-colors truncate"
                        >
                          {commentItem.author.name || commentItem.author.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(commentItem.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-foreground/90 whitespace-pre-wrap mb-2 sm:mb-3 break-words">{commentItem.content}</p>
                      
                      {/* Like/Dislike Buttons */}
                      <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
                        <button
                          onClick={() => handleLikeComment(commentItem.id, index)}
                          className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-colors min-h-[32px] px-2 ${
                            commentItem.isLiked
                              ? "text-blue-500 hover:text-blue-600"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          disabled={!user}
                        >
                          <ThumbsUp className={`h-3 w-3 sm:h-4 sm:w-4 ${commentItem.isLiked ? "fill-current" : ""}`} />
                          <span>{commentItem.likes}</span>
                        </button>
                        <button
                          onClick={() => handleDislikeComment(commentItem.id, index)}
                          className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-colors min-h-[32px] px-2 ${
                            commentItem.isDisliked
                              ? "text-red-500 hover:text-red-600"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          disabled={!user}
                        >
                          <ThumbsDown className={`h-3 w-3 sm:h-4 sm:w-4 ${commentItem.isDisliked ? "fill-current" : ""}`} />
                          <span>{commentItem.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
