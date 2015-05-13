'use strict';

angular.module('ng-virtual-keyboard', [])

.constant('NGVK_CONFIG', {
	/*jshint maxlen:500 */
	'keyboard': 'qwerty',
	'plugin': 'form'
})

.service('ngVirtualKeyboardService', ['NGVK_CONFIG', function(NGVK_CONFIG) {
	return {
		attach: function(element, config, inputCallback) {
			config = config || {};
			config.keyboard = config.keyboard || NGVK_CONFIG.keyboard;
			config.plugin = config.plugin || NGVK_CONFIG.plugin;
			
			$('body').keyboard(config);
		}
	};
}])

.directive('ngVirtualKeyboard', ['ngVirtualKeyboardService', '$timeout', '$injector',
	function(ngVirtualKeyboardService, $timeout, $injector) {
	return {
		restrict: 'A',
		require : '?ngModel',
		scope: {
			config: '=ngVirtualKeyboard'
		},
		link: function(scope, elements, attrs, ngModelCtrl) {
			if(!ngModelCtrl){
				return;
			}

			// Don't show virtual keyboard in mobile devices (default)
			if ($injector.has('UAParser')) {
				var UAParser = $injector.get('UAParser');
				var results = new UAParser().getResult();
				var isMobile = results.device.type === 'mobile' || results.device.type === 'tablet';
                isMobile = isMobile || (results.os && (results.os.name === 'Android'));
                isMobile = isMobile || (results.os && (results.os.name === 'iOS'));
				if (isMobile && scope.config.showInMobile !== true) {
					return;
				}
			}

			ngVirtualKeyboardService.attach(elements[0], scope.config, function() {
				$timeout(function() {
					ngModelCtrl.$setViewValue(elements[0].value);
				});
			});
		}
	};
}]);
