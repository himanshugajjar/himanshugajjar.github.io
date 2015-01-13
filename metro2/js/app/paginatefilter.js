
app.filter('paginate', function () {
    return function (input, paginator) {
        if (!input) {
            return input;
        }
	paginator.totalItems = input.length;
	if(paginator.prerowsPerPage != paginator.rowsPerPage) {
		paginator.prerowsPerPage = paginator.rowsPerPage;
        	localStorage.setItem( 'ngtable_rowsPerPage' + window.location.pathname, paginator.rowsPerPage);
	}

        return input.slice(parseInt((paginator.page - 1) * paginator.rowsPerPage),
            parseInt((paginator.page) * paginator.rowsPerPage + 1));
    }
});

