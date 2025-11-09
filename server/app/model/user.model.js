const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {isEmail }= require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name:{
        type: String,
        required: [true, 'Name is required']
    },
    username:{
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username already exists']
    },
    email:{
        type: String,
        required:[true, 'Email is required'],
        unique: [true, 'Email already exists'],
        validator: [isEmail, 'Please enter a valid email']
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['reader', 'writer','admin'],
        default:'reader',
        required:[true, 'please enter your role']
    },
    savedStories: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Story' 
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
    // avtar:{
    //     type:String,
    //     required:true,
    // },

    
},{timestamps: true});

// userSchema.pre('save', async function(next){
//     const saltRound = 10;
//     const salt = await bcrypt.genSalt(saltRound);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // ✅ Only hash when modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



// userSchema.post('save', function(doc, next){
//     console.log('new user was created and saved', doc);
//     next();
// });



let User = mongoose.model('User', userSchema);
module.exports = {User};