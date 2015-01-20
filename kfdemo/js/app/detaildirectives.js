
app.directive('flightDetail', function (detailFlight) {
    return {
	priority: 10,
        link: function (scope, element, attrs) {

            scope.$watch(
                function () {
                    return detailFlight.change();
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        if ((newValue & 1) == 1) {
                            scope.colDef = detailFlight.colDef();
                        }
                        if ((newValue & 2) == 2) {
                            scope.cellprop = detailFlight.cellprop();
                        }
                        if ((newValue & 4) == 4) {
                            scope.row = detailFlight.rowData();
                        }
                    }
                },
                true
            );
        }
    }
});

