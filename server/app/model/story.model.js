const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Predefined list of genres
// const GENRES = ['Horror', 'Mystery', 'Fantasy', 'Sci-Fi', 'Thriller', 'Romance', 'Drama','General'];

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
    genre:{
        type: String,
        default: 'General',
        enum: ['Horror', 'Mystery', 'Fantasy', 'Sci-Fi', 'Thriller', 'Romance', 'Drama', 'General', 'Supernatural', 'Psychological', 'Gothic']
    },
    status:{
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
   likes:[{
       type: Schema.Types.ObjectId,
       ref: 'User'
   }],
   unlikes:[{
       type: Schema.Types.ObjectId,
       ref: 'User'
   }]
    

},{timestamps: true});
let Story  = mongoose.model('Story', storySchema);



module.exports = {Story};

