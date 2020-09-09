const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt =require('jsonwebtoken')
const Task = require('../models/tasks')

const useSchema = new mongoose.Schema({
    name:{
        type:String,
        required:false,
        trim:true
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(value.length<6){
                throw Error('Pass less than 6 char')
            }else if(value.toLowerCase().includes('password')){
                throw Error('Pass contains phrase \'password\'')
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        toLowerCase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age:{
        type:Number,
        default:20,
        validate(value){
            if(value<0){
                throw new Error('Error age should be greater than 0')
            }
      
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar: {
        type:Buffer
    }
}, {
        timestamps:true
    },
)

useSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

useSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_TOKEN)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

useSchema.methods.toJSON = function (){
    user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.token
    return userObject
}
useSchema.statics.findByCredentials = async (email, pass)=>{
    const user = await User.findOne({email})
    console.log(user)
    if(!user){
        throw new Error('Unable to Login')
    }
    const isMatch = await bcrypt.compare(pass,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}
//Hash the plain text password before saving
useSchema.pre('save', async function(next){
    const user = this
    console.log('Just before saving')

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})
//Dedlete user task when user is removed
useSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})


const User = mongoose.model('User',useSchema)


module.exports = User