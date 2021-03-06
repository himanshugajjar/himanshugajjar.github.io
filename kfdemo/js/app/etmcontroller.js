/*main controller */

app.controller('etmCtrl', function ($scope, $http, $timeout, 
	$location, $compile, detailFlight, $rootScope) {

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        smalldev = true;
    }

    $scope.alerts = [{ type: 'danger', msg: '', show: false }];
    $scope.param = $location.search();
    if ($scope.param.gzFile == undefined) {
        gfile = $location.absUrl().substring($location.absUrl().indexOf("=") + 1, $location.absUrl().indexOf(".xml") + 4);
        $scope.param.gzFile = gfile;
        $scope.param.MOD = $location.absUrl().substring($location.absUrl().indexOf("MOD=") + 4, $location.absUrl().indexOf("MOD") + 7);
    }

    $scope.tableProp = JSON.parse( localStorage.getItem('ngtable_' + window.location.pathname));
    if(!$scope.tableProp) {
        $scope.tableProp = JSON.parse('{"settings":{"fixHeader":"off", "editable":"on", "sortable":"on", "highlight":"on", ' +
                                                '"position":"off", "hidecolumn":"off", "refreshinterval":"20", "predicate":"ScheduledDepartureDateTime", ' +
                                                '"sortreverse":true' + '}}');

        localStorage.setItem( 'ngtable_' + window.location.pathname, JSON.stringify($scope.tableProp));
    }
    $scope.tableProp.settings.hidecolumn = "off"; //always off first time
    $scope.tableProp.settings.position = "off"; //always off first time

    $scope.colVis = JSON.parse(localStorage.getItem( 'ngtable_colvis' + window.location.pathname + $scope.param.gzFile));
    $scope.colPos = JSON.parse(localStorage.getItem( 'ngtable_colpos' + window.location.pathname + $scope.param.gzFile));
    //$scope.progressbar = JSON.parse('{"value":100, "type":"success"}');
    $scope.progressbar = 100;
    $scope.objsplash = JSON.parse('{"value":100, "type":"primary"}');
    //$scope.$apply();
    //$("#splash").hide();


    if(smalldev) $scope.tableProp.settings.refreshinterval = 60;
    var param = $location.search();
    if (param.gzFile == undefined) {
        gfile = $location.absUrl().substring($location.absUrl().indexOf("=") + 1, $location.absUrl().indexOf(".gz") + 3);
        param.gzFile = gfile;
    }

    $scope.hasdetail = false;
    $scope.paginator = {};
    $scope.paginator.page = 1;
    $scope.paginator.prerowsPerPage = localStorage.getItem('ngtable_rowsPerPage' + window.location.pathname);
    if(!$scope.paginator.prerowsPerPage) {
        $scope.paginator.prerowsPerPage = 50;
        if(smalldev) $scope.paginator.prerowsPerPage = 10;
    }
    $scope.paginator.rowsPerPage = $scope.paginator.prerowsPerPage;
    $scope.paginator.totalItems = 0;
    $scope.rowData = [];
    $scope.cellprop = eval('');

    $scope.predicate = $scope.tableProp.settings.predicate;
    $scope.reverse = $scope.tableProp.settings.sortreverse; // will be revert on first click

    $scope.changeSort = function (predicate, reverse) {
        if ($(".sortable").length) {
            $scope.predicate = predicate;
            $scope.reverse = reverse;
            $(".sortable").removeClass("sorting_asc sorting_desc").addClass("sorting");
            if (reverse == false) {
                $('#' + predicate).removeClass("sorting").addClass("sorting_desc");
                $('#clone_' + predicate).removeClass("sorting").addClass("sorting_desc");
            } else {
                $('#' + predicate).removeClass("sorting").addClass("sorting_asc");
                $('#clone_' + predicate).removeClass("sorting").addClass("sorting_asc");
            }
        } else {
            $scope.predicate = '';
            $scope.reverse = false;
        }
    };

    $scope.colDef = [];
    $scope.showCol = function (name, vis) {
        if ($scope.colDef == undefined) return;
        for (i = 1; i < $scope.colDef.length; i++) {
            if (name == 'all') {
                $scope.colDef[i].visible = vis;
	        $scope.saveCol(i, $scope.colDef[i].field, vis);
                continue;
            }
            if ($scope.colDef[i].field == name) {
                $scope.colDef[i].visible = vis;
	        $scope.saveCol(i, $scope.colDef[i].field, vis);
                break;
            }
        }
    };
    $scope.resetCol = function (name, reset) {
        if ($scope.colDef == undefined) return;
        if (reset) {
            $scope.colDef = [];
//            $scope.colDef = org_columns.slice(0);
            angular.copy(org_columns, $scope.colDef);
	    for(var i = 0; $scope.colDef.length > i; i++) {$scope.colPos[i] = i;}
	    localStorage.setItem( 'ngtable_colpos' + window.location.pathname + $scope.param.gzFile, JSON.stringify($scope.colPos));
        }
    };
    $scope.saveCol = function (inx, name, vis) {
	if(vis) {
            $scope.colVis.push(name);
        }
        else {
            //find the index
            for(var i = 0; i < $scope.colVis.length; i++) { if(name == $scope.colVis[i]) break; }
            $scope.colVis.splice(i, 1);
        }
	localStorage.setItem( 'ngtable_colvis' + window.location.pathname + $scope.param.gzFile, JSON.stringify($scope.colVis));
    };

    $scope.clickCell = detailFlight.clickCell;
    $scope.addupdateDelaycode = detailFlight.addupdateDelaycode;
    $scope.selectDelaycode = detailFlight.selectDelaycode;
    $scope.removeDelaycode = detailFlight.removeDelaycode;

    $scope.updateCellData = function (row, etd, comment, delaycode) {
	var etd = $('#editetd').val().replace(/:/g, '');
	var comment = $('#editcomment').val().trim();
	var delayhtml = '';
	var nupdate = 0;
        var $sp = $('#editModal').scope();

        if(!comment.length || (comment == row["EventComment"].trim())) {
            $('#editcomment').parent().addClass("has-error"); 
            $sp.editmodel_msg = 'Please update the comment.'; 
            $('#editcomment').keydown(function() {$(this).parent().removeClass("has-error"); $sp.editmodel_msg = '';});
            return;
        }
        $('#editcomment').parent().removeClass("has-error");
        $sp.editmodel_msg = '';

	if (row["EstimatedDepartureDateTime"] != etd){ nupdate |= 1;}
	if (row["EventComment"] != comment){ nupdate |= 2;}
        if ($('#select_code').val() && $('#select_delay').val()) { 
            var cdupt = $sp.cdupdate;
            var dc = $('#select_code option[value=' + $("#select_code").val() + ']').text();
            if(!delaycode.length) {
                delaycode[0] = {sqn: 1, code: dc, delay: $('#select_delay').val()};
            }
            else if(cdupt != -1){
                delaycode[cdupt].code = dc;
                delaycode[cdupt].delay = $('#select_delay').val();
            }
        }
	if (angular.toJson($sp.OrgDelayCodes) != angular.toJson(delaycode)){ 
            nupdate |= 4;
            delayhtml = '<h4>Delay Codes</h4>' + 
                        '<table class="table table-condensed">' +
                        '</thead><th>#</th><th>Delay Code</th><th>Delay</th></thead>';
            $.each(delaycode, function (n, v){
                if(v) {
                    delayhtml += '<tr class="' + (angular.toJson($sp.OrgDelayCodes[n]) != angular.toJson(delaycode[n]) ? 'alert-info' : '') + '">';
                    delayhtml += '<td>' + delaycode[n].sqn + '</td>';
                    delayhtml += '<td>' + delaycode[n].code +  '</td>';
                    delayhtml += '<td>' + delaycode[n].delay +  '</td>';
                    delayhtml += '</tr>';
                }
            });

            delayhtml += '</table> <code class="alert-info"><i>*Updated</i></code>';
        }

	if(nupdate) {
            var strflight = row["ETM_CarrierCode"] + row["FlightNumber"] + row["OperationalSuffix"];

            messagebox({ 'canceltext': 'No',
                     'successtext':'Yes',
                     'cancel' : function(){$("#msgModal").modal("hide");},
                     'success' : function() { $scope.updateCosi(row, etd, comment, delaycode, nupdate);},
                     'message' : 'Do you want to update ' +
				((nupdate & 1) == 1 ? ('<b>ETD</b>' + ' to \'' + etd + '\'') : '') + 
				((nupdate & 3) == 3 ? ' and ' : '') +
				((nupdate & 2) == 2 ? ('<b>Comment</b>' + ' to \'' + comment + '\'') : '') + 
				' <b>for Flt No. ' + strflight + '</b>?' + 
				((nupdate & 4) == 4 ?  delayhtml : '')  
                });
	    }
	    $('#editModal').modal('hide');
	};

    $scope.updateCosi = function(row, etd, comment, delaycode, nupdate) {
		//create keydata
		var vals = row["KeyData"].split('|');
		var keys = fkeydata.split('|');
                var strflight = vals[4].trim() + vals[0].trim() + vals[1].trim() + vals[2].trim();
		var updatexml = '<ETMUpdate><KeyData>';
		$.each(keys, function (n, v){
			if(v.length) {
				if($.trim(vals[n]).length) { 
				    updatexml += '<' + v + '>' + vals[n] + '</' + v + '>';
				}
				else {
				    updatexml += '<' + v + '/>';
				}
			}
		});
                
		updatexml += '</KeyData>';
		updatexml += '<Locale TimeType="'+ $scope.tableProp.local["-TimeType"] + 
					 '" Variance="' + $scope.tableProp.local["-Variance"] + '">' + 
					 $scope.tableProp.local["#text"] +'</Locale>';

		if((nupdate & 1) == 1) { updatexml += '<EstimatedDepartureDateTime>' + getTDate(etd) + '</EstimatedDepartureDateTime>'; }
		if((nupdate & 2) == 2) { updatexml += '<EventComment>' + comment + '</EventComment>'; }
		if((nupdate & 4) == 4) {
                    var delayxml = '';
                    $.each(delaycode, function (n, v){
                        if(v) {
                            delayxml += '<Delay>';
                            delayxml += '<BA_DelayReasonCode>';
                            delayxml += delaycode[n].code;
                            delayxml += '</BA_DelayReasonCode>';
                            delayxml += '<DelayDuration>';
                            delayxml += delaycode[n].delay * 100;
                            delayxml += '</DelayDuration>';
                            delayxml += '<DelaySequenceNumber>';
                            delayxml += delaycode[n].sqn;
                            delayxml += '</DelaySequenceNumber>';
                            delayxml += '</Delay>';
                        }
                    });
                    updatexml += '<MovementDelays>' + delayxml + '</MovementDelays>'; 
                }
		updatexml += '</ETMUpdate>';
		
		var strurl = $location.protocol() + '://' + $location.host() + '/updatecosi.jsp';
		
		$http.post(strurl, 'msg=' + updatexml,  {
		    		headers: {'Content-Type':'application/x-www-form-urlencoded' }
  		    }).success(
		    function (data, status, headers, config) {
                        // check file on server
                        var updateflt = JSON.parse(localStorage.getItem( 'updateflt_' + window.location.pathname));

                        if(!updateflt) updateflt = [];
                        updateflt.push({flight: strflight, userid : $scope.userid, date: new Date()});
                        localStorage.setItem( 'updateflt_' + window.location.pathname, JSON.stringify(updateflt)); 
                        $timeout(function () {$scope.checkFlightupdate();}, 1000*5);

			//log(data);
		    }).error(function (data, status, headers, config) {
                	log(status);
            	});
		$('#msgModal').modal('hide');
                
                $scope.alerts[1] = { type: 'success', 
                                     msg: 'Updated data has been submitted and it will take about one minute to reflect in ETMplus.', 
                                     show: true };
                $timeout(function () {$scope.alerts[1].show = false;}, 1000*5);
    	};

    $scope.checkFlightupdate = function () {
            var updateflt = JSON.parse(localStorage.getItem( 'updateflt_' + window.location.pathname));
            if(!updateflt || !updateflt.length)  return;
            var file = '_response.dat.gz';
            var strxml = '/metro?gzFile=message_store/';

            for(i = 0; i < updateflt.length; i++) {
                if(updateflt[i].userid != $scope.userid || (updateflt[i].date - new Date()) > (1*60*1000)) {
                    updateflt.splice(i, 1);
                    localStorage.setItem( 'updateflt_' + window.location.pathname, JSON.stringify(updateflt));
                    continue; 
                }

                file = updateflt[i].flight + '_' + updateflt[i].userid + '_response.dat.gz';
                $http.get($location.protocol() + '://' + $location.host() + strxml + file).success(function (datafile) {

                    var rspcode = createJSON(datafile);
                    var fltId = rspcode.mFlightUpdateResponse.FlightLegIdentifier;
                    var strflt = fltId.CarrierCode + fltId.FlightNumber + (fltId.OperationalSuffix ? fltId.OperationalSuffix : ''); 
                    var createdon = new Date(rspcode.mFlightUpdateResponse.MessageHeader.MessageCreationDate + ' ' + 
                                                 rspcode.mFlightUpdateResponse.MessageHeader.MessageCreationTime + ' UTC');

                    if((new Date() - createdon) > (60*1000)) {

                    }
                    else if(rspcode.mFlightUpdateResponse.ResponseCode != '0000') {
                        $timeout(function () {$scope.checkFlightupdate();}, 1000*10);
                        return;
                    }
                    else {
                        $scope.alerts[2] = { type: 'warning',
                                     msg: 'Flight ' + strflt + ' has been updated in ETMplus.',
                                     show: true };
                        $timeout(function () {$scope.alerts[2].show = false;}, 1000*5);

                        var flts = JSON.parse(localStorage.getItem( 'updateflt_' + window.location.pathname));
                        for(i = 0; i < flts.length; i++) {
                            if(flts[i].flight == (fltId.FlightOriginDate + strflt)) {
                                flts.splice(i, 1);
                                break;
                            }
                        }

                        localStorage.setItem( 'updateflt_' + window.location.pathname, JSON.stringify(flts));
                    }

                }).error(function(err){log(err)});

            }

        };

    $scope.sortable = function (sort) {
        if (sort) {
            $("#etmTable th").addClass("sortable");
            // recreate clone of header with sortable and recompile
        } else {
            $(".sortable").removeClass("sortable sorting_asc sorting_desc");
            $scope.predicate = '';
            $scope.reverse = false;
        }
    }

    $scope.setDefaultsettings = function() {
        localStorage.removeItem( 'ngtable_' + window.location.pathname);
        localStorage.removeItem( 'ngtable_rowsPerPage' + window.location.pathname);
        localStorage.removeItem( 'ngtable_colvis' + window.location.pathname + $scope.param.gzFile);
        localStorage.removeItem( 'ngtable_colpos' + window.location.pathname + $scope.param.gzFile);
        $scope.tableProp.settings = JSON.parse('{"fixHeader":"off", "editable":"on", "sortable":"on", "highlight":"on", ' +
                                                '"position":"off", "hidecolumn":"off", "refreshinterval":"20", ' +
                                                '"predicate":"ScheduledDepartureDateTime", "sortreverse":true' + '}');
        if(smalldev) {
		$scope.tableProp.settings.refreshinterval = 60;
		$scope.paginator.rowsPerPage = 10;
	}
	$scope.colVis = [];
	firstLoad = true;
        $scope.modifyData(true);
	closePanel('#tblsettings');
	$("#msgModal").modal("hide");
    }

    var nInterID;
    $scope.resetAllsettings = function() {
	messagebox({ 'canceltext': 'No', 
		     'successtext':'Yes', 
		     'cancel' : function(){$("#msgModal").modal("hide");},
		     'success' : $scope.setDefaultsettings, 
		     'message' : 'Do you want to reset all settings?'
		});
    }

    $scope.saveSettings = function() {
	//$scope.tableProp
	localStorage.setItem( 'ngtable_' + window.location.pathname, JSON.stringify($scope.tableProp));
	localStorage.setItem( 'ngtable_colvis' + window.location.pathname + $scope.param.gzFile, JSON.stringify($scope.colVis));
	localStorage.setItem( 'ngtable_colpos' + window.location.pathname + $scope.param.gzFile, JSON.stringify($scope.colPos));
	clearInterval(nInterID);
	if($scope.tableProp.settings.highlight == 'on') {
		nInterID = setInterval('blinkChanges("[class*=blink]")', 1000);
	}
	closePanel('#tblsettings');
    }

    $scope.jfixHeader = function(fixed) {
	if(fixed == "on") {
		$thead = $("#etmTable thead");
		$tbody = $("#etmTable tbody");
		$tfoot = $("#etmTable tfoot");
		$tbody.bind('scroll', function(ev) {
       		  var $css = { 'left': -ev.target.scrollLeft };
        	  $thead.css($css);
        	  $tfoot.css($css);
    		});
	}
    };
    $scope.fixHeader = function (fixed) {
        if (fixed == 'on' && $("#clone_etmTable").css("width") != $("#etmTable").css("width")) {

            $("#clone_etmTable").width($("#etmTable").css("width"));
            //$("#clone_etmTable").css("table-layout", "fixed");
            $("#clone_thead").show();
            $.each($("#etmTable thead:eq(0) th:visible"),
                function (i, val) {
                    $($("#clone_etmTable thead th:visible").get(i))
                        .css("width", $(val)
                            .css("width")).css("height", $(val).css("height"));
                });
            $("#clone_thead").css({
                top: ($("#etmTable").offset().top - $(window).scrollTop()) + 'px',
                left: ($("#etmTable").offset().left - $(window).scrollLeft()) + 'px'
            });

        } else if (fixed == 'on') {
            $("#clone_thead").show();
            $("#clone_thead").css({
                top: ($("#etmTable").offset().top - $(window).scrollTop()) + 'px',
                left: ($("#etmTable").offset().left - $(window).scrollLeft()) + 'px'
            });
        } else if (fixed == 'off') {
            $("#clone_thead").hide();
        } else {}
    };

    $scope.detailView = function (row, cellprop) {
        // set position
        var btn = $('#' + row["FlightNumber"].trim() + '_' + row["AbbreviatedAircraftRegistration"].trim());
        if (btn) {
            var dtnw = new Date();
            var bshow = $(btn).children().hasClass("glyphicon-plus");
            if (bshow) {
                var cols = $($("#etmTable thead").get(0)).find("th:visible").length;
                var flt = row["FlightNumber"].trim() + '_' + row["AbbreviatedAircraftRegistration"].trim();

                if (cols == $scope.colDef.length) return;

                detailFlight.setrowData(row);
                detailFlight.setcellprop(cellprop);
                $(btn).children().removeClass('glyphicon-plus').addClass('glyphicon-minus');
		//$(btn).parent().attr('href', '#/detail');

                $('<tr id="tr-' + flt + '"><td id="td-' + flt + '" colspan="' + cols + '"></td></tr>')
                    .insertAfter($(btn).parentsUntil("tbody").last());

                $timeout(function () {
                    $('#td-' + flt).append($("#detailflight").clone().attr("id", 'clone_' + flt));
		    //$('#clone_' + flt).find("td").removeAttr('ng-repeat');
		    //$compile($('#clone_' + flt))($("#detailflight").scope());
                    $('#clone_' + flt).show();
                    $scope.expdelay = (new Date().getTime() - dtnw.getTime()) / 1000;
                    log('delay : ' + $scope.expdelay);
                });

                log('keydata: ' + row["KeyData"] + ' Reg: ' + row["AbbreviatedAircraftRegistration"]);
            } else {
                $(btn).children().removeClass('glyphicon-minus').addClass('glyphicon-plus');
		//$(btn).parent().attr('href', '#');
                $('#tr-' + $(btn).attr('id')).remove();
            }

        }
        // redirect to /detail
    };

    //$(".dial").knob();
    //var calldt = new Date();
    //init imprt struct
    $scope.imprt = {allpage : 'on', current : 'off'};
    $scope.toggleAllpage = function(all) {
	if(all) {
                $scope.imprt.current = $scope.imprt.current == 'off' ? $scope.imprt.current = 'on' : $scope.imprt.current = 'off';
	}
	else {
		$scope.imprt.allpage = $scope.imprt.allpage == 'off' ? $scope.imprt.allpage = 'on' : $scope.imprt.allpage = 'off';
        }

    };
    $scope.exportSettings = function(imprt) {
        var data = null;
	if(imprt.allpage == 'on') {
		data = JSON.stringify(localStorage);
	}
	else {
		data = '{"' + 'ngtable_colvis' + window.location.pathname + $scope.param.gzFile + '":'; 
		data += '"' + localStorage.getItem('ngtable_colvis' + window.location.pathname + $scope.param.gzFile) + '",'; 
		data += '"' + 'ngtable_colpos' + window.location.pathname + $scope.param.gzFile + '":'; 
		data += '"' + localStorage.getItem('ngtable_colpos' + window.location.pathname + $scope.param.gzFile) + '"}'; 
	}
        $scope.saveFile(data);
    };

    $scope.saveFile = function (content) {
        var dt = new Date();
/*        var hiddenElement = document.createElement('a');

        hiddenElement.href = 'data:attachment/text,' + encodeURI(content);
        hiddenElement.target = '_blank';
        hiddenElement.download = dt.getDate() + '-' + (dt.getMonth()+1) + '-' + dt.getFullYear() + '-' + dt.getHours() + '-' + dt.getMinutes() + '-' + dt.getSeconds() + '.txt';
        hiddenElement.click();
*/

//jQery version
	var filename = dt.getDate() + '-' + (dt.getMonth()+1) + '-' + dt.getFullYear() + '-' + dt.getHours() + '-' + dt.getMinutes() + '-' + dt.getSeconds() + '.txt';
	var atag = $('<a href="data:attachment/text;charset=utf-8,' + encodeURI(content) + '" download="' + filename + '"></a>');
	atag.get(0).click();
	//atag.remove();
    };

    $scope.modifyData = function (bforce) {
        //var strxml = '/ETMclient.jsp?gzFile=' + param.gzFile;
        var strxml = '/metro2/data/' + param.gzFile;
        var dt = new Date();

        if(errcnt > ($scope.tableProp.settings.refreshinterval*3)) {
			$scope.alerts[0] = {type: 'danger', msg: "Error in updating data, page will refresh automatically after few iteration!", show: true};
			if(errcnt > ($scope.tableProp.settings.refreshinterval*5))  window.location.reload();
        }
        else if(errcnt == 0) { $scope.alerts[0].show = false; }

        errcnt++;

	if (!bforce) {
        	if (strcnt != -1 && !$scope.refreshLoop($scope)) {
			//log('call again ' + (dt.getTime() - calldt.getTime())/1000);
			//calldt = new Date();
				$timeout(function () {
				  $scope.modifyData();
				  }, 1000);
				return null;
        	}
	}

        brefreshing = true;
        strcnt = 0;
        $('#loader').show();

        $http.get($location.protocol() + '://' + $location.host() + strxml).success(function (datafile, status, headers, config) {
            var tbprop = datafile["tableprop"];
	    errcnt = 0;
            $scope.userid = headers()["ba-sso-uid"];
            $scope.access = headers()["ba-sso-auth"];

            if (!tbprop) {
                createEtmJSON($scope, datafile);
            } else {
                $scope.tableProp = tbprop;
                $scope.colDef = datafile["coldef"];
                $scope.rowData = datafile["rowdata"];
                $scope.cellprop = datafile["cellprop"];
            }

	    if(firstLoad) {

		    if (!$scope.colVis && $scope.tableProp.title.text.indexOf('Departures') != -1) {
                        $scope.colVis = [];
//        	        $scope.colVis = dep_coldis.slice(0);
                        angular.copy(dep_coldis, $scope.colVis);
	            }
        	    else if(!$scope.colVis && $scope.tableProp.title.text.indexOf('Arrivals') != -1) {
                        $scope.colVis = [];
//                	$scope.colVis = arv_coldis.slice(0);
                        angular.copy(arv_coldis, $scope.colVis);
	            }
		    summaryCol = $scope.colVis;
	            for (var i = 0; $scope.colDef.length > i; i++) {
			$scope.colDef[i].visible = summaryCol.indexOf($scope.colDef[i].field) != -1 ? true : false;
			$scope.colDef[i].popover = popoverCol.indexOf($scope.colDef[i].field) != -1 ? true : false;
		    }
                    org_columns = [];
//            	    org_columns = $scope.colDef.slice(0);
                    angular.copy($scope.colDef, org_columns);
		    //set the col position
		    for(var i = 0, sift = [];  $scope.colPos && i < $scope.colPos.length; i++) {
				if($scope.colPos[i] != i && sift.indexOf(i) == -1) {
					sift.push($scope.colPos[i]);
						$scope.colDef.splice($scope.colPos[i], 0,
								$scope.colDef.splice(i, 1)[0]);
				}
		    }
    		    if(!$scope.colPos) {$scope.colPos = []; for(var i = 0; $scope.colDef.length > i; i++) {$scope.colPos[i] = i;}}
	    	    $rootScope.title = 'ETM+ ' + $scope.tableProp.title.text;
	    }

		detailFlight.setcolDef($scope.colDef);

		$scope.datasize = $scope.rowData.length;
		$scope.loadTime = (new Date().getTime() - dt.getTime()) / 1000;

		dt_diff = new Date().getTime();
		log("Data change " + $scope.loadTime + " sec");
		$("#splash").hide();
		$('#loader').hide(500);
		brefreshing = false;
		$("#tfooter").width($("#probar").width() - 16);
		
	    if( /Android|iPhone|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent) ) {
                $("#tfooter").height("150px");
	    }


	    firstLoad = false;
        });

        $timeout(function () {$scope.modifyData();}, 1);
        $timeout(function() {$scope.checkFlightupdate();}, 1000*10);


        if( navigator.userAgent.match(/iPhone|iPad|iPod/i) ) {
            $('.modal').on('show.bs.modal', function() {

            // Position modal absolute and bump it down to the scrollPosition
            $(this)
                .css({
                    position: 'absolute',
                    marginTop: $(window).scrollTop() + 'px',
                    bottom: 'auto'
                });

            // Position backdrop absolute and make it span the entire page
            //
            // Also dirty, but we need to tap into the backdrop after Boostrap 
            // positions it but before transitions finish.
            //
            $timeout( function() {
                $('.modal-backdrop').css({
                    position: 'absolute', 
                    top: 0, 
                    left: 0,
                    width: '100%',
                    height: Math.max(
                        document.body.scrollHeight, document.documentElement.scrollHeight,
                        document.body.offsetHeight, document.documentElement.offsetHeight,
                        document.body.clientHeight, document.documentElement.clientHeight
                    ) + 'px'
                   });}, 0);
            });
        }

        return null;
    };

    $scope.refreshLoop = function () {
        var brefresh = false;

        if (strcnt == 0) {
            strcnt = new Date().getTime();
	    if(smalldev && $scope.tableProp.settings.refreshinterval < 60) $scope.tableProp.settings.refreshinterval = 60;
            totalcnt = $scope.tableProp.settings.refreshinterval;
            $scope.dis_delay = (totalcnt - (new Date().getTime() - dt_diff) / 1000).toFixed(3);
            log('time diff ' + $scope.dis_delay);
        }

        passcnt = ((new Date().getTime()) - strcnt) / 1000;
        if (passcnt >= totalcnt && !brefreshing) {
            //modifyData($scope, $http);
            strcnt = 0;
            brefresh = true;
        } else if (brefreshing) {
            log('skipping this time ' + passcnt );
            return brefresh;
        }

        var diff = (totalcnt - passcnt) > 0 ? parseInt(totalcnt - passcnt) : 0;
        var per = diff / totalcnt;
        //var barwidth = per * $('.progress').width();

        //$scope.progressbar.value = Math.floor((per * 100));
        $scope.progressbar = Math.floor((per * 100));

        return brefresh;
    };

    var sortableEle;
    //sortableEle.refresh();

    $scope.dragStart = function (e, ui) {
        ui.item.data('start', ui.item.index());
    }
    $scope.dragEnd = function (e, ui) {
        var start = ui.item.data('start'),
            end = ui.item.index();

        $scope.colDef.splice(end, 0,
            $scope.colDef.splice(start, 1)[0]);
        $scope.$apply();

        $scope.colPos.splice(end, 0,
            $scope.colPos.splice(start, 1)[0]);

        localStorage.setItem( 'ngtable_colpos' + window.location.pathname + $scope.param.gzFile, JSON.stringify($scope.colPos));

    }

    sortableEle = $('#setposition').sortable({
        start: $scope.dragStart,
        update: $scope.dragEnd
    });

    $timeout(function () {
        $scope.modifyData();
	$scope.saveSettings();
    	$scope.changeSort($scope.predicate, $scope.reverse);
    }, 1);
});
