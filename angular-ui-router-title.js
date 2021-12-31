/**
 * AngularJS module for updating browser title/history based on the current ui-router state.
 *
 * @link https://github.com/nonplus/angular-ui-router-title
 *
 * @license angular-ui-router-title v0.1.1
 * (c) Copyright Stepan Riha <github@nonplus.net>
 * License MIT
 */

(function (angular) {
    "use strict";
    var documentTitleCallback = undefined;
    var defaultDocumentTitle = document.title;
    angular.module("ui.router.title", ["ui.router"])
        .provider("$title", function $titleProvider() {
            return {
                documentTitle: function (cb) {
                    documentTitleCallback = cb;
                },
                $get: ["$state", function ($state) {
                    return {
                        breadCrumbs: function (trans) {
                            var $breadcrumbs = [];
                            var state = $state.$current;
                            while (state && state['navigable']) {
                                var hasTitle = state['resolvables'].some(function (s) {
                                    return s.token === '$title';
                                });
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
        .run(["$rootScope", "$timeout", "$title", "$transitions", function ($rootScope, $timeout, $title, $transitions) {
            $transitions.onSuccess({}, function (trans) {
                var title = getTitleValue(trans.injector().get('$title'));
                $timeout(function () {
                    $rootScope.$title = title;
                    var documentTitle = documentTitleCallback ? trans.injector().native.invoke(documentTitleCallback) : title || defaultDocumentTitle;
                    document.title = documentTitle;
                });
                $rootScope.$breadcrumbs = $title.breadCrumbs(trans);
            });
        }]);

    function getTitleValue(title) {
        return angular.isFunction(title) ? title() : title;
    }
})(window.angular);