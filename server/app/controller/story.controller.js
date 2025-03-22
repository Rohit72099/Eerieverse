let { Story } = require('../model/story.model');


let createStory = async (req, res) => {
    let { title, content, status } = req.body;
    try {
        let story =new Story({
            title,
            content,
            writer: req.user.id,
            status
        });
        await story.save();
        // console.log(story);
        res.redirect('/api/user/userhome');
    
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// let getAllStory = async (req, res) => {
//     try {
//         let stories = await Story.find().populate('writer');
//         res.json({ stories });
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message });
//     }

// };

let userSpecificStory = async (req, res) => {
    // let id = req.params.id;
    try {
        let stories = await Story.find({ writer: req.user.id });
        res.json({ stories });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }

}

//like and Unlike story
// Like a story
let likeStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        // Check if the user already liked the story
        if (story.likes.includes(req.user.id)) {
            return res.status(400).json({ message: "You already liked this story" });
        }

        story.likes.push(req.user.id);
        await story.save();
        res.status(200).json({ message: "Story liked", likes: story.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unlike a story
let unlikeStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        // Remove user from likes
        story.likes = story.likes.filter(id => id.toString() !== req.user.id.toString());
        story.unlikes.push(req.user.id);
        await story.save();
        res.status(200).json({ message: "Story unliked", likes: story.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};







module.exports = {createStory,userSpecificStory, likeStory, unlikeStory};