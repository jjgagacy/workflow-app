import { MailClient, SendEmailDto } from "../interfaces/client.interface";
import * as nodemailer from 'nodemailer';
import { join } from "path";

interface SMTPOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    useTls?: boolean;
    opportunisticTls?: boolean;
    connectionTimeout?: number;
}

export class SMTPClient implements MailClient {
    private transporter: nodemailer.Transporter;

    constructor({
        host,
        port,
        username,
        password,
        useTls = true,
        opportunisticTls = false, // false can use STARTTLS
        connectionTimeout = 10000 // 10 secs
    }: SMTPOptions) {
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: opportunisticTls,
            requireTLS: useTls,
            ignoreTLS: false, // do not ignore TLS

            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3',
            },

            auth: {
                user: username,
                pass: password,
            },

            connectionTimeout
        });
    }

    async verify(): Promise<void> {
        await this.transporter.verify();
    }

    async send(dto: SendEmailDto): Promise<any> {
        return await this.transporter.sendMail({
            from: dto.from,
            to: dto.to,
            subject: dto.subject,
            html: dto.html,
            cc: dto.cc,
            bcc: dto.bcc,
            text: dto.text,
            replyTo: dto.replyTo,
            attachments: dto.attachments,
        })
    }
}