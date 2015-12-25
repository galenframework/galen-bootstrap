load("basics.js");

function Device(settings) {
    this.deviceName = settings.deviceName;
    this.tags = settings.tags;
    this.excludedTags = settings.excludedTags;
    this.initDriver = settings.initDriver;
    this.quit = settings.quit;
}
Device.prototype.withProperty = function (propName, value) {
    this[propName] = value;
    return this;
};

function inLocalBrowser(name, size, tags, browserType) {
    return new Device({
        deviceName: name,
        tags: tags,
        size: size,
        initDriver: function (url) {
            this.driver = createDriver(url, size, browserType);
            return this.driver;
        },
        quit: function () {
            this.driver.quit();
        }
    });
}

function inSeleniumGrid(gridUrl, deviceName, tags, gridSettings) {
    return new Device({
        deviceName: deviceName,
        tags: tags,
        initDriver: function (url) {
            this.driver = createGridDriver(gridUrl, gridSettings);
            return this.driver;
        },
        quit: function () {
            this.driver.quit();
        }
    });
}


var _globalSingleDriver = null;
function inSingleBrowser(name, size, tags) {
    return new Device({
        deviceName: name,
        tags: tags,
        size: size,
        initDriver: function (url) {
            if (_globalSingleDriver === null) {
                _globalSingleDriver = createDriver(url, size);
            }
            this.driver = _globalSingleDriver;

            if (url !== null) {
                this.driver.get(url);
            }
            
            if (size !== null) {
                resize(this.driver, size);
            }

            return this.driver;
        },
        quit: function () {
        }
    });
}
afterTestSuite(function () {
    if (_globalSingleDriver !== null) {
        _globalSingleDriver.quit();
        _globalSingleDriver = null;
    }
});


(function (export) {
    export.inLocalBrowser = inLocalBrowser;
    export.inSeleniumGrid = inSeleniumGrid;
    export.inSingleBrowser = inSingleBrowser;
    export.Device = Device;
})(this);
