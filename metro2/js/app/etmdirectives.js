
app.directive('etmTable', function ($timeout) {
    return {
	priority: 0,
        link: function (scope, element, attrs) {
            //	log(element + attrs);
            scope.$watch(
                function () {
                    return (element.offset().left + ',' + element.offset().top);
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        //$('#clone_thead').css('left', element.offset().left + 'px');
                       // $('#clone_thead').css('top', element.offset().top + 'px');
                    }
                },
                true
            );

            scope.$watch(
                function () {
                    return element.find("thead:eq(0) th").length; //element.find("th").length; //element.css("width");
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        // settings new width 
                        if ($("#etmTable tbody tr").length && ($("#etmTable thead th").length > 1)) {
                            $('#clone_etmTable').css("width", newValue);
                            $.each($($("#etmTable thead").get(0)).find("th:visible"),
                                function (i, val) {
                                    $($("#clone_etmTable thead th").get(i))
                                        .css("width", $(val).css("width"))
										.css("height", $(val).css("height"));
                                });
                        }
						// check visible cols
						var cols = scope.colDef.length - newValue;
						scope.hasdetail = (cols > 0);
                        //                	console.log(newValue);
                    }
                },
                true
            );
        }
    };
});
