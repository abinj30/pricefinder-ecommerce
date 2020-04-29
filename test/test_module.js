const {assert} = require('chai');
const pricefinder = require("../index");

const flipkartUrl = "https://www.flipkart.com/poco-x2-phoenix-red-128-gb/p/itm399dc084bcc97?pid=MOBFZGJ6AXGFTJSC";
const amazonUrl = "https://www.amazon.in/dp/B084456GH4";

describe('Pricefinder', function() {
   //Tests for Flipkart
   describe('Flipkart', function() {
      let product;
      before(async function() {
         product = await pricefinder(flipkartUrl, "flipkart");
      });
      
      it('Checking Product Code', function() {
         assert.equal(product.productCode, "MOBFZGJ6AXGFTJSC");
      });
      it('Checking Name', function() {
         assert.equal(product.name.replace(/\s+/g, ''), "POCOX2(PhoenixRed,128GB)(6GBRAM)");
      });
      it('Availability must be Boolean', function() {
         assert.isBoolean(product.available);
      });
      it('Price must be a number if product available', function() {
         if(product.available) {
            assert.isNumber(product.price);
         } else {
            assert.isTrue(true);
         }
      });
   });
   //Tests for Amazon
   describe('Amazon', function() {
      let product;
      before(async function() {
         this.timeout(5000);
         product = await pricefinder(amazonUrl, "amazon");
      });
      
      it('Checking Product Code', function() {
         assert.equal(product.productCode, "B084456GH4");
      });
      it('Checking Name', function() {
         assert.equal(product.name, "Samsung Galaxy Z Flip (Gold, 8GB RAM, 256GB Storage) with No Cost EMI/Additional Exchange Offers");
      });
      it('Availability must be Boolean', function() {
         assert.isBoolean(product.available);
      });
      it('Price must be a number if product available', function() {
         if(product.available) {
            assert.isNumber(product.price);
         } else {
            assert.isTrue(true);
         }
      });
   });
});