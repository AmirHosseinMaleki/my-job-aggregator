// import { createPlaywrightRouter } from 'crawlee';

// export const router = createPlaywrightRouter();

// router.addDefaultHandler(async ({ enqueueLinks, log }) => {
//     log.info(`enqueueing new URLs`);
//     await enqueueLinks({
//         globs: ['https://crawlee.dev/**'],
//         label: 'detail',
//     });
// });

// router.addHandler('detail', async ({ request, page, log, pushData }) => {
//     const title = await page.title();
//     log.info(`${title}`, { url: request.loadedUrl });

//     await pushData({
//         url: request.loadedUrl,
//         title,
//     });
// });

import { createPlaywrightRouter } from 'crawlee';

// Add this after your imports
async function takeErrorScreenshot(page: import('playwright').Page, name: string) {
    try {
        await page.screenshot({ 
            path: `error-${name}-${Date.now()}.png`,
            fullPage: true 
        });
    } catch (e) {
        // Ignore screenshot errors
    }
}

// Define a job listing interface
interface JobListing {
    title: string;
    company: string;
    location: string;
    isRemote: boolean;
    url: string;
    source: string;
    postedDate?: string;
    description?: string;
}

// Create a router for handling different websites
export const router = createPlaywrightRouter();

// Handler for LinkedIn job pages
// Handler for LinkedIn job pages
router.addHandler('LINKEDIN_JOBS', async ({ request, page, log, enqueueLinks, pushData }) => {
    log.info(`Scraping LinkedIn jobs for ${request.userData.location}`);
    
    try {
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        
        // Let's add a delay to ensure the page is fully loaded
        await page.waitForTimeout(3000);
        
        // Take a screenshot for debugging (optional)
        await page.screenshot({ path: `linkedin-${request.userData.location}.png` });
        
        // Try different selectors for job listings
        const jobElements = await page.$$('.job-search-card, .jobs-search-results__list-item');
        
        if (jobElements.length === 0) {
            log.warning(`No job listings found on LinkedIn for ${request.userData.location}`);
            
            // Let's see what's on the page
            const pageTitle = await page.title();
            log.info(`Page title: ${pageTitle}`);
            
            // Check if we're being blocked or redirected to login
            if (pageTitle.includes('Sign In') || pageTitle.includes('Login')) {
                log.error('LinkedIn is requiring login - we cannot proceed');
                return;
            }
        }
        
        // Extract job listings with a more careful approach
        const jobListings = await page.evaluate(() => {
            const listings: any[] = [];
            
            // Try different selectors that might contain job listings
            const jobCards = document.querySelectorAll('.job-search-card, .jobs-search-results__list-item');
            
            jobCards.forEach(card => {
                // Try multiple potential selectors for title
                const titleElement = card.querySelector('.job-search-card__title, .job-card-list__title, h3');
                const companyElement = card.querySelector('.job-search-card__subtitle, .job-card-container__company-name, h4');
                const locationElement = card.querySelector('.job-search-card__location, .job-card-container__metadata-item, .job-card-container__metadata-wrapper span');
                const linkElement = card.querySelector('a');
                
                if (titleElement || linkElement) {
                    listings.push({
                        title: titleElement && titleElement.textContent ? titleElement.textContent.trim() : '',
                        company: companyElement && companyElement.textContent ? companyElement.textContent.trim() : 'Not specified',
                        location: locationElement && locationElement.textContent ? locationElement.textContent.trim() : '',
                        url: linkElement ? (linkElement as HTMLAnchorElement).href : '',
                        source: 'LinkedIn'
                    });
                }
            });
            
            return listings;
        });
        
        log.info(`Found ${jobListings.length} potential job listings on LinkedIn for ${request.userData.location}`);
        
        // Process and store job listings
        for (const job of jobListings) {
            // Check if it's a product manager position (extra filter)
            if (job.title && job.title.toLowerCase().includes('product')) {
                // Add remote flag based on location or description
                const isRemote = 
                    job.location.toLowerCase().includes('remote') || 
                    request.userData.location === 'Remote';
                
                await pushData({
                    ...job,
                    isRemote
                });
                
                log.info(`Saved job: ${job.title}`);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            log.error(`Error processing LinkedIn: ${error.message}`);
        } else {
            log.error(`Error processing LinkedIn: ${String(error)}`);
        }
    }
});

// Handler for Jobs.cz pages
router.addHandler('JOBS_CZ', async ({ request, page, log, enqueueLinks, pushData }) => {
    log.info(`Scraping Jobs.cz for ${request.userData.location}`);
    
    // Instead of waiting for a specific selector, let's try to wait for any job listings
    try {
        // Wait for the page to load properly
        await page.waitForLoadState('networkidle');
        
        // Use a more general selector or try multiple possible selectors
        const jobElements = await page.$$('.offer');
        
        if (jobElements.length === 0) {
            log.warning('No job listings found on Jobs.cz using the .offer selector');
            
            // Let's try another possible selector
            const altJobElements = await page.$$('.search-result');
            
            if (altJobElements.length === 0) {
                log.warning('No job listings found on Jobs.cz using alternative selectors');
                return; // Exit if we can't find any jobs
            }
        }
        
        // Extract job listings with a more careful approach
        const jobListings = await page.evaluate(() => {
            const listings: any[] = [];
            
            // Try different selectors that might contain job listings
            const jobCards = document.querySelectorAll('.offer, .search-result, .job-card');
            
            jobCards.forEach(card => {
                // Try multiple potential selectors for each element
                const titleElement = card.querySelector('h2, .title, .job-title');
                const companyElement = card.querySelector('.company, .employer, .job-company');
                const locationElement = card.querySelector('.location, .address, .job-location');
                const linkElement = card.querySelector('a');
                
                if (titleElement || linkElement) {
                    listings.push({
                        title: titleElement && titleElement.textContent ? titleElement.textContent.trim() : '',
                        company: companyElement && companyElement.textContent ? companyElement.textContent.trim() : 'Not specified',
                        location: locationElement && locationElement.textContent ? locationElement.textContent.trim() : 'Prague',
                        url: linkElement ? (linkElement as HTMLAnchorElement).href : '',
                        source: 'Jobs.cz'
                    });
                }
            });
            
            return listings;
        });
        
        log.info(`Found ${jobListings.length} potential job listings on Jobs.cz`);
        
        // Process and store job listings
        for (const job of jobListings) {
            if (job.title && job.title.toLowerCase().includes('product')) {
                // Add remote flag based on location or description
                const isRemote = 
                    job.location.toLowerCase().includes('remote') || 
                    job.title.toLowerCase().includes('remote');
                
                await pushData({
                    ...job,
                    isRemote
                });
                
                log.info(`Saved job: ${job.title}`);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            log.error(`Error processing Jobs.cz: ${error.message}`);
        } else {
            log.error(`Error processing Jobs.cz: ${String(error)}`);
        }
    }
});

// Handler for Indeed job pages
router.addHandler('INDEED_JOBS', async ({ request, page, log, enqueueLinks, pushData }) => {
    log.info(`Scraping Indeed jobs for ${request.userData.location}`);
    
    try {
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        
        // Wait for job listings to appear
        await page.waitForSelector('[data-testid="jobsearch-JobList"], .jobsearch-ResultsList', { timeout: 30000 });
        
        // Extract job listings
        const jobListings = await page.evaluate(() => {
            const listings: any[] = [];
            
            // Get all job cards
            const jobCards = document.querySelectorAll('.job_seen_beacon, .result, .job-card');
            
            jobCards.forEach(card => {
                const titleElement = card.querySelector('.jobTitle a, .jcs-JobTitle span, [data-testid="jobTitle"]');
                const companyElement = card.querySelector('.companyName, .company_location .companyName, [data-testid="company-name"]');
                const locationElement = card.querySelector('.companyLocation, .company_location > div, [data-testid="text-location"]');
                const linkElement = card.querySelector('.jobTitle a, .jcs-JobTitle a, a[data-jk]');
                
                if (titleElement || linkElement) {
                    listings.push({
                        title: titleElement && titleElement.textContent ? titleElement.textContent.trim() : '',
                        company: companyElement && companyElement.textContent ? companyElement.textContent.trim() : 'Not specified',
                        location: locationElement && locationElement.textContent ? locationElement.textContent.trim() : '',
                        url: linkElement ? (linkElement as HTMLAnchorElement).href : '',
                        source: 'Indeed'
                    });
                }
            });
            
            return listings;
        });
        
        log.info(`Found ${jobListings.length} potential job listings on Indeed`);
        
        // Process and store job listings
        for (const job of jobListings) {
            if (job.title && job.title.toLowerCase().includes('product')) {
                // Add remote flag based on location or description
                const isRemote = 
                    job.location.toLowerCase().includes('remote') || 
                    job.title.toLowerCase().includes('remote') ||
                    request.userData.location === 'Remote';
                
                await pushData({
                    ...job,
                    isRemote
                });
                
                log.info(`Saved job: ${job.title}`);
            }
        }
        
        // Follow pagination if there's a next page
        await enqueueLinks({
            selector: '[aria-label="Next Page"], .pagination a[aria-label="Next"]',
            label: 'INDEED_JOBS',
            userData: request.userData
        });
        
    } catch (error) {
        if (error instanceof Error) {
            log.error(`Error processing Indeed: ${error.message}`);
        } else {
            log.error(`Error processing Indeed: ${String(error)}`);
        }
    }
});

// Default handler for any unhandled routes
router.addDefaultHandler(async ({ request, log }) => {
    log.info(`Processing ${request.url}`);
    log.warning(`No route found for ${request.url} - skipping`);
});