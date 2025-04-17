export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  region: process.env.AWS_REGION || 'eu-north-1',
  source_email: process.env.SES_SOURCE_EMAIL,
});
