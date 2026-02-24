import fs from 'fs';

if (process.env.VERCEL) {
  console.log('Running Vercel environment setup...');
  const targetPath = './src/services/daily-content.service.ts';
  
  try {
    let content = fs.readFileSync(targetPath, 'utf8');
    
    if (process.env.GEMINI_API_KEY) {
      // Replace the global variable with the actual string value
      content = content.replace(/GEMINI_API_KEY/g, `"${process.env.GEMINI_API_KEY}"`);
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log('Environment variables injected successfully for Vercel.');
    } else {
      console.warn('WARNING: GEMINI_API_KEY is not defined in the Vercel environment.');
    }
  } catch (error) {
    console.error('Error injecting environment variables:', error);
  }
}
