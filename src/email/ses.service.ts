import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SesService {
  private ses: AWS.SES;
  private sourceEmail: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('region');
    const source_email = this.configService.get<string>('source_email');

    // Use IAM role credentials
    this.ses = new AWS.SES({
      region: region,
    });

    this.sourceEmail = source_email;
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const params = {
      Destination: { ToAddresses: [to] },
      Message: {
        Body: {
          Html: { Charset: 'UTF-8', Data: html },
          Text: { Charset: 'UTF-8', Data: text || html },
        },
        Subject: { Charset: 'UTF-8', Data: subject },
      },
      Source: this.sourceEmail,
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      console.log('SES Email sent:', result.MessageId);
      return result;
    } catch (err) {
      console.error('SES Email error:', err);
      throw err;
    }
  }
}
