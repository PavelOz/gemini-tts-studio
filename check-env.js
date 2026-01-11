import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');

console.log("Checking:", envPath);

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log("File exists. Size:", content.length, "bytes");

    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const parts = trimmed.split('=');
        const key = parts[0];
        const value = parts.slice(1).join('=');

        console.log(`Line ${index + 1}: Key="${key}", ValueLength=${value ? value.length : 0}`);

        if (key !== "VITE_GEMINI_API_KEY") {
            console.log("WARNING: Key does not match 'VITE_GEMINI_API_KEY'");
        }
    });
} else {
    console.log("File .env.local not found!");
}
