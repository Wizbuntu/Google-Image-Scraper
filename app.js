// require modules
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const puppeteer = require('puppeteer')
const base64Img = require('base64-img');
const cheerio = require('cheerio')
const request = require('request')


const proxyGenerator = require('./proxyGenerator');
const { html } = require('cheerio');



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


    // invoke Proxy generator
    proxyGenerator((error, genProxy) => {
        // if error
        if (error) {
            console.log(error)
            return res.status(404).json({
                success: false,
                error: error
            })
        }



        // // manual proxy
        // let manualProxy = [
        //     "http://34.94.11.201:3128", "http://212.87.220.2:3128"
        // ]


        // init options
        const options = {
            url: `https://www.google.com/search?q=${query}&tbm=isch`,
            method: "GET",
            proxy: genProxy
        }

        console.log(genProxy)


        // init request
        request(options, (error, response, html) => {
            if (error) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                })
            }

            // if no error
            //load cheerio
            const $ = cheerio.load(html)

            // get imageSrc
            const imageSrc = $('.RAyV4b img').attr('src')

            if (imageSrc) {
                return res.json({
                    success: true,
                    imageUrl: imageSrc
                })
            } else {
                return res.json({
                    success: false,
                    imageUrl: "Image Not Found"
                })
            }
        })
    })



})






// listen to port
port = 6000
app.listen(port, () => {
    console.log(`server running at port ${port}`)
})