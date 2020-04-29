const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const {assert, expect} = chai;
const pricefinder = require("../index");

describe("Pricefinder", function() {
   var tests = [
      {
         url: "https://www.flipkart.com/poco-x2-phoenix-red-128-gb/p/itm399dc084bcc97?pid=MOBFZGJ6AXGFTJSC",
         website: "flipkart",
         productCode: "MOBFZGJ6AXGFTJSC",
         name: "POCOX2(PhoenixRed,128GB)(6GBRAM)"
      },
      {
         url: "https://www.amazon.in/dp/B084456GH4",
         website: "amazon",
         productCode: "B084456GH4",
         name: "SamsungGalaxyZFlip(Gold,8GBRAM,256GBStorage)"
      }
   ]

   tests.forEach((test, index) => {
      describe(`Product ${index}`, function() {
         let product;
         before(async function() {
            this.timeout(5000);
            product = await pricefinder(test.url, test.website);
         });
         
         it("Checking Product Code", function() {
            assert.equal(product.productCode, test.productCode);
         });
         it("Checking Name", function() {
            assert.isTrue(product.name.replace(/\s+/g, "").includes(test.name));
         });
         it("Availability must be Boolean", function() {
            assert.isBoolean(product.available);
         });
         it("Price must be a number if product available", function() {
            if(product.available) {
               assert.isNumber(product.price);
            } else {
               assert.isTrue(true);
            }
         });
      });
   });
   
   describe("Error Handling", function() {      
      it("Invalid Website", async function() {
         expect(async function() {
            return pricefinder("https://www.amazon.in/dp/B084456GH4", "something");
         }()).to.be.rejectedWith(Error);
      });

      it("Invalid Url Amazon 1", async function() {
         expect(async function() {
            return pricefinder("https://www.amazon.com/dp/B084456GH4", "amazon");
         }()).to.be.rejectedWith(Error);
      });

      it("Invalid Url Amazon 2", async function() {
         expect(async function() {
            return pricefinder("https://www.amazon.in/productsomething/B084456GH4", "amazon");
         }()).to.be.rejectedWith(Error);
      });

      it("Invalid Url Flipkart 1", async function() {
         expect(async function() {
            return pricefinder("https://www.flipkart.com/poco-x2-phoenix-red-128-gb/p", "amazon");
         }()).to.be.rejectedWith(Error);
      });

      it("Invalid Url Flipkart 2", async function() {
         expect(async function() {
            return pricefinder("https://www.flipkart.com/poco-x2-phoenix-red-128-gb/p/itm399dc084bcc97?pid", "amazon");
         }()).to.be.rejectedWith(Error);
      });
   });
});