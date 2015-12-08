load("basics.js");

function inSauceLabs(deviceName, tags, gridSettings) {
    return new Device({
        deviceName: deviceName,
        tags: tags,
        initDriver: function (url) {
            this.driver = createGridDriver(System.getProperty("saucelabs.url"), gridSettings);
            return this.driver;
        },
        quit: function () {
            this.driver.quit();
        }
    });
}

function getConfiguredSauceLabsDevices() {
    var devicesJson = JSON.parse(readFile("saucelabs-devices.json"));

    var devices = {};
    forMap(devicesJson, function (deviceName, deviceSettings) {
        devices[deviceName] = inSauceLabs(deviceSettings.deviceName, deviceSettings.tags, deviceSettings.gridSettings);
    });
}



(function (export) {
    export.getConfiguredSauceLabsDevices = getConfiguredSauceLabsDevices;
    export.inSauceLabs = inSauceLabs;
})(this);
