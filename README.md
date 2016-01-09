Galen Bootstrap
==================


Galen Bootstrap is a simple JavaScript layout testing framework based on Galen Framework. It makes it easier to get started with layout testing for responsive website and also provides functionality for the following types of testing:

* Image Diff testing. Comparing images from previous iteration
* Long words layout testing. Inserting long words in selected page elements and testing that the layout did not break. Usefull for websites that are supposed to be translated to different languages
* Browser size variations testing with randomization support


Configuring
---------------------
Download the [galen-bootstrap](https://github.com/galenframework/galen-bootstrap/tree/master/galen-bootstrap) directory and copy it to your test project. After this you can create an `init.js` script where you will load the `galen-bootstrap/galen-bootstrap.js` script and configure all devices and a website url for testing.

```javascript
load("galen-bootstrap/galen-bootstrap.js");

$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevice("mobile", inLocalBrowser("mobile emulation", "450x800", ["mobile"]));
$galen.registerDevice("tablet", inLocalBrowser("tablet emulation", "600x800", ["tablet"]));
$galen.registerDevice("desktop", inLocalBrowser("desktop emulation", "1024x768", ["desktop"]));
```

In the example above we have declared a test website "[http://testapp.galenframework.com](http://testapp.galenframework.com)" and also registered 3 devices: `mobile`, `tablet`, `desktop`. All devices and settings are stored in `$galen` object.


Simplest layout test
---------------------
Just create a homePage.test.js file and load your `init.js` script. In order to declare a test that will run on all devices you need to use `testOnAllDevices` function.

```javascript
load("init.js");

testOnAllDevices("Welcome page test", "/", function (driver, device) {
    // Here the driver will be provided and you don't have to take care of it
    // Also once the test finishes it will automatically quit the driver.

    // Here we call standard checkLayout function from Galen Api (http://galenframework.com/docs/reference-galen-javascript-api/#checkLayout)
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});
```

`testOnAllDevices` function takes free parameters:
1. testNamePrefix - a name that will be used in resulting reports
2. Resource path. A starting page for test. 
3. test callback. A function that will be called when the test is executed. This callback should take 2 arguments: a webdriver and a device on which this test is executed

The above example will execute "Welcome page test" on all registered devices. Each devices has its own tags and you can pass these tags to `checkLayout` function from `device.tags`.
But if you want to run your test only on specific devices, then you have to use `testOnDevice` function and pass a device as a first argument to it:

```javascript
testOnDevice($galen.devices.mobile, "Welcome page test", "/", function (driver, device) {
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});
```

If you need to select an array of devices then the best way to do it is using `testOnDevices` function and pass an array of devices as a first argument:

```javascript
testOnDevice([
    $galen.devices.mobile,
    $galen.devices.tablet
    ], "Welcome page test", "/", function (driver, device) {
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});
```


Browser sizes variations testing
--------------------
It might be also handy to test your website on different sizes. for this case you can use `checkMultiSizeLayout` function.

```javascript
testOnDevice($galen.devices.desktop, "Welcome page test", "/", function (driver, device) {
    checkMultiSizeLayout({ 
        driver: driver,
        spec: "homepage.gspec",
        tags: device.tags,
        excludedTags: device.excludedTags,
        sizes: ["900x768", "920x768", 940x768", "1024x768"]
    });
});
```

`checkMultiSizeLayout` function takes a single argument which has the following fields:

* *driver* - a WebDriver instance
* *spec* - a path to spec file
* *tags* - an array of tags
* *excludedTags* - an array of tags that should be excluded
* *sizes* - an array of sizes

The above example will run layout test 4 times and each time it will resize browser with the declared size from each iteration

But it might be easier to declare a range of sizes and use `sizeVariations` to generate an array of size from that range:

```javascript
$galen.registerDevice("desktop", inSingleBrowser("desktop emulation", "1024x768", ["desktop"]));
$galen.devices.desktop.sizeRange = ["900x600", "1200x768"];

testOnAllDevices("Welcome page test", "/", function (driver, device) {
    checkMultiSizeLayout({ 
        driver: driver,
        spec: "homepage.gspec",
        tags: device.tags,
        excludedTags: device.excludedTags,
        sizes: sizeVariations(device.sizeRange, 8)
    });
});

```
`sizeVariations` function is used in order to generate an array of sizes between specified range. Takes two arguments:
1. sizeRange - An array of 2 strings. e.g. ["450x600", "600x600"]
2. iterationAmount - an amount of generated variations. If not defined then it will generate all possible variations based on width.


Random size testing
--------------------
Not always it is usefull to run all your tests on all possible browser sizes. It might just take too much time and resources. But if you still want to cover all of possible size but execute less tests you can use `sizeRandomVariations` function. It works the same way as `sizeVariations` but adds small randomization for each iteration.

```javascript
$galen.registerDevice("desktop", inSingleBrowser("desktop emulation", "1024x768", ["desktop"]));
$galen.devices.desktop.sizeRange = ["900x600", "1200x768"];

testOnAllDevices("Welcome page test", "/", function (driver, device) {
    checkMultiSizeLayout({ 
        driver: driver,
        spec: "homepage.gspec",
        tags: device.tags,
        excludedTags: device.excludedTags,
        sizes: sizeRandomVariations(device.sizeRange, 6)
    });
});
```

In the above example it will take delta = (1200 - 900) / 6 and will use this value to create a random size within this delta range. For instance in that particular example the delta will be 50 and we will get 6 iterations: 900 + random of 50, 950 + random of 50, 1000 + random of 50 etc. It could be something like: [912, 951, 1046, 1059, 1132, 1900]




