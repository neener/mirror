!function(e,t){typeof module!="undefined"?module.exports=t():typeof define=="function"&&typeof define.amd=="object"?define(t):this[e]=t()}("domready",function(){var e=[],t,n=document,r=n.documentElement.doScroll,i="DOMContentLoaded",s=(r?/^loaded|^c/:/^loaded|^i|^c/).test(n.readyState);return s||n.addEventListener(i,t=function(){n.removeEventListener(i,t),s=1;while(t=e.shift())t()}),function(t){s?t():e.push(t)}})

var canvas;
var ctx;
var getUserMedia;
var video;
var started = false;
var img = document.createElement('img');
	img.height = 480;
	img.width = 640;


function errorCallback(){
	document.body.removeChild(document.querySelector('#webcam'));
	if(document.querySelector('.blinder.left')) document.body.removeChild(document.querySelector('.blinder.left'));
	if(document.querySelector('.blinder.right'))document.body.removeChild(document.querySelector('.blinder.right'));
	document.body.setAttribute('class','');
}


function init(){

	canvas = document.getElementById('canvas');
	
	
	window.addEventListener('resize', resizeCanvas);

	navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;
	

	ctx = canvas.getContext('2d');
	requestUserMedia();
}	

function requestUserMedia(){
	window.setTimeout(function(){
		if (!started) errorCallback();
	}, 10000);

	if(navigator.getUserMedia){
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

	} else{
		video = img;
		  video.videoWidth = 640;
		  video.videoHeight = 480;
		  document.body.setAttribute('class', 'flash');
		  var left = document.body.appendChild(document.createElement('div'))
		  	  left.setAttribute('class', 'blinder left');

		  var right = document.body.appendChild(document.createElement('div'))
		  	  right.setAttribute('class', 'blinder right');
		  var w = (window.innerWidth - ((canvas.clientHeight / 2) * 0.980785)) / 2.1;
		  	  left.style.width = right.style.width = w + 'px';

		  	  window.addEventListener('resize', function(){
		  	  	  w = (window.innerWidth - ((canvas.clientHeight / 2) * 0.980785)) / 2.1;
		  	  	  left.style.width = right.style.width = w + 'px';
			  	});
		  var cam = document.getElementById('webcam');
		  var dim = window.innerHeight;
		    cam.style.height = 500 + 'px';
		  	cam.style.width = 900 + 'px';
		  	cam.style.left = cam.style.top = '50%';
		  	cam.style.marginTop = -250 + 'px';
		  	cam.style.marginLeft = -450 + 'px';

		  Webcam.set({
		  	width: 900,
		  	height: 500,
		  	dest_width: 900,
		  	dest_height: 500
		  });

		  Webcam.attach(
		  	'#webcam'
		  );

		  Webcam.on('live', function(){
		  	started = true;
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

function clipside(i, flash, data){
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
	if(!flash){
	var videoX = (((terminus.x - origin.x) / 2) + origin.x) - (video.videoWidth);
	var videoY = (((terminus.y - origin.y) / 2) + origin.y) - (video.videoHeight);
	} else{
	var videoX = (((terminus.x - origin.x) / 2) + origin.x) - (data.width);
	var videoY = (((terminus.y - origin.y) / 2) + origin.y) - (data.height);
	}

	flash ? ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, videoX, videoY, video.videoWidth * 2, video.videoHeight * 2) : ctx.putImageData(data, data.width, data.height, videoX, videoY, data.width * 2, data.height * 2) ;
	

	ctx.restore();




}

function clipedge(){

	ctx.beginPath();
	var r = (canvas.clientHeight / 2) * 0.980785;
	var rr = (canvas.clientHeight / 4) * 0.980785;
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
	var ratio = rr * 2 / video.videoHeight;
	var sourceX = (video.videoWidth - video.videoHeight) / 2,
		sourceY = 0;
	var destinationX = r - rr;
	ctx.drawImage(video, sourceX, sourceY, video.videoHeight, video.videoHeight, destinationX, destinationX + 5, rr * 2, rr * 2);

}

function drawFlash(){
	Webcam.snap(function(uri, canvas, context){
		// img.src = uri;
		// img.onload = function(){

			video = ctx;
			var imageData = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);

			for(var ii = 0, len = imageData.data.length / 4; ii += 4; ii < len){
				var r = imageData[i];
				var b = imageData[i + 2];

				imageData[i] = b;
				imageData[i + 2] = r;
			}

			for(var i = 0; i < 16; i ++){
				ctx.save();
				clipside(i, true, imageData);
			};

			window.requestAnimationFrame(drawFlash)
		// }
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
