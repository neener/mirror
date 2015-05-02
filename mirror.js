!function(e,t){typeof module!="undefined"?module.exports=t():typeof define=="function"&&typeof define.amd=="object"?define(t):this[e]=t()}("domready",function(){var e=[],t,n=document,r=n.documentElement.doScroll,i="DOMContentLoaded",s=(r?/^loaded|^c/:/^loaded|^i|^c/).test(n.readyState);return s||n.addEventListener(i,t=function(){n.removeEventListener(i,t),s=1;while(t=e.shift())t()}),function(t){s?t():e.push(t)}})



var canvas;
var ctx;
var getUserMedia;
var video;
var img = document.createElement('img');
	img.height = 480;
	img.width = 640;



function init(){

	canvas = document.getElementById('canvas');
	// resizeCanvas();
	
	window.addEventListener('resize', resizeCanvas);

	navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

	ctx = canvas.getContext('2d');
	requestUserMedia();
}	

function requestUserMedia(){
	if (navigator.getUserMedia) {
	  	navigator.getUserMedia({audio: false, video: true}, function(localMediaStream) {
	    video = document.createElement('video');
		video.autoplay = true;
	    video.src = window.URL.createObjectURL(localMediaStream);
	    video.addEventListener('loadedmetadata', function(){

		    video.width = video.videoWidth;
		    video.height = video.videoHeight;

		    var dim = video.width >= video.height ? video.height : video.width;
		    canvas.height = canvas.width = dim * 4;
		    resizeCanvas();
		    window.requestAnimationFrame(draw);
	    });
	  }, errorCallback);
	} else {
	  video = img;
	  video.videoWidth = 640;
	  video.videoHeight = 480;
	  document.body.setAttribute('class', 'flash');
	  document.body.appendChild(document.createElement('div')).setAttribute('class', 'blinder left');
	  document.body.appendChild(document.createElement('div')).setAttribute('class', 'blinder right');
	  var cam = document.getElementById('webcam');
	  var dim = window.innerHeight;
	    cam.style.height = dim * 0.666667 + 'px';
	  	cam.style.width = dim * 0.666667 * 1.75 + 'px';
	  	cam.style.left = cam.style.top = '50%';
	  	cam.style.marginTop = (-0.5 * (dim * 0.666667)) + 'px';
	  	cam.style.marginLeft = (-0.5 * (dim * 0.666667 * 1.75)) + 'px';

	  Webcam.set({
	  	width: (dim * 0.666667) * 1.75,
	  	height: dim * 0.666667,
	  	dest_width: 640,
	  	dest_height: 480,
	  	force_flash: true
	  });

	  Webcam.attach(
	  	'#webcam'
	  );

	  Webcam.on('live', function(){
	  	document.body.setAttribute('class', 'flash loaded');
	  	window.requestAnimationFrame(drawFlash);
	  });
	}
}

function resizeCanvas(){
	var factor = (document.body.clientHeight >= document.body.clientWidth ? document.body.clientHeight / canvas.height : document.body.clientWidth / canvas.width) + 0.05;
	var translate = -50/factor;
	canvas.setAttribute('style', 'transform: scale(' + factor + ') translate('+ translate +'%,' + translate + '%)');
}

function clipside(i){
	ctx.beginPath();
	var r = (canvas.clientHeight / 2) * 0.980785;
	var rr = (canvas.clientHeight / 4) * 0.980785;
	
	var offset = canvas.clientHeight / 2;

	
		var angle = 2 * Math.PI * (i + 0.5) / 16;
		var x = rr * Math.cos(angle) + r;
		var y = rr * Math.sin(angle) + r + 13;

		ctx.moveTo(x, y);
		var xx = r * Math.cos(angle) + r;
		var yy = r * Math.sin(angle) + r + 13;
		ctx.lineTo(xx, yy);
		var aa = 2 * Math.PI * (i + 1.5) / 16;
		var xxx = r * Math.cos(aa) + r;
		var yyy = r * Math.sin(aa) + r + 13;
		var xxxx = rr * Math.cos(aa) + r;
		var yyyy = rr * Math.sin(aa) + r + 13;
		ctx.lineTo(xxx, yyy);
		ctx.lineTo(xxxx, yyyy);

	var origin = { x: Math.min(x, xx, xxx, xxxx), y: Math.min(y, yy, yyy, yyyy)},
		terminus = {x: Math.max(x, xx, xxx, xxxx), y: Math.max(y, yy, yyy, yyyy)};
	
	ctx.closePath();
	ctx.clip();
	//top left corner of bounding box, - 1/2 width of image, - 1/2 width of bounding box
	var videoX = (((terminus.x - origin.x) / 2) + origin.x) - (video.videoWidth * 1.5 / 2);
	var videoY = (((terminus.y - origin.y) / 2) + origin.y) - (video.videoHeight * 1.5 / 2);

	ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, videoX, videoY, video.videoWidth * 1.5, video.videoHeight * 1.5);
	ctx.restore();


	// ctx.beginPath();
	// ctx.moveTo(videoX, videoY);
	// ctx.lineTo(videoX + video.videoWidth, videoY);
	// ctx.lineTo(videoX + video.videoWidth, videoY + video.videoHeight);
	// ctx.lineTo(videoX, videoY + video.videoHeight);
	// ctx.closePath();
	// ctx.strokeStyle = "green";
	// ctx.stroke();
	// ctx.beginPath();
	// ctx.moveTo(origin.x, origin.y);
	// ctx.lineTo(terminus.x, origin.y);
	// ctx.lineTo(terminus.x, terminus.y);
	// ctx.lineTo(origin.x, terminus.y);
	// ctx.closePath();
	// ctx.strokeStyle = "red";
	// ctx.stroke();

}

function clipedge(){

	ctx.beginPath();
	var r = (canvas.clientHeight / 2) * 0.980785;
	var xmin,
		xmax,
		ymin,
		ymax;

	for(var i = 0; i < 16; i++){
		var angle = 2 * Math.PI * (i + 0.5) / 16;
		var x = r * Math.cos(angle) + r;
			xmin = xmin || x;
			xmax = xmax || x;
			xmin = x < xmin ? x : xmin;
			xmax = x > xmax ? x: xmax;
		var y = r * Math.sin(angle) + r + 13;
			ymin = ymin || y;
			ymax = ymax || y;
			ymin = y < ymin ? y : ymin;
			ymax = y > ymax ? y : ymax;
		i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
	}
	ctx.closePath();
	ctx.clip();
	var sourceX = (video.videoWidth - video.videoHeight) / 2,
		sourceY = 0;
	ctx.drawImage(video, sourceX, sourceY, video.videoWidth, video.videoHeight, 0, 0, video.videoWidth * 4, video.videoHeight * 4);
}


function drawFlash(){
	Webcam.snap(function(uri){
		img.src = uri;
		img.onload = function(){


			for(var i = 0; i < 16; i ++){
				ctx.save();
				clipside(i);
			};

			window.requestAnimationFrame(drawFlash)
		}
	})
}

function draw() {
	ctx.save();
	clipedge();
	ctx.restore();
	for(var i = 0; i < 16; i ++){
		ctx.save();
		clipside(i);
	};
	window.setTimeout(function(){window.requestAnimationFrame(draw)}, 100);
}

domready(function(){
	init();
})
