const express = require('express')
const Task = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth,async(req,resp)=>{
    //const task = new Task(req.body)  
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    // task.save().then(()=>{
    //     resp.status(200).send(req.body)
    // }).catch((err)=>{
    //     resp.status(400).send(err)
    // })
    try{
        await task.save()
        resp.status(200).send(task)
    }catch(e){
        resp.status(500).send(e)
    }
})
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=10
//GET /tasks?sortBy=createdAt:desc (_asc/desc)
router.get('/tasks',auth, async(req,resp)=>{
    // Task.find({}).then((tasks)=>{
    //     resp.status(200).send(tasks) 
    //  }).catch((err)=>{
    //       resp.status(500)
    //            })
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'? -1 : 1
    }
    try{
       // const task = await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort:{
                    createdAt:-1
                }
            }
        }).execPopulate()
        resp.send(req.user.tasks)
    }catch(e){
        resp.status(500).send(e)
    }

})
router.get('/tasks/:id',auth,async (req,resp)=>{
    const _id = req.params.id
    // Task.findOne(_id).then((task)=>{
    //     resp.status(200).send(task)
    // }).catch((err)=>{
    //     resp.status(500)
    // })
    try{
        //const task = await Task.findOne(_id)
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        resp.send(task)
    }catch(e){
        resp.status(500).send(e)
    }
})
router.patch('/tasks/:id',auth,async (req,resp)=>{
    const updates = Object.keys(req.body)
    const tasksValid = ['completed','description']
    const isValidTask =  updates.every((task)=>tasksValid.includes(task))
    if(!isValidTask){
        return resp.status(400).send({error:'Invalid update operaitons'})
    }
    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            return resp.status(400).send()
        }
        updates.forEach((t)=>{
            task[t] = req.body[t] 
        })
        await task.save()
      
        resp.status(200).send(task)
    }catch(e){
        resp.status(500).send(e)
    }
})
router.delete('/tasks/:id', auth,async(req,resp)=>{
    try{
        const deteletedTask = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!deteletedTask){
            return resp.status(404).send()
        }
        resp.status(200).send(deteletedTask)
    }catch(e){
        resp.status(500).send()
    }
})

module.exports = router