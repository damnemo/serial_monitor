chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    bounds: {
      top: 0,
      left: 0,
      width: 540,
      height: 720
    },
    "resizable": false,
  });
})
