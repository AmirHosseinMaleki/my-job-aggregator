import { PlaywrightCrawler, Dataset } from 'crawlee';
import { router } from './routes.js';

// Create a crawler that uses our router
const crawler = new PlaywrightCrawler({
    // Use the router to process requests
    requestHandler: router,
    
    // Limit concurrency to avoid overloading servers
    maxConcurrency: 1,
    
    // Set a reasonable limit for the demo
    maxRequestsPerCrawl: 20,
    
    // Add a small delay between requests to be polite
    requestHandlerTimeoutSecs: 90,
    navigationTimeoutSecs: 90,
    
    // Useful for debugging - set to false to see the browser
    headless: false,  // Changed to false for debugging
    
    // Use a longer retry count for robustness
    maxRequestRetries: 1,
});

// Run the crawler with starting URLs for job sites
await crawler.run([
    // LinkedIn Jobs
    {
        url: 'https://www.linkedin.com/jobs/search/?keywords=product%20manager&location=Prague',
        label: 'LINKEDIN_JOBS',
        userData: {
            location: 'Prague'
        }
    },
    {
        url: 'https://www.linkedin.com/jobs/search/?keywords=product%20manager&location=Remote',
        label: 'LINKEDIN_JOBS',
        userData: {
            location: 'Remote'
        }
    },
    
    // Indeed Jobs (added)
    {
        url: 'https://cz.indeed.com/jobs?q=product+manager&l=Prague',
        label: 'INDEED_JOBS',
        userData: {
            location: 'Prague'
        }
    },
    {
        url: 'https://cz.indeed.com/jobs?q=product+manager&l=remote',
        label: 'INDEED_JOBS',
        userData: {
            location: 'Remote'
        }
    },
    
    // Jobs.cz - leave this as a last attempt
    {
        url: 'https://www.jobs.cz/prace/product-manager/?locality%5B%5D=prague',
        label: 'JOBS_CZ',
        userData: {
            location: 'Prague'
        }
    },
]);

// After the crawler finishes, save the data
const dataset = await Dataset.open();
const { items } = await dataset.getData();

console.log(`Found ${items.length} product manager positions`);
console.log('Data saved to ./storage/datasets/default');