navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

var errorCallback = function(e) {
			console.log('reeejected!', e);
		};

var video = document.querySelector('video');

if (navigator.getUserMedia) {
  navigator.getUserMedia({audio: false, video: true}, function(localMediaStream) {
    video.src = window.URL.createObjectURL(localMediaStream);
  }, errorCallback);
} else {
  video.src = 'somevideo.webm'; // fallback.
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var image = document.getElementById('source');

ctx.drawImage(image, 0, 0);









