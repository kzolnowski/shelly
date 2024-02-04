// This script is an extension for Auto Turn Off feature in Shelly settings.
// On single_push event auto turn off feature is enabled and lights are toggled after CONFIG.toggleTimeout seconds.
// With long_push event auto turn off feature is disabled and lights are on as long as you want until turning them off :)

let CONFIG = {
  toggleTimeout: 180,
  staircaseInputId: 0,
  hallwayInputId: 1,
  staircaseSwitchId: 0,
  hallwaySwitchId: 1,
  actionUrl: "http://192.168.20.14/rpc/Switch.Toggle?id=1",
};

let wasOn = false;

Shelly.call("Switch.SetConfig", {
  id: CONFIG.staircaseSwitchId,
  config: {
    in_mode: "detached",
  },
});

Shelly.call("Switch.SetConfig", {
  id: CONFIG.hallwaySwitchId,
  config: {
    in_mode: "detached",
  },
});

Shelly.addEventHandler(function (event) {
  if (typeof event.info.event === "undefined" || event.info.event === "ble.scan_result") return;
  if (event.info.component === "input:" + JSON.stringify(CONFIG.staircaseInputId)) {
    if (event.info.event === "single_push" && !wasOn) {
      Shelly.call(
        "Switch.Set",
        {
          id: CONFIG.staircaseSwitchId,
          on: true,
          toggle_after: CONFIG.toggleTimeout,
        },
        function (result, error_code, error_message) {
          if (error_code === 0) {
            console.log("Toggle timeout is set to " + JSON.stringify(CONFIG.toggleTimeout) + " seconds");
          } else {
            console.log("Error: " + error_message);
          }
        });
      } else if (event.info.event === "long_push" && !wasOn) {
        Shelly.call("Switch.Set", {id: CONFIG.staircaseSwitchId, on: false, toggle_after: 0.1});
      }
      if (event.info.event === "btn_down") {
        Shelly.call("Switch.Toggle", {id: CONFIG.staircaseSwitchId}, function (result) {
          wasOn = result.was_on;
        });
      }
    } else if (event.info.component === "input:" + JSON.stringify(CONFIG.hallwayInputId) && event.info.event === "btn_down") {
      Shelly.call("http.get", { url: CONFIG.actionUrl });
    }
  }
);