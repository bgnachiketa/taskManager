const express = require('express')
const User = require('../models/user')
const { update } = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')

const {sendWelcomeEmail, sendByeEmail} = require('../emails/account')

const upload = multer({
    //dest:'avatar',
    limits:{
        fieldSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload image format'))
        }
        cb(undefined,true)


    }
})
router.delete('/users/me/avatar',auth,async (req,resp)=>{
    req.user.avatar = undefined
    await req.user.save()
    resp.send()
})

const sharp = require('sharp')
router.post('/users/me/avatar',auth,upload.single('upload'),async(req,resp)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    resp.send()
},(err,req,resp,next)=>{
    resp.status(400).send({error:err.message})
})
router.post('/users',async (req,resp)=>{
    const user = new User(req.body)
    // user.save().then(()=>{
    //     resp.send(user)
    // }).catch((err)=>{
    //     resp.status(400).send(err)
    // })
    try{
        const token  = await user.generateAuthToken()
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        resp.send({user,token})
    }catch(e){
        resp.status(400).send(e)

    }
})

router.get('/users/me',auth,async (req,resp)=>{
    resp.send(req.user)
    // User.find({}).then((users)=>{
    //     resp.send(users)
    // }).catch((err)=>{
    //     resp.status(500).send()
    // })
})
// router.get('/users/:id',auth,async (req,resp)=>{
//     const _id = req.params.id
//     //console.log(req)
//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return resp.status(404).send()
//     //     }
//     //     resp.send(users)
//     // }).catch((err)=>{
//     //     resp.status(500).send()
//     // })
//     try{
//         const user = await User.findById(_id)
//         if(!user){
//             return resp.status(404).send()
//         }
//         resp.send(user)
//     }catch(e){
//         resp.status(500).send(e)
//     }
// })
router.post('/users/login', async(req,resp)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token  = await user.generateAuthToken()
        resp.status(200).send({user,token})
    }catch(e){
        resp.status(400).send()

    }
})
router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()

}})
router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()

}})
router.patch('/users/me',auth, async(req,resp)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if(!isValidOperation){
        return resp.status(400).send({error:'Invalid updates'})
    }
    try{
        //const user = await User.findByIdAndUpdate(req.params.id)
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()

        resp.status(200).send(req.user)
    }catch(e){
        resp.status(500).send(e)
    }
})
router.delete('/users/me',auth,async (req,resp)=>{
    try{
        // const userDeleted = await User.findByIdAndDelete(req.params.id)
        //  if(!userDeleted){
        //      return resp.status(404).send()
        // }     
        await req.user.remove()  
        //resp.send( userDeleted)
        sendByeEmail(req.user.email,req.user.name)
        resp.send(req.user)
       }catch(e){
        resp.status(500).send(e)
    }
})

module.exports = router