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
        console.log(story);
        res.json({ message: "Story created successfully", story });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}

let getAllStory = async (req, res) => {
    try {
        let stories = await Story.find().populate('writer', 'name email');
        res.json({ stories });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }

};
module.exports = {createStory,getAllStory};