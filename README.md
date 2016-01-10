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
        sizes: ["900x768", "920x768", "940x768", "1024x768"]
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



Long words testing
----------------------
When a website is supposed to be displayed in multiple countries with different languages it is an often problem that some long word in a specific element breaks the layout. It might not only be due to i18n support but this issue could happen due to user input. Fortunately this could be tested by replacing the elements with a long word (e.g. german "Freundschaftsbezeigungen") before checking layout. You don't have to rewrite your tests or spec for this type of testing. All you need to do is to mark the objects on your page for which it should replace a text with `long_word_test` group. This can be done using `@groups` section.


```gspec
@objects
    header                   #header .middle-wrapper
        logo                    #header-logo
        text                    h1
    menu                     #menu ul
        item-*                  li a
    content                  #content
    footer                   #footer

@groups
    long_word_test                  header.text,menu.item-*
```

In the example above we have marked a header text and all menu items as a group `long_word_test`. Now we need to check the layout using `checkLongWordsLayout` function.

```javascript
testOnAllDevices("Long Words. Welcome page test with", "/", function (driver, device) {
    checkLongWordsLayout({
        driver: driver, 
        spec: "homepage.gspec",
        tags: device.tags,
        excludedTags: device.excludedTags,
    });
});
```

As you can see the function is very simmilar to standard `checkLayout` function from Galen API. By default it replaces text with `"Freundschaftsbezeigungen"` word but you can change this behaviour in settings:

```javascript
$galen.settings.longWordsTesting.replaceText = "My_very_long_word";
```


Image Diff Based Testing
------------------------
Galen is also capable of testing images of individual parts of the page using [image spec](http://galenframework.com/docs/reference-galen-spec-language-guide/#Image). But it takes a bit more effort in this case as you have to prepare the sample images with which Galen will compare the actual image on screenshot. Galen Bootstrap provides another interesting image validation implementation. You can use `checkImageDiff` function in order to compare individual elements with previous images from previous test run. How is this possible? It works like this:

1. You need to mark the object with  `image_diff_validation` or `image_diff_validation_blur` groups. This way you can select which elements should be tested with this approach.
2. The first run gives error as there are obviously no images from previous test run. This is just a dry run to generate image samples.
3. In the end it creates a page dump and copies all images for all objects into specified storage.
4. Next time you run your tests it takes image samples from last iteration and uses them in order to compare with the current images on screenshot.
5. If something is different you will get an error in the report.

Here is an example of how to mark elements in gspec file:

```gspec
@objects
    header                   #header .middle-wrapper
        logo                    #header-logo
        text                    h1
    menu                     #menu ul
        item-*                  li a
    content                  #content
    footer                   #footer

@groups
    image_diff_validation           header.logo
    image_diff_validation_blur      menu.item-*,header.text
```

And the test:

```javascript
testOnAllDevices("Image Diff. Welcome page test", "/", function (driver, device) {
    checkImageDiff({
        driver: driver, 
        storage: "image-diff/welcome-page-" + device.deviceName, 
        spec: "homepage.gspec"
    });
});
```

In the example above we marked `header.logo` with `image_diff_validation` group but menu items and header text are marked with `image_diff_validation_blur` group. This means that different image specs will be applied to these elements. For header logo it will perform strict pixel-to-pixel comparison with 1 pixel denoise filter. And for the `image_diff_validation_blur` it will compare images with blur filter and offset analyzer making it less strict. You can change this behavior in settings and create your own image spec generators like this:

```javascript
$galen.settings.imageDiffSpecGenerators["image_diff_validation"] = function (imagePath) {
    return "image file " + imagePath + ", map-filter denoise 5, filter blur 2, error 5%";
};
```

It is very important to specify the correct storage for each device. That is why in the example above we added `device.deviceName` to the storage path: `storage: "image-diff/welcome-page-" + device.deviceName`. This way the images for different devices will not be overwritten.



