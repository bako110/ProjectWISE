// transports.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID ;
const CLIENT_SECRET =process.env.CLIENT_SECRET ;
const REDIRECT_URI = process.env.REDIRECT_URI ;
const REFRESH_TOKEN =process.env.REFRESH_TOKEN ;
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Crée un transporter OAuth2 Gmail
 * @returns {Promise<nodemailer.Transporter>}
 */
export async function createTransporter() {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'bd.basedonne@gmail.com', // ✅ ton adresse Gmail
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token
    }
  });
}