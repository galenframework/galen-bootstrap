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

