const express = require('express')
require('./db/mongoose')

 
const { ensureIndexes, update } = require('./models/user')
const { json } = require('express')

const app = express()
const userRouter = require('../src/routers/user')
const taskRouter = require('../src/routers/task')
const PORT = process.env.PORT

const multer = require('multer')
const upload = multer({
    dest:'images',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('Please upload pdf'))
        }
        cb(undefined,true)

        // cb(new Error('File must be PDF'))
        // cb(undefined,true)
        // cb(undefined, false)
    }
})

app.post('/upload',upload.single('upload'),(req,resp)=>{
    resp.send()
},(err,req,res,next)=>{
    res.status(400).send({error:err.message})
})

// app.use((req,resp, next)=>{
//     if(req.method === 'GET'){
//         resp.send('GET requests are disabled')

//     }else{
//         next()
//     }

// })
// app.use((req,resp, next)=>{
//     resp.status(503).send('The Website is under Maintance. Check back soon')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT,() =>{
    console.log('Server is up on port : ' + PORT )
})


const Task = require('./models/tasks')
const User = require('./models/user')


// const main = async ()=>{
//     const user = await User.findById('5f5654f1110bb72f2797d26c')
//     await user.populate('tasks').execPopulate()
//   //  console.log(user.tasks)
// }

// main()