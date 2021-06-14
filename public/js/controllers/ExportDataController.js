angular.module('BlocksApp').controller('ExportDataController', function($stateParams, $location, $rootScope, $scope, $http, $filter) {
  $scope.$on('$viewContentLoaded', function() {   
      // initialize core components
      App.initAjax();
  });

  const now = new Date();
  $scope.dateRangeStart = $filter('date')(new Date(now.getFullYear(), now.getMonth(), 1), 'MM/dd/yyyy');
  $scope.dateRangeEnd = $filter('date')(new Date(now.getFullYear(), now.getMonth() +1, 0), 'MM/dd/yyyy');

  $scope.submitExportCSV = function () {
    if (!$scope.gRecaptchaResponse) {
      $scope.error = 'Error! Invalid captcha response.';
    } else if (new Date($scope.dateRangeStart).getTime() > new Date($scope.dateRangeEnd).getTime()) {
      $scope.error = 'The start date must be after the end date.';
    }
    if (!!$scope.error) {
      setTimeout(() => {
        $scope.error = null;
      }, 3000);
      return;
    }

    console.log('starting export data...');
    $scope.exporting = true;
    $("#submitExportBtn").button("loading");

    const type = $location.search().type;
    const contract = $location.search().contract;
    const address = $location.search().a;
    const decimals = $location.search().decimals;

    $http({
      method: 'POST',
      url: '/exportData',
      data: {
        type,
        contract,
        address,
        decimals,
        startDate: Math.round(new Date($scope.dateRangeStart).getTime() / 1000),
        endDate: Math.round(new Date($scope.dateRangeEnd).getTime() / 1000),
      }
    }).then(function(resp) {
      $("#submitCodeBtn").button("reset");
      const element = document.createElement('a');
      element.href = 'data:attachment/csv,' + encodeURI(resp.data);
      element.target = '_blank';
      if (type === 'address') {
        element.download = `export-${address}.csv`;
      } else if (type === 'tokentxns') {
        element.download = `export-token-${contract}.csv`;
      }
      element.click();
      element.remove();
    }).catch(function(resp) {
      $scope.exporting = false;
      $scope.error = resp && resp.data && resp.data.message ? resp.data.message : 'Server Internal Error';
    });
  }
})