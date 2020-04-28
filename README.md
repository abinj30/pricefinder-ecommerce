# pricefinder
![Node.js Package](https://github.com/abinj30/pricefinder/workflows/Node.js%20Package/badge.svg)

Node module to fetch price of Flipkart/Amazon product given their URL

## Usage
```js
const pricefinder = require('@abinj30/pricefinder');
const product = await pricefinder.getProduct("https://www.amazon.in/dp/B084456GH4", "amazon");

console.log(product.name)
// Samsung Galaxy Z Flip (Gold, 8GB RAM, 256GB Storage) with No Cost EMI/Additional Exchange Offers
console.log(product.price) //in INR
// 109999
console.log(product.isAvailable)
// true
console.log(product.productCode)
// B084456GH4
```
