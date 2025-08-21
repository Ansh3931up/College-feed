import nodemailer from 'nodemailer';

const sendEmail=async function (email,subject,message){

    let transporter = nodemailer.createTransport({
        host:"smtp.ethereal.email",
        port: 587,
        secure:false,
        auth:{
            user:"maddison53@ethereal.email",
            pass: "jn7jnAPss4f63QBp6D",
        },
    });
    await transporter.sendMail({
        from: 'cocansh3@gmail.com',
        to: email,
        subject: subject,
        html: message
    }, (err, info) => {
        console.log(info.envelope);
        console.log(info.messageId);
    });

};
export default sendEmail;