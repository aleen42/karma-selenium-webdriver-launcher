function SeleniumWebdriverBrowser(baseBrowserDecorator, args, logger) {
    const self = this, log = logger.create('launcher.selenium-webdriver');
    baseBrowserDecorator(self);

    let killingPromise;

    self._start = url => {
        args.getDriver().then(function (driver) {
            self.driver_ = driver;
            driver.get(url);
        });
    };

    self.kill = () => {
        // Already killed, or being killed.
        return (killingPromise = (killingPromise || Promise.resolve()).then(() => new Promise(resolve => {
            self.getSession_(session => {
                if (session) {
                    log.info('requested to kill, session id is ' + (session.id_));

                    if (session && session.id_) {
                        self.driver_ && self.driver_.quit();
                        resolve();
                    }
                }
            });
        })));
    };

    self.forceKill = () => {
        self.kill();
        return killingPromise;
    };

}

SeleniumWebdriverBrowser.$inject = ['baseBrowserDecorator', 'args', 'logger'];

Object.assign(SeleniumWebdriverBrowser.prototype, {
    getSession_(cb) {
        const driver = this.driver_;

        if (!driver) {
            return cb(null);
        }

        if (driver.session_ && driver.session_.then) {
            driver.session_.then(cb);
        } else {
            cb(driver.session_);
        }
    },

    isCaptured() {
        return !!this.driver_;
    },
});

// PUBLISH DI MODULE
module.exports = {
    'launcher:selenium-webdriver' : ['type', SeleniumWebdriverBrowser],
};
