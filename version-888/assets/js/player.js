function initVideoPlayer(options) {
  const video = document.querySelector(options.videoSelector);
  const overlay = document.querySelector(options.overlaySelector);
  const button = document.querySelector(options.buttonSelector);
  let started = false;
  let hlsInstance = null;

  const start = function() {
    if (!video || started) {
      return;
    }

    started = true;

    if (overlay) {
      overlay.classList.add("hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.streamUrl;
      video.play().catch(function() {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(options.streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      return;
    }

    video.src = options.streamUrl;
    video.play().catch(function() {});
  };

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", function(event) {
      event.stopPropagation();
      start();
    });
  }

  if (video) {
    video.addEventListener("click", start);
  }

  window.addEventListener("pagehide", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
