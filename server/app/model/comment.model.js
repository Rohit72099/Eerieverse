const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    story: {
        type: Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Index for faster queries
commentSchema.index({ story: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };

