const Apify = require('apify');

Apify.main(async () => {
    // Create a request list.
    const requestList = new Apify.RequestList({
        sources: [
            { url: 'http://www.example.com' },
            { url: 'http://www.some-nonexisting-domain.com' },
        ],
    });

    await requestList.initialize();

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        disableProxy: true,

        // This page is executed for each request.
        // If request failes then it's retried 3 times.
        // Parameter page is Puppeteers page object with loaded page.
        handlePageFunction: async ({ page, request }) => {
            const pageTitle = await page.title();

            console.log(`Request ${request.url} succeeded and it's title is ${pageTitle}`);
            
            await Apify.pushData({
                url: request.url,
                pageTitle,
                errors: null,
            })
        },

        // If request failed 4 times then this function is executed.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed 4 times`);

            await Apify.pushData({
                url: request.url,
                pageTitle: null,
                errors: request.errorMessages,
            })
        },
    });

    // Run crawler for request list.
    await crawler.run();
});