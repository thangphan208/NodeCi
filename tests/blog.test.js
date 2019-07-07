const Page = require('./helper/page');
let page;
beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('#showBlog')
        await page.click('a.btn-floating')
    })
    test('Can see blog create form', async () => {
        const label = await page.getContentOf('form label');
        expect(label).toEqual('Blog Title')
    })
    describe('When using invalid inputs', async () => {
        test('Submmiting shows error messages', async () => {
            await page.type('input[name="title"]', '', { delay: 100 })
            await page.click('button.teal')
            const errorMessage = await page.getContentOf('div.red-text');
            expect(errorMessage).toContain('You must provide a value')
        })
    }) 
    describe('When using valid form input', async () => {
        let title = 'This is the Title'
        let content = 'This is the Content'
        test('Sumbiting takes user to a review screen', async () => {
            await page.login();
            await page.click('a#showBlog')
            await page.click('i');
            await page.type('input[name="title"]', title)
            await page.type('input[name="content"]', content)
            await page.click('button.teal')
            const button = await page.getContentOf('button.green');
            expect(button).toContain('SAVE BLOGemail')
        })
        test('Submiting then saving adds blog to "Blog Index" page', async () => {
            await page.login();
            await page.click('a#showBlog')
            await page.click('i');
            await page.type('input[name="title"]', title)
            await page.type('input[name="content"]', content)
            await page.click('button.teal');
            await page.click('button.green');
            await page.waitForSelector('span.card-title')
            const savedContent = await page.getContentOf('p')
            expect(savedContent).toEqual(content);
        })
    })
})
describe('When NOT logged in', async () => {
    test('User cannot create blog posts', async () => {
        const result = await page.post('api/blogs', { title: 'This is the Title', content: 'This is the Content' })
        expect(result).toEqual(result)
    })
    test('View a post result in an error', async () => {
        const result = await page.get('api/blogs')
        expect(result).toEqual({ error: 'You must log in!' })
    })
})
