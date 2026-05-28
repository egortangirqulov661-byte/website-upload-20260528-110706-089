function initVideo(videoId, buttonId, mediaUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  if (!video || !mediaUrl) {
    return;
  }
  let engine = null;
  const attach = function () {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      engine = new Hls({ enableWorker: true });
      engine.loadSource(mediaUrl);
      engine.attachMedia(video);
      return;
    }
    video.src = mediaUrl;
  };
  const start = async function () {
    if (button) {
      button.classList.add('is-hidden');
    }
    if (!video.src && !engine) {
      attach();
    }
    try {
      await video.play();
    } catch (error) {
      if (button) {
        button.classList.remove('is-hidden');
      }
    }
  };
  attach();
  if (button) {
    button.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });
}
