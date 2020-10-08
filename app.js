// require modules
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const puppeteer = require('puppeteer')
const base64Img = require('base64-img');
const cheerio = require('cheerio')
const cheerioHttp = require('cheerio-httpcli')
const request = require('request')
let Html5Entities = require('html-entities').Html5Entities
let htmlEntities = new Html5Entities()


const proxyGenerator = require('./proxyGenerator');
const { json } = require('body-parser');



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
    let query = `${name.replace(/\s/g, "-")}`;


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


        // if no error
        console.log(genProxy)


        // init options
        const options = {
            url: `https://www.gettyimages.com/photos/${query}?family=creative`,
            method: "GET",
            // proxy: genProxy
        }




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


            const imageSrc = $('.gallery-asset__thumb').attr('src')

            // console.log(imageSrc)

            if (imageSrc) {
                //    return response
                return res.json({
                    image: imageSrc
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