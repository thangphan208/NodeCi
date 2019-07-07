const Page = require('./helper/page')
let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000')
});

afterEach(async () => {
    await page.close();
});

test('Login and see the logout button', async () => {
    await page.login()
    const text = await page.getContentOf('a.brand-logo')
    expect(text).toContain('Blogster')
});

test('Login and create a newly blog', async () => {
    await page.login();
    await page.click('#showBlog')
    await page.click('i');
    const text = await page.getContentOf('a.red');
    expect(text).toContain('CANCEL')
});

