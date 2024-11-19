import nodemailer from "nodemailer"

export const sendEmail = ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "abdom87078@gmail.com",
            pass: "qvhqecltgyzvyudx"
        }
    })

    transporter.sendMail({
        from: '""shebr\'s services<abdom87078@gmail.com>',
        to,
        subject,
        html
    })
}