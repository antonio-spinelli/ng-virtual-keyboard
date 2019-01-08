angular.module('ng-virtual-keyboard', [])

.constant('VKI_CONFIG', {

})

.service('ngVirtualKeyboardService', ['VKI_CONFIG', function(VKI_CONFIG) {
	var clone = function(obj) {
		var copy;

		// Handle the 3 simple types, and null or undefined
		if (null === obj || 'object' !== typeof obj) {
			return obj;
		}


		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = clone(obj[attr]);
				}
			}
			return copy;
		}

		throw new Error('Unable to copy obj! Its type isn\'t supported.');
	};

	var executeGetKeyboard = function(elementReference) {
		var keyboard;
		var element = $(elementReference);
		if (element) {
			keyboard = $(elementReference).getkeyboard();
		}
		return keyboard;
	};

	return {
		attach: function(element, config, inputCallback) {
			var newConfig = clone(VKI_CONFIG);

			config = config || {};

			for (var attr in config) {
				if (config.hasOwnProperty(attr)) {
					newConfig[attr] = config[attr];
				}
			}

			newConfig.accepted = config.accepted || inputCallback;

			if (config.autoUpdateModel) {
				newConfig.change = config.change || inputCallback;
			}

			if (newConfig.events) {
				var addEventMethod = function(eventName) {
					return function(e, kb, el) {
						newConfig.events[eventName](e, $(this).data('keyboard'), this);
					};
				};

				for (var eventName in newConfig.events) {
					$(element).on(eventName, addEventMethod(eventName));
				}
			}

			var keyboard = $(element).keyboard(newConfig);

			if (keyboard && newConfig.extensions) {
				for (var extension in newConfig.extensions) {
					var extConfig = newConfig.extensions[extension];
					if (extConfig) {
						keyboard[extension](extConfig);
					} else {
						keyboard[extension]();
					}
				}
			}
		},
		getKeyboard: function(elementReference) {
			return executeGetKeyboard(elementReference);
		},
		getKeyboardById: function(id) {
			return executeGetKeyboard('#' + id);
		}
	};
}])

.directive('ngVirtualKeyboard', ['ngVirtualKeyboardService', '$timeout',
	function(ngVirtualKeyboardService, $timeout) {
		return {
			restrict: 'A',
			require: '?ngModel',
			scope: {
				config: '=ngVirtualKeyboard'
			},
			link: function(scope, elements, attrs, ngModelCtrl) {
				var element = elements[0];

				if (!ngModelCtrl || !element) {
					return;
				}

				var createKeyboard = function(element, config) {
					ngVirtualKeyboardService.attach(element, config, function(e, kb, el) {
						$timeout(function() {
							ngModelCtrl.$setViewValue(element.value);
						});
					});
				};

				var destroyKeyboard = function(element) {
					var keyboard = ngVirtualKeyboardService.getKeyboard(element);
					if (keyboard) {
						keyboard.destroy();
					}
				};

				createKeyboard(element, scope.config);

				scope.$watch('config', function (newConfig, oldValue) {
					if (newConfig) {
						destroyKeyboard(element);
						createKeyboard(element, newConfig);
					}
				}, true);

				scope.$on('$destroy', function() {
					destroyKeyboard(element);
				});
			}
		};
	}
]);
