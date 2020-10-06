// require modules
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const puppeteer = require('puppeteer')
const base64Img = require('base64-img');



// invoke express method
const app = express()



// Middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))



// get Photo Api endpoint
app.post('/api/v1/getphoto', (req, res) => {

    // destructure request body
    const { name, address } = req.body

    // validate 
    if (!name || !address) {
        return res.json({
            success: false,
            message: "Fields must not be empty"
        })
    }

    // regex replace white space
    let query = `${name.replace(/\s/g, "+")}`;


    // init async scrape function
    let scrape = async() => {
        try {


            // launch puppeteer and prevent sandbox error
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disabled-setuid-sandbox'] })

            //open page
            const page = await browser.newPage()

            await page.goto(`https://www.google.com/search?q=${query}&tbm=isch`)

            await page.waitFor(1000)

            // get result
            const result = await page.evaluate(() => {

                // get image
                const base64image = document.querySelectorAll('.rg_i')[0].getAttribute('src')

                // return base64 image
                return {
                    base64image

                }
            })

            // close browser
            browser.close()
            return result

        } catch (error) {
            console.log(error)
        }
    }


    scrape().then(async(value) => {

            // decode base64 image
            base64Img.img(value.base64image, 'Images', `image-${Date.now()}`, function(err, filepath) {

                // check if error
                if (err) {
                    console.log(err)
                }

                // if no error
                return res.json({
                    imagePath: filepath,
                    address: address
                })

            });


        })
        .catch((error) => {
            console.log(error)
        })






})


// listen to port
port = 6000
app.listen(port, () => {
    console.log(`server running at port ${port}`)
})