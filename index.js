const request = require("request-promise");
const {load} = require("cheerio");

class Product{
    constructor(htmlBody, url) {
        this.price = null;
        this.name = null;
        this.$ = load(htmlBody);
        this.url = url;
    }

    _parseData() {
        this._parseName();
        this._parsePrice();
        this._parseAvailability();
    }

    _parsePrice(){
        for (let selector of this.priceElSelectors) {
            var selectedText = this.$(selector).text();
            if (selectedText) break;
        }
        let priceString = selectedText.replace(this.priceReplRegex, "");
        const price = parseFloat(priceString);
        if(isNaN(price)) {
            throw new Error("Unable to parse the price");
        }else {
            this.price = price;
        }
    }

    _parseName() {
        const selectedText = this.$(this.nameElSelector).text();
        this.name = selectedText.trim();
    }

    _parseAvailability(){
        let selectedText = this.$(this.availabilitySelector).text();
        this.isAvailable = !selectedText.includes(this.notAvailableStr);
    }
}

class FlipkartProduct extends Product{

    priceReplRegex = /₹|&#x20B9|;|,/gi;
    priceElSelectors = ["._1vC4OE._3qQ9m1"];
    dealPriceSelector = null;
    nameElSelector = "._35KyD6";
    availabilitySelector = "._9-sL7L";
    notAvailableStr = "Sold Out";

    constructor(htmlBody, url, productCode) {
        super(htmlBody, url);
        this.productCode = productCode;
        this._parseData();
    }
}

FlipkartProduct.urlPatterns = [/http[s]*:[\/]{2}www\.flipkart\.com\/.*\?[pid=]+[a-z0-9]{16}/i];
FlipkartProduct.domain = "www.flipkart.com";

FlipkartProduct.getProductCode = function(url) {

    const urlPatterns = FlipkartProduct.urlPatterns;
    const pidLength = 16;

    for (let pattern of urlPatterns) {
        match = url.match(pattern);
        if (match) break;
    }

    if(match === null) {
        return null;
    } else {
        const string = match[0];
        return string.slice(string.length - pidLength);
    }
}

class AmazonProduct extends Product{

    priceReplRegex = /₹| |,/gi;
    priceElSelectors = ["#priceblock_ourprice", "#priceblock_dealprice", "#priceblock_saleprice"];
    nameElSelector = "#productTitle";
    availabilitySelector = "#availability";
    notAvailableStr = "Currently unavailable";

    constructor(htmlBody, url, productCode) {
        super(htmlBody, url);
        this.productCode = productCode;
        this._parseData();
    }
}

AmazonProduct.urlPatterns = [
    /http[s]*:[\/]{2}www\.amazon\.in\/gp\/product\/.{10}/i,
    /http[s]*:[\/]{2}www\.amazon\.in\/dp\/.{10}/i,
    /http[s]*:[\/]{2}www\.amazon\.in\/.*\/dp\/.{10}/i
];
AmazonProduct.domain = "www.amazon.in";

AmazonProduct.getProductCode = function(url) {

    const urlPatterns = AmazonProduct.urlPatterns;
    const pidLength = 10;

    let match = null;
    for (pattern of urlPatterns) {
        match = url.match(pattern);
        if (match) break;
    }

    if(match === null) {
        return null;
    } else{
        const string = match[0];
        return string.slice(string.length - pidLength);
    }
}

const supportedWebsites = {
    "flipkart": FlipkartProduct,
    "amazon": AmazonProduct
};

const requestHeaders = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3", 
    "Accept-Language": "en,ml;q=0.9",
    "Accept-Encoding": "br;q=1.0, gzip;q=0.8, *;q=0.1",
    "Dnt": "1", 
    "Referer": "https://www.google.co.in/", 
    "Sec-Fetch-Mode": "navigate", 
    "Sec-Fetch-Site": "none", 
    "Upgrade-Insecure-Requests": "1", 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
};

async function getProduct(url, website) {

    if(!Object.keys(supportedWebsites).includes(website)) {
        throw new Error(website + " is not currently supported!");
    }
    const ProductClass = supportedWebsites[website];

    const productCode = ProductClass.getProductCode(url);
    if(!productCode) {
        throw new Error("Invalid URL");
    }

    const params = {url:url, gzip:true, headers:requestHeaders}

    try {
        var htmlBody = await request(params);
    } catch (error) {
        console.error(error.message);
        throw new Error("Url download failed");
    }

    return new ProductClass(htmlBody, url, productCode);
}

module.exports = {getProduct, supportedWebsites}