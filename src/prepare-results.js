import fs from 'fs';
import path from 'path';

// Read all dataset files and combine them
const datasetDir = './storage/datasets/default/';
const outputPath = './jobs-data.json';

try {
    if (!fs.existsSync(datasetDir)) {
        console.log('Dataset directory not found. Please run the crawler first.');
        process.exit(1);
    }
    
    // Get all JSON files in the dataset directory
    const files = fs.readdirSync(datasetDir)
        .filter(file => file.endsWith('.json'))
        .sort(); // Sort to ensure consistent order
    
    console.log(`Found ${files.length} JSON files in dataset`);
    
    const allJobs = [];
    
    // Read each file and add to the array
    for (const file of files) {
        const filePath = path.join(datasetDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        try {
            const job = JSON.parse(fileContent);
            allJobs.push(job);
            console.log(`✓ Loaded job from ${file}: ${job.title}`);
        } catch (parseError) {
            console.warn(`⚠ Could not parse ${file}: ${parseError.message}`);
        }
    }
    
    // Write the combined array to jobs-data.json
    fs.writeFileSync(outputPath, JSON.stringify(allJobs, null, 2));
    
    console.log(`\n Successfully combined ${allJobs.length} jobs into ${outputPath}`);
    console.log('You can now view the results at http://localhost:3000/results.html');
    
} catch (error) {
    console.error('Error preparing results:', error);
}