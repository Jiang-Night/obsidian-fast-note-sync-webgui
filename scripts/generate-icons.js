import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, '../public/static/images/icon.svg');
const outputDir = path.resolve(__dirname, '../public/static/images');

console.log(`Input: ${inputPath}`);
console.log(`Output Directory: ${outputDir}`);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
    try {
        // Shared options for sharp to ensure transparency
        const sharpOptions = {
            density: 300, // Increase density for better quality SVG rendering
        };

        const resizeOptions = {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        };

        const pngOptions = {
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: true,
        };

        // 1. Generate favicon-32x32.png
        const favicon32Path = path.join(outputDir, 'favicon-32x32.png');
        await sharp(inputPath, sharpOptions)
            .resize(32, 32, resizeOptions)
            .png(pngOptions)
            .toFile(favicon32Path);
        console.log('Generated favicon-32x32.png');

        // 2. Generate apple-touch-icon.png (180x180)
        // Apple touch icons usually look better with a background color if the icon is white/transparent
        // However, to fix "black block" we first ensure transparency.
        // If the user wants a background color, they can request it.
        // For now, let's keep it transparent but standard is often solid.
        // We will generate transparent first.
        await sharp(inputPath, sharpOptions)
            .resize(180, 180, resizeOptions)
            .png(pngOptions)
            .toFile(path.join(outputDir, 'apple-touch-icon.png'));
        console.log('Generated apple-touch-icon.png');

        // 3. Generate os icon.png (512x512)
        await sharp(inputPath, sharpOptions)
            .resize(512, 512, resizeOptions)
            .png(pngOptions)
            .toFile(path.join(outputDir, 'os icon.png'));
        console.log('Generated os icon.png');

        // 4. Generate favicon.ico from favicon-32x32.png
        // using png-to-ico
        // png-to-ico might not handle transparency perfectly if the input png has issues, but sharp output should be good now.
        try {
            const buf = await pngToIco([favicon32Path]);
            fs.writeFileSync(path.join(outputDir, 'favicon.ico'), buf);
            console.log('Generated favicon.ico');
        } catch (e) {
            console.error('Error generating favicon.ico:', e);
        }

    } catch (err) {
        console.error('Error during generation:', err);
        process.exit(1);
    }
}

generate();
