const puppeteer = require('puppeteer');
const userFactory = require('../factories/userFactory');
const sessionFactory = require('../factories/sessionFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page)

        return new Proxy(customPage, {
            get: function (target, property) {
                return target[property] || browser[property] || page[property]
            }
        })
    }
    constructor(page) {
        this.page = page
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = await sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000');
        await this.page.waitFor('a.brand-logo');

    }
    async getContentOf(target) {
        return this.page.$eval(target, el => el.innerText);
    }
    get(path) {
        return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        }, path)
    }
    post(path, data) {
        return this.page.evaluate((_path, data) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(res => res.json());
        }, path, data)
    }
};
 
module.exports = CustomPage;