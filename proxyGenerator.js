const cheerio = require('cheerio')
const request = require('request')



// init proxy Generator
const proxyGenerator = (cb) => {

    // init ip addresses and port number
    let ip_addresses = []
    let port_numbers = []


    // init request
    request('https://free-proxy-list.net/', (error, response, html) => {
        // check if error
        if (!error && response.statusCode == 200) {

            // load cheerio
            const $ = cheerio.load(html)

            $("td:nth-child(1)").each(function(index, value) {
                ip_addresses[index] = $(this).text();
            });

            $("td:nth-child(2)").each(function(index, value) {
                port_numbers[index] = $(this).text();
            });


        } else {
            console.log("Error loading proxies")
        }

        ip_addresses.join(", ");
        port_numbers.join(", ");


        // generate random number
        let random_number = Math.floor(Math.random() * 100);


        const proxy = `http://${ip_addresses[random_number]}:${port_numbers[random_number]}`

        return cb(null, proxy)


    })
}





// export module
module.exports = proxyGenerator