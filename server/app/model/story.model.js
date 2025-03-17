const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    writer:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    meta: {
        votes: Number,
        favs: Number
    }
    

},{timestamps: true});
module.exports = mongoose.model('Story', storySchema);