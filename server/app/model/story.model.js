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
    // genre:{
    //     type: String,
    //     required: true
    // },
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

