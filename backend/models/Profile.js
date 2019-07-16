const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ProfileSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    website: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    bio: {
        type: String
    },

    education: [
        {
            school: {
                type: String
            },
            degree: {
                type: String,
            },
            fieldofstudy: {
                type: String
            },
            from: {
                type:Date,
            },
            to: {
                type:Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type:String
            }
        }
    ],
    social: {
        youtube: {
            type:String
        },
        twitter: {
            type:String
        },
        facebook: {
            type:String
        },
        instagram: {
            type: String
        }
    },
    date: {
        type:Date,
        default: Date.now()
    }
});



const Profile = mongoose.model('profile', ProfileSchema);

module.exports = Profile;