/*
 detail controller 
 responsible for viewing fight detail
*/

function detailCtrl($scope, $timeout, detailFlight) {
    $scope.row = detailFlight.rowData();
    $scope.cellprop = detailFlight.cellprop();
    $scope.colDef = detailFlight.colDef();
    $scope.clickCell = detailFlight.clickCell;
    $scope.addupdateDelaycode = detailFlight.addupdateDelaycode;
    $scope.selectDelaycode = detailFlight.selectDelaycode;
    $scope.removeDelaycode = detailFlight.removeDelaycode;
}

