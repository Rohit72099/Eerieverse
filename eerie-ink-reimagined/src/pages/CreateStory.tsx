import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { storyAPI } from "@/lib/api";
import { z } from "zod";

const storySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  content: z.string().min(100, "Story must be at least 100 characters"),
  genre: z.string().min(1, "Please select a genre"),
});

export default function CreateStory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handlePublish = async () => {
    setErrors({});
    
    const data = { title, content, genre };

    try {
      storySchema.parse(data);
      setIsSaving(true);
      await storyAPI.createStory(data);
      toast({
        title: "Story Published!",
        description: "Your dark tale has been shared with the community.",
      });
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check all fields and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to publish",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-primary to-accent text-sm sm:text-base flex-shrink-0"
            size="sm"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{isSaving ? "Publishing..." : "Publish Story"}</span>
            <span className="sm:hidden">{isSaving ? "Publishing..." : "Publish"}</span>
          </Button>
        </div>

        {/* Story Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg font-semibold">
              Story Title
            </Label>
            <Input
              id="title"
              placeholder="Enter your eerie tale's title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-serif font-bold bg-secondary border-border focus:border-accent h-14"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre" className="text-lg font-semibold">
              Genre
            </Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="bg-secondary border-border focus:border-accent h-12">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
                <SelectItem value="psychological">Psychological</SelectItem>
                <SelectItem value="gothic">Gothic</SelectItem>
              </SelectContent>
            </Select>
            {errors.genre && <p className="text-xs text-destructive">{errors.genre}</p>}
          </div>

          {/* Story Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-lg font-semibold">
                Your Story
              </Label>
              <span className="text-sm text-muted-foreground">
                {content.length} characters
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="Start your eerie tale here... Let your imagination run wild in the darkness."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px] bg-secondary border-border focus:border-accent resize-none font-sans text-base sm:text-lg leading-relaxed"
            />
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>

          {/* Writing Tips */}
          <div className="p-6 rounded-lg border border-border bg-card/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-primary">💡</span> Writing Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Build atmosphere slowly - let tension simmer before revealing horror</li>
              <li>• Use sensory details - what does fear smell, sound, and feel like?</li>
              <li>• Leave some things unsaid - the unknown is often scarier than what's shown</li>
              <li>• End with impact - a final twist or haunting image stays with readers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
