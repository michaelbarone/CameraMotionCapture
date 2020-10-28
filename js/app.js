var app = angular.module('website', ['ngAnimate', 'ui.bootstrap','ngTouch']);

app.controller('MainCtrl', function ($scope, $timeout, $interval, QueueService, $http, $q) {
    //var INTERVAL = 10000;
    var INTERVAL = 4000;
	// at 10000 INTERVAL, 360 is 1 check per hour
	var timeout;
	var timeoutP;
	var timeoutN;
	var timeoutMostRecent;
	var timeoutLastMotionCheck;
	
	$scope.functions = []


    function setCurrentSlideIndex(index) {
		$timeout.cancel(timeoutN);
		if(index <= $scope.slides.length - 1 || index >= 0){
			$scope.currentImageIndex = index;
		}
		timeoutN = $timeout(nextSlide, 30000);
    }

    function isCurrentSlideIndex(index) {
        return $scope.currentImageIndex === index;
    }

    function previousSlide() {
		$timeout.cancel(timeoutP);
		$scope.currentImageIndex = ($scope.currentImageIndex > 0) ? --$scope.currentImageIndex : 0;
		timeoutP = $timeout(previousSlide, INTERVAL);
    }

    function nextSlide() {
		$timeout.cancel(timeoutN);
		$scope.currentImageIndex = ($scope.currentImageIndex < $scope.slides.length - 1) ? ++$scope.currentImageIndex : 0;
		timeoutN = $timeout(nextSlide, INTERVAL);
    }

    function setCurrentAnimation(animation) {
        $scope.currentAnimation = animation;
    }

    function isCurrentAnimation(animation) {
		return $scope.currentAnimation === animation;
    }

	$scope.functions.loadLastMotion = function() {
		$timeout.cancel(timeoutLastMotionCheck);
		var lastMotion;
		$http({
		  method: 'GET',
		  url: './images/lastMotion.json'
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				lastMotion = value;
			});
			if(lastMotion!=$scope.lastMotion){
				$scope.lastMotion = lastMotion;
				$scope.functions.loadCameras();
			}
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadLastMotion (possible no previous motion capture or JSON file has not been created yet)");
			console.log("Load Cameras anyway");
			$scope.functions.loadCameras();
		});
		timeoutLastMotionCheck = $timeout($scope.functions.loadLastMotion, 300000);
	}
	$scope.functions.loadLastMotion();

    $scope.functions.loadCameras = function() {
		var cameras = [];		
		$http({
		  method: 'GET',
		  url: './data/getCameras.php'
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				cameras = cameras.concat({id:key, cameraName:value, motions:[]});
			});
			$scope.cameras = cameras
			$scope.functions.loadAllMotions();
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadCameras");
		});
	}

    $scope.functions.loadMotions = function(cameraName) {
		var motions = [];
		$scope.selectedCamera = cameraName;
		$scope.selectedCameraIndex = $scope.cameras.findIndex(x=>x.cameraName === cameraName);
		$http({
		  method: 'GET',
		  url: './data/getMotions.php?cameraName='+cameraName
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				motions = motions.concat({id:key, motionTime:value});
			});
			$scope.cameras[$scope.selectedCameraIndex].motions = motions;
			var lastMotion = motions[motions.length-1].motionTime;
			$scope.cameras[$scope.selectedCameraIndex].lastMotion = lastMotion;			
			$scope.functions.getImages(cameraName,lastMotion);
			$timeout(scrollMotionEvents,500);
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on loadMotions");
		});
	}

    $scope.functions.loadAllMotions = function() {
		var mostRecentCamera = 0;
		var mostRecentMotionTime = 0;
		var promisesToResolve = $scope.cameras.length;
		var promisesResolve = 0;
		angular.forEach($scope.cameras, function(value, key){
			var cameraName = value.cameraName;
			var motions = [];
			$http({
			  method: 'GET',
			  url: './data/getMotions.php?cameraName='+cameraName
			}).then(function successCallback(response) {
				// RESPONSE CONTAINS YOUR FILE LIST
				angular.forEach(response.data, function (value, key) {
					motions = motions.concat({id:key, motionTime:value});
				});
				var lastMotion = motions[motions.length-1].motionTime;

				if(lastMotion>mostRecentMotionTime){
					mostRecentMotionTime = lastMotion;
					mostRecentCamera = value.cameraName;
				}

				$scope.cameras[key].motions = motions;
				$scope.cameras[key].lastMotion = lastMotion;
				
				promisesResolve++;
				if (promisesResolve == promisesToResolve) {
					// skip if recently active on the interface ~ 3 minutes
					if(Date.now() - $scope.lastInteraction > 200000){
						setMostRecentMotion(mostRecentCamera,mostRecentMotionTime);
					}
				}
			}, function errorCallback(response) {
				// ERROR CASE
				console.log("error on loadMotions");
			});
		});
	}

	function setMostRecentMotion(mostRecentCamera,mostRecentMotionTime){
		$scope.selectedCamera = mostRecentCamera;
		$scope.selectedCameraIndex = $scope.cameras.findIndex(x=>x.cameraName === mostRecentCamera);
		$scope.functions.getImages(mostRecentCamera,mostRecentMotionTime);
		$timeout(scrollMotionEvents,500);
	}

	function scrollMotionEvents(){
		var left = $('#MotionEvents > div').width();
		$('#MotionEvents > div').scrollLeft(left);		
	}

    $scope.functions.getImages = function(cameraName,motionTime) {
		$scope.lastInteraction = Date.now();
		$scope.selectedMotionTime = motionTime;
		var fileValue = "";
		var fileValueExplode = [];
		var images = [];
		// load slides
		$http({
		  method: 'GET',
		  url: './data/getImages.php?cameraName='+cameraName+'&motionTime='+motionTime
		}).then(function successCallback(response) {
			// RESPONSE CONTAINS YOUR FILE LIST
			angular.forEach(response.data, function (value, key) {
				fileValueExplode = value.split('.');
				fileValue = fileValueExplode.join();
				images = images.concat({id:fileValue, src:"./images/"+cameraName+"/"+motionTime+"/"+value});
			});
			//console.log(images);
			QueueService.loadManifest(images);
		}, function errorCallback(response) {
			// ERROR CASE
			console.log("error on getImages");
		});		
    }

    $scope.$on('queueComplete', function(event, slides) {
        $scope.$apply(function(){
            $scope.slides = slides;
            $scope.loaded = true;
			//get random start point in $scope.slides
			$scope.currentImageIndex = 0;
			//console.log($scope.currentImageIndex);
            timeoutN = $timeout(nextSlide, INTERVAL);
        });
    });

    $scope.progress = 0;
	$scope.progressBarText = "Loading";
    $scope.loaded = false;
    $scope.currentImageIndex = 0;
	$scope.cameras = [];
	$scope.slides = [];
	$scope.selectedCamera = "";
	$scope.selectedCameraIndex = -1;
	$scope.selectedMotionTime = "";
	$scope.lastInteraction = 0;

    //$scope.currentAnimation = 'slide-left-animation';
    //$scope.currentAnimation = 'slide-down-animation';
    $scope.currentAnimation = 'fade-in-animation';

    $scope.setCurrentSlideIndex = setCurrentSlideIndex;
    $scope.isCurrentSlideIndex = isCurrentSlideIndex;
    $scope.setCurrentAnimation = setCurrentAnimation;
    $scope.isCurrentAnimation = isCurrentAnimation;
});

app.factory('QueueService', function($rootScope){
    var queue = new createjs.LoadQueue(true);
	queue.setMaxConnections(10);
	
    function loadManifest(manifest) {
        queue.loadManifest(manifest);

        queue.on('progress', function(event) {
            $rootScope.$broadcast('queueProgress', event);
        });

        queue.on('complete', function() {
            $rootScope.$broadcast('queueComplete', manifest);
        });
    }
    return {
        loadManifest: loadManifest
    }
});

app.animation('.slide-left-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { left: $window.innerWidth}, {left: 0, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {left: -$window.innerWidth, onComplete: done});
        }
    };
});

app.animation('.slide-down-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { top: -$window.innerHeight}, {top: 0, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {top: $window.innerHeight, onComplete: done});
        }
    };
});

app.animation('.fade-in-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, .5, { opacity: 0}, {opacity: 1, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, .5, {opacity: 0, onComplete: done});
        }
    };
});

app.directive('bgImage', function ($window, $timeout) {
    return function (scope, element, attrs) {
		
		//get image height and width, compare against window.innerH/W.
		//set either height or width of element to corresponding window.innerH/W
		
		
		var resizeBG = function () {
            var bgwidth = element.width();
            var bgheight = element.height();
			var aspect = "horizontal";
			
			if(bgwidth < bgheight){
				aspect = "vertical"
			}

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight * .8;
		
            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: 'auto',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: 'auto'
                });
            }		
		};
		
		/*
        var resizeBG = function () {
            var bgwidth = element.width();
            var bgheight = element.height();

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight;

            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: winwidth + 'px',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: winheight + 'px'
                });
            }
        };
		*/

	
	/*
        var windowElement = angular.element($window);
        windowElement.resize(resizeBG);

		angular.element(document).ready(function () {
			resizeBG();
		});

        element.bind('load', function () {
            resizeBG();
        });
	*/
    }
});