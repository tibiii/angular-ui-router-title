"use strict";

let documentTitleCallback: (title: string) => string = undefined;
let defaultDocumentTitle = document.title;

angular.module("ui.router.title", ["ui.router"])
	.provider("$title", function $titleProvider() {
		return {
			documentTitle: (cb) => {
				documentTitleCallback = cb;
			},
			$get: ["$state", ($state: ng.ui.IStateService): ng.ui.ITitleService => {
				return {
					breadCrumbs: (trans) => {
						let $breadcrumbs = [];
						var state = $state.$current;
						while (state && state['navigable']) {
							var hasTitle = state['resolvables'].some(s => s.token === '$title');

							$breadcrumbs.unshift({
								title: hasTitle ? trans.injector(state).get('$title') : state['self'].title,
								state: state['name'],
								stateParams: state['params']
							});

							state = state["parent"];
						}
						return $breadcrumbs;
					}
				};
			}]
		};
	})
	.run(["$rootScope", "$timeout", "$title", "$transitions", function(
		$rootScope: ng.IRootScopeService,
		$timeout: ng.ITimeoutService,
		$title: ng.ui.ITitleService,
		$transitions
	) {

		$transitions.onSuccess({}, function (trans) {
			var title = getTitleValue(trans.injector().get('$title'));
			$timeout(function () {
				$rootScope.$title = title;
				const documentTitle = documentTitleCallback ? trans.injector().native.invoke(documentTitleCallback) : title || defaultDocumentTitle;
				document.title = documentTitle;
			});

			$rootScope.$breadcrumbs = $title.breadCrumbs(trans);
		});
	}]);

function getTitleValue(title) {
	return angular.isFunction(title) ? title() : title;
}
