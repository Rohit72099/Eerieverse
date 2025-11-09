const { Comment } = require('../model/comment.model');
const { Story } = require('../model/story.model');
const { User } = require('../model/user.model');

// ✅ Create a new comment
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const storyId = req.params.storyId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "Comment must be less than 1000 characters" });
    }

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      story: storyId,
    });

    // Populate author information
    await comment.populate('author', 'username name email');

    res.status(201).json({
      message: "Comment created successfully",
      comment: {
        id: comment._id,
        content: comment.content,
        author: {
          id: comment.author._id,
          username: comment.author.username,
          name: comment.author.name,
        },
        likes: 0,
        dislikes: 0,
        isLiked: false,
        isDisliked: false,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ 
      message: "Failed to create comment",
      error: error.message 
    });
  }
};

// ✅ Get all comments for a story
const getStoryComments = async (req, res) => {
  try {
    const storyId = req.params.storyId;
    const userId = req.user?.id; // Optional: check if user is authenticated

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Get comments sorted by newest first
    const comments = await Comment.find({ story: storyId })
      .sort({ createdAt: -1 })
      .populate('author', 'username name email');

    res.json({
      message: "Comments fetched successfully",
      comments: comments.map((comment) => ({
        id: comment._id,
        content: comment.content,
        author: {
          id: comment.author._id,
          username: comment.author.username,
          name: comment.author.name || comment.author.username,
        },
        likes: comment.likes.length,
        dislikes: comment.dislikes.length,
        isLiked: userId ? comment.likes.some(id => id.toString() === userId.toString()) : false,
        isDisliked: userId ? comment.dislikes.some(id => id.toString() === userId.toString()) : false,
        createdAt: comment.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// ✅ Like a comment
const likeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;

    // If already liked, remove like
    if (comment.likes.some(id => id.toString() === userId.toString())) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Remove from dislikes if present
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      // Add to likes
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: "Comment liked successfully",
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isLiked: comment.likes.some(id => id.toString() === userId.toString()),
      isDisliked: comment.dislikes.some(id => id.toString() === userId.toString()),
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ message: "Failed to like comment" });
  }
};

// ✅ Dislike a comment
const dislikeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;

    // If already disliked, remove dislike
    if (comment.dislikes.some(id => id.toString() === userId.toString())) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
    } else {
      // Remove from likes if present
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      // Add to dislikes
      comment.dislikes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      message: "Comment disliked successfully",
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isLiked: comment.likes.some(id => id.toString() === userId.toString()),
      isDisliked: comment.dislikes.some(id => id.toString() === userId.toString()),
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
    res.status(500).json({ message: "Failed to dislike comment" });
  }
};

// ✅ Delete a comment (optional - for future use)
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

module.exports = {
  createComment,
  getStoryComments,
  likeComment,
  dislikeComment,
  deleteComment,
};

