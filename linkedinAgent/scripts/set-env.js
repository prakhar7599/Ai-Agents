const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envDirectory = path.join(__dirname, '../src/environments');
const targetPath = path.join(envDirectory, 'environment.ts');

if (!fs.existsSync(envDirectory)) {
    fs.mkdirSync(envDirectory, { recursive: true });
}

const envConfigFile = `export const environment = {
  production: false,
  googleApiKey: '${process.env.GOOGLE_API_KEY || ''}'
};
`;

console.log('Generating environment.ts with variables from .env');

fs.writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        console.error('Error generating environment.ts:', err);
    } else {
        console.log(`Successfully generated ${targetPath}`);
    }
});
