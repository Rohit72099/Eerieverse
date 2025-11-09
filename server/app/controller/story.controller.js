// let { Story } = require('../model/story.model');


// let createStory = async (req, res) => {
//     let { title, content, status } = req.body;
//     try {
//         let story =new Story({
//             title,
//             content,
//             writer: req.user.id,
//             status
//         });
//         await story.save();
//         // console.log(story);
//         res.redirect('/userhome');
    
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// }

// // let getAllStory = async (req, res) => {
// //     try {
// //         let stories = await Story.find().populate('writer');
// //         res.json({ stories });
// //     }
// //     catch (error) {
// //         res.status(400).json({ error: error.message });
// //     }

// // };

// let userSpecificStory = async (req, res) => {
//     // let id = req.params.id;
//     try {
//         let stories = await Story.find({ writer: req.
//  });
//         res.json({ stories });
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message });
//     }

// }

// //like and Unlike story
// // Like a story
// let likeStory = async (req, res) => {
//     try {
//         const story = await Story.findById(req.params.id);
//         if (!story) return res.status(404).json({ message: "Story not found" });

//         // Check if the user already liked the story
//         if (story.likes.includes(req.user.id)) {
//             return res.status(400).json({ message: "You already liked this story" });
//         }

//         story.likes.push(req.user.id);
//         await story.save();
//         res.status(200).json({ message: "Story liked", likes: story.likes.length });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Unlike a story
// let unlikeStory = async (req, res) => {
//     try {
//         const story = await Story.findById(req.params.id);
//         if (!story) return res.status(404).json({ message: "Story not found" });

//         // Remove user from likes
//         story.likes = story.likes.filter(id => id.toString() !== req.user.id.toString());
//         story.unlikes.push(req.user.id);
//         await story.save();
//         res.status(200).json({ message: "Story unliked", likes: story.likes.length });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };







// module.exports = {createStory,userSpecificStory, likeStory, unlikeStory};


// ----------------


const { Story } = require('../model/story.model');
const { User } = require('../model/user.model');
const { Comment } = require('../model/comment.model');

// ✅ Helper function to normalize genre (capitalize first letter and handle special cases)
const normalizeGenre = (genre) => {
  if (!genre) return 'General';
  
  // Convert to lowercase for comparison
  const lowerGenre = genre.toLowerCase().trim();
  
  // Map of lowercase to proper case genres (handles special cases like Sci-Fi)
  const genreMap = {
    'horror': 'Horror',
    'mystery': 'Mystery',
    'fantasy': 'Fantasy',
    'sci-fi': 'Sci-Fi',
    'scifi': 'Sci-Fi',
    'science-fiction': 'Sci-Fi',
    'thriller': 'Thriller',
    'romance': 'Romance',
    'drama': 'Drama',
    'general': 'General',
    'supernatural': 'Supernatural',
    'psychological': 'Psychological',
    'gothic': 'Gothic'
  };
  
  // Check if genre exists in map
  if (genreMap[lowerGenre]) {
    return genreMap[lowerGenre];
  }
  
  // If not found, try to capitalize first letter as fallback
  const normalized = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
  
  // List of valid genres
  const validGenres = ['Horror', 'Mystery', 'Fantasy', 'Sci-Fi', 'Thriller', 'Romance', 'Drama', 'General', 'Supernatural', 'Psychological', 'Gothic'];
  
  // Check if normalized genre is valid
  if (validGenres.includes(normalized)) {
    return normalized;
  }
  
  // Default fallback
  return 'General';
};

// ✅ Create a new story
const createStory = async (req, res) => {
  try {
    const { title, content, status, genre } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    // Normalize genre to match enum values
    const normalizedGenre = normalizeGenre(genre);

    const story = await Story.create({
      title,
      content,
      status: status || 'published',
      genre: normalizedGenre,
      writer: req.user.id, // Use req.user.id instead of req.user._id
    });

    res.status(201).json({
      message: "Story created successfully",
      story: {
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        genre: story.genre,
        createdAt: story.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ 
      message: "Failed to create story",
      error: error.message 
    });
  }
};

// ✅ Fetch all stories for the logged-in user
const userSpecificStory = async (req, res) => {
  try {
    const userId = req.user.id;
    const stories = await Story.find({ writer: userId })
      .sort({ createdAt: -1 })
      .populate('writer', 'username name email');

    // Get comment counts for all stories
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { story: { $in: storyIds } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    res.json({
      message: "User stories fetched successfully",
      stories: stories.map((story) => ({
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        genre: story.genre || "General",
        createdAt: story.createdAt,
        likes: story.likes.length,
        likesArray: story.likes.map(id => id.toString()),
        isLiked: story.likes.some(id => id.toString() === userId.toString()),
        comments: commentCountMap[story._id.toString()] || 0,
        writer: story.writer,
      })),
    });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ message: "Failed to fetch user stories" });
  }
};

// ✅ Fetch a single story by ID
const getStoryById = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional: check if user is authenticated
    const story = await Story.findById(req.params.id)
      .populate('writer', 'username name email');

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Get comment count
    const commentCount = await Comment.countDocuments({ story: story._id });

    // Check if story is saved by user
    let isSaved = false;
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.savedStories) {
        isSaved = user.savedStories.some(id => id.toString() === story._id.toString());
      }
    }

    res.json({
      message: "Story fetched successfully",
      story: {
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        writer: story.writer,
        createdAt: story.createdAt,
        likes: story.likes.length,
        isLiked: userId ? story.likes.some(id => id.toString() === userId.toString()) : false,
        isSaved: isSaved,
        genre: story.genre || "General",
        comments: commentCount,
      },
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ message: "Failed to fetch story" });
  }
};

// ✅ Fetch all published stories (for homepage feed)
const getAllStories = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional: check if user is authenticated
    const stories = await Story.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('writer', 'username name email');

    // Get comment counts for all stories
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { story: { $in: storyIds } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    res.json({
      message: "Stories fetched successfully",
      stories: stories.map((story) => ({
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        writer: story.writer,
        createdAt: story.createdAt,
        likes: story.likes.length,
        likesArray: userId ? story.likes.map(id => id.toString()) : [], // Include likes array if user is authenticated
        isLiked: userId ? story.likes.some(id => id.toString() === userId.toString()) : false,
        genre: story.genre || "General",
        comments: commentCountMap[story._id.toString()] || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};

// ✅ Like a story
const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Convert req.user.id to ObjectId for comparison
    const userId = req.user.id;

    // If already liked
    if (story.likes.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "You already liked this story" });
    }

    // Remove from unlikes if present, then add to likes
    story.unlikes = story.unlikes.filter(id => id.toString() !== userId.toString());
    story.likes.push(userId);

    await story.save();
    res.status(200).json({
      message: "Story liked successfully",
      likes: story.likes.length,
      isLiked: true,
    });
  } catch (error) {
    console.error("Error liking story:", error);
    res.status(500).json({ message: "Failed to like story" });
  }
};

// ✅ Unlike a story
const unlikeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Convert req.user.id to ObjectId for comparison
    const userId = req.user.id;

    // Remove from likes, add to unlikes
    story.likes = story.likes.filter(id => id.toString() !== userId.toString());
    if (!story.unlikes.some(id => id.toString() === userId.toString())) {
      story.unlikes.push(userId);
    }

    await story.save();
    res.status(200).json({
      message: "Story unliked successfully",
      likes: story.likes.length,
      isLiked: false,
    });
  } catch (error) {
    console.error("Error unliking story:", error);
    res.status(500).json({ message: "Failed to unlike story" });
  }
};

// ✅ Get user's liked stories
const getLikedStories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all stories where the user is in the likes array
    const stories = await Story.find({ likes: userId })
      .sort({ createdAt: -1 })
      .populate('writer', 'username name email');

    // Get comment counts for all stories
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { story: { $in: storyIds } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    res.json({
      message: "Liked stories fetched successfully",
      stories: stories.map((story) => ({
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        writer: story.writer,
        createdAt: story.createdAt,
        likes: story.likes.length,
        isLiked: true, // User has liked these stories
        genre: story.genre || "General",
        comments: commentCountMap[story._id.toString()] || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching liked stories:", error);
    res.status(500).json({ message: "Failed to fetch liked stories" });
  }
};

// ✅ Save/Bookmark a story
const saveStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if story is already saved
    if (user.savedStories.some(id => id.toString() === storyId)) {
      // Remove from saved stories
      user.savedStories = user.savedStories.filter(id => id.toString() !== storyId);
      await user.save();
      
      return res.status(200).json({
        message: "Story removed from saved",
        isSaved: false,
      });
    } else {
      // Add to saved stories
      user.savedStories.push(storyId);
      await user.save();
      
      return res.status(200).json({
        message: "Story saved successfully",
        isSaved: true,
      });
    }
  } catch (error) {
    console.error("Error saving story:", error);
    res.status(500).json({ message: "Failed to save story" });
  }
};

// ✅ Get user's saved stories
const getSavedStories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate({
      path: 'savedStories',
      populate: {
        path: 'writer',
        select: 'username name email'
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stories = user.savedStories || [];
    
    // Get comment counts for all stories
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { story: { $in: storyIds } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    res.json({
      message: "Saved stories fetched successfully",
      stories: stories.map((story) => ({
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        writer: story.writer,
        createdAt: story.createdAt,
        likes: story.likes.length,
        isLiked: story.likes.some(id => id.toString() === userId.toString()),
        genre: story.genre || "General",
        comments: commentCountMap[story._id.toString()] || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching saved stories:", error);
    res.status(500).json({ message: "Failed to fetch saved stories" });
  }
};

// ✅ Get stories by username
const getStoriesByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.user?.id; // Optional: check if user is authenticated

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get stories by this user
    const stories = await Story.find({ writer: user._id, status: 'published' })
      .sort({ createdAt: -1 })
      .populate('writer', 'username name email');

    // Get comment counts for all stories
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { story: { $in: storyIds } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    res.json({
      message: "User stories fetched successfully",
      stories: stories.map((story) => ({
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        writer: story.writer,
        createdAt: story.createdAt,
        likes: story.likes.length,
        isLiked: userId ? story.likes.some(id => id.toString() === userId.toString()) : false,
        genre: story.genre || "General",
        comments: commentCountMap[story._id.toString()] || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ message: "Failed to fetch user stories" });
  }
};

// ✅ Search Stories
const searchStories = async (req, res) => {
  try {
    const { q } = req.query; // Search query
    const userId = req.user?.id; // Optional: check if user is authenticated

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search in title and content (case-insensitive)
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const stories = await Story.find({
      status: 'published',
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { genre: searchRegex }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50) // Limit results
      .populate('writer', 'username name email');

    // Get comment counts for all stories
    const storyIds = stories.map(s => s._id);
    const commentCounts = await Comment.aggregate([
      { $match: { story: { $in: storyIds } } },
      { $group: { _id: '$story', count: { $sum: 1 } } }
    ]);
    
    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    res.json({
      message: "Stories found successfully",
      stories: stories.map((story) => ({
        id: story._id,
        title: story.title,
        content: story.content,
        status: story.status,
        writer: story.writer,
        createdAt: story.createdAt,
        likes: story.likes.length,
        isLiked: userId ? story.likes.some(id => id.toString() === userId.toString()) : false,
        genre: story.genre || "General",
        comments: commentCountMap[story._id.toString()] || 0,
      })),
      count: stories.length
    });
  } catch (error) {
    console.error("Error searching stories:", error);
    res.status(500).json({ message: "Failed to search stories" });
  }
};

module.exports = {
  createStory,
  userSpecificStory,
  getAllStories,
  getStoryById,
  likeStory,
  unlikeStory,
  getLikedStories,
  saveStory,
  getSavedStories,
  getStoriesByUsername,
  searchStories,
};
