const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_KEY)


const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to:email,
        from:'bgnachiketh@gmail.com',
        subject:'Thanks for joining',
        text:`Welcome to the app ${name}`
    })
}
const sendByeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'bgnachiketh@gmail.com',
        subject:'Bye Bye',
        text:`See you soon ${name}`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}
// sgMail.send({
//     to:'bgnachiketa@gmail.com',
//     from:'bgnachiketh@gmail.com',
//     subject:'Helo hichug you',
//     text:'I hope yours are grown'
// })
