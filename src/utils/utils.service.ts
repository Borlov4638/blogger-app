import * as nodemailer from 'nodemailer'


export class UtilsService{
    async sendConfirmationViaEmail(emailTo:string, confirmationCode:string){

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "borisincubator@gmail.com",
                pass: "fczspwlifurculqv",
            },
        });

        const info = await transporter.sendMail({
            from: 'Boris <borisincubator@gmail.com>', // sender address
            to: emailTo, // list of receivers
            subject: "Registration conformation ✔", // Subject line
            html: `<p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a></p>`, // html body
        });
        console.log(info)
    }

}