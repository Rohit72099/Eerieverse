import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { storyAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StoryCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  genre: string;
  likes: number;
  comments: number;
  readTime: string;
  coverImage?: string;
  isLiked?: boolean; // Add optional isLiked prop from backend
}

export const StoryCard = ({
  id,
  title,
  excerpt,
  author,
  genre,
  likes,
  comments,
  readTime,
  coverImage,
  isLiked: initialIsLiked = false,
}: StoryCardProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update state when props change
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(likes);
  }, [initialIsLiked, likes]);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation when clicking like button
    
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
        description: error.response?.data?.message || "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Link to={`/story/${id}`}>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card hover-lift shadow-card transition-all duration-300 hover:border-accent/50">
        {/* Cover Image */}
        <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/20 to-destructive/20">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-4xl opacity-20">📖</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Genre Badge */}
          <Badge className="mb-3 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
            {genre}
          </Badge>

          {/* Title */}
          <h3 className="font-serif text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/user/${author}`);
              }}
              className="font-medium hover:text-foreground transition-colors text-left"
            >
              by {author}
            </button>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 h-8 ${
                isLiked ? "text-destructive" : "text-muted-foreground"
              } hover:text-destructive transition-colors`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground h-8"
            >
              <MessageCircle className="h-4 w-4" />
              {comments}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
