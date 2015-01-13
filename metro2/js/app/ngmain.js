//global variables
var firstLoad = true;
var smalldev = false;
var cntBlink  = 0;
var MAX_BLINK = 2;
var strcnt = -1;
var passcnt = 0;
var errcnt = 0;
var brefreshing = false;
var fkeydata = '';
var dt_diff = new Date().getTime();
var columns = [];
var org_columns = [];

var dep_coldis = ["ETM_CarrierCode", "FlightNumber", "OperationalSuffix", "ETM_ArrivalAirportCode", 
	"AbbreviatedAircraftRegistration", "AircraftTypeCode",
    "DepartureAircraftStand", "ScheduledDepartureDateTime", "TargetStartupApprovalDateTime", "ETM_CancelledStatus",
    "EstimatedDepartureDateTime", "ETM_EstimatedDepartureDateTimeContext", "ETM_DepartureDelayMinutes", "SlotDateTime", "SlotTimeContext", "TargetTakeoffDateTime", "TakeoffDateTime", "EventComment"
];

var arv_coldis = ["ETM_CarrierCode", "FlightNumber", "OperationalSuffix", "ETM_DepartureAirportCode",
	"AbbreviatedAircraftRegistration", "AircraftTypeCode",
    "ArrivalAircraftStand", "ScheduledArrivalDateTime", "EstimatedArrivalDateTime", "ETM_EstimatedArrivalDateTimeContext", "ETM_ArrivalDelayMinutes", "Cancelled", "LoadMessageStatus", "ContainerPalletMessageStatus", "ArrivalLinkFlightNumber", "ArrivalLinkFlightEstimatedDepartureDateTime"
];

var popoverCol = ["FICODisruptionFlag", "ETM_DepartureDelayMinutes", "ETM_ArrivalDelayMinutes", "LoadMessageStatus", "ContainerPalletMessageStatus"];

var app = angular.module('etmApp', ['ui.bootstrap', 'ngRoute']);

function createJSON(xml) {
    try{
        var xotree = new XML.ObjTree();
        var tree = xotree.parseXML(xml);
	return tree;

    }catch(ex){
	log(ex);
    }
}

function createEtmJSON($scope, xml) {
    try {
        var xotree = new XML.ObjTree();
        var tree = xotree.parseXML(xml);

        var coldata;
        var celprop;
        var rows = tree.PageDisplayFormat["DataBlock"]["Row"];
        var tbProp = '';
		var settings = $scope.tableProp.settings;

		var tlb = tree.PageDisplayFormat["TitleBlock"]["Row"][0]["RowData"][0];
		if(!tlb) {tlb =  tree.PageDisplayFormat["TitleBlock"]["Row"][0]["RowData"];}

		$scope.tableProp.title = JSON.parse('{ "text":"' + tlb["#text"] + '","color":"' + tlb["-Colour"] + '"}');
		$scope.tableProp.hdrcolor = tree.PageDisplayFormat["TitleBlock"]["-Background"];
		$scope.tableProp.rowcolor =  tree.PageDisplayFormat["DataBlock"]["-Background"];
		$scope.tableProp.receivedon =  tree.PageDisplayFormat["MessageHeader"]["MessageCreationDateTime"];
		$scope.tableProp.local = tree.PageDisplayFormat["MessageHeader"]["Locale"];
		$scope.tableProp.settings = settings;
	
        if (!$scope.colDef.length) {

            var hdr = tree.PageDisplayFormat["ClientTitleBlock"]["Row"]["RowData"];
            columns.push({
                field: 'KeyData',
                text: 'KeyData',
                visible: false
            });
            var hlen = hdr.length;
            for (var i = 0; hlen > i; i++) {
                columns.push({
                    field: hdr[i]["-Name"],
                    text: (hdr[i]["#text"] == undefined ? '' : hdr[i]["#text"].replace(/<br.*?>/g, " ")),
                    color: (hdr[i]["-Colour"] == undefined ? '' : hdr[i]["-Colour"]),
                    justify: (hdr[i]["-Justify"] == undefined ? '' : hdr[i]["-Justify"]),
                    editable: (hdr[i]["-EditEnable"] == undefined ? '' : hdr[i]["-EditEnable"]),
                    editwidth: (hdr[i]["-EditWidth"] == undefined ? '' : hdr[i]["-EditWidth"]),
                    width: '100px'
                });
            }
			//                    editable: (hdr[i]["-EditEnable"] == undefined ? '' : ($scope.access.indexOf("ETMAdmin") == -1 ? '' : hdr[i]["-EditEnable"])),

            $scope.colDef = eval('');
            $scope.colDef = columns;
        } else {
            columns = $scope.colDef;
        }

        var len = rows.length;
        //len = 1;
        for (var i = 0; len > i; i++) {
			var bkeydata = fkeydata.length;
            var cData = [];
            if (i == 0) {
                coldata = '[';
                celprop = '{';
            }
            var key = '';
            $.each((rows[i].KeyData), function (name, value) {
                key += value + '|';
				if(!bkeydata) {fkeydata += name + '|';}
            });

            //key = JSON.stringify(rows[i].KeyData);

            for (var j = 0; columns.length > j; j++) {
                if (j == 0) {
                    coldata += '{"' + columns[j].field + '":"' + key + '"';
                    celprop += '"' + key + '": {"' + columns[j].field + '":' + '{"color": "black"}';
                } else {
                    var rVal;
                    for (var inx = 0; inx < rows[i].RowData.length; inx++) {
                        if (rows[i].RowData[inx]["-Name"] == columns[j].field) {
                            rVal = rows[i].RowData[inx];
                            break;
                        }
                    }
                    coldata += '"' + columns[j].field + '":"' + (rVal["#text"] == undefined ? '' : rVal["#text"]) + '"';
                    celprop += '"' + columns[j].field + '":' + '{ "color":"' + (rVal["-Colour"] == undefined ? '' : rVal["-Colour"]) + '"}';
                }
                if (columns.length != (j + 1)) {
                    coldata += ',';
                    celprop += ',';
                } else {
                    coldata += '}';
                    celprop += '}';
                }
            }

            if (len != (i + 1)) {
                coldata += ',';
                celprop += ',';
            } else {
                coldata += ']';
                celprop += '}';
            }
        }
        if(!$scope.rowData.length) {
			$scope.rowData = JSON.parse(coldata);
			$scope.cellprop = JSON.parse(celprop);
        }
        else {
            diffJSON(JSON.parse(coldata), $scope.rowData, JSON.parse(celprop), $scope.cellprop);
		}
        //$scope.cellprop = JSON.parse(celprop);
    } catch (ex) {
        log(ex);
    }

}

function compareRowData(a,b) {
	if (a.KeyData < b.KeyData)
		return -1;
	if (a.KeyData > b.KeyData)
		return 1;
	return 0;
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function diffJSON(newr, oldr, ncell, ocell) {

	var del = false;
	var arnew = [];
	var ardel = [];
	var strblink = 'blink-' + cntBlink;
	
	//check blink and remove last one
	//var dcnt = Math.abs(cntBlink - 2);
	$('.stopb').removeClass('stopb');
	$('.' + strblink).addClass('stopb');
	$('.stopb').removeClass(strblink);
	if(cntBlink >= MAX_BLINK) {cntBlink = 0; } else {cntBlink++;}
	$('.stopb').css({"visibility":"visible"}); ///.show() function is not working properlly
	
	if(oldr && !oldr.length) { 
		return newr;
	}
	else {
		//newr.sort(dynamicSort(sortpram));
		//oldr.sort(compareRowData);
		
		for(i = 0; i < oldr.length; i++) {
			od = oldr[i];
            del = true;
			for(j = 0; j < newr.length; j++) {
				if(od['KeyData'] == newr[j]['KeyData']) {
					var keydata = newr[j]['KeyData'];
					del = false;
					nd = newr[j];
					arnew.push(j);
					// found, now check for change
					for (var prop in od) {
						if(prop == '$$hashKey') continue;
						if(od[prop] != nd[prop]){
							oldr[i][prop] = nd[prop];
							ocell[keydata][prop] = ncell[keydata][prop];
							ocell[keydata][prop].blink = strblink;

							//log('blink : ' + od['FlightNumber']);
						}
					}
					break;
                                }
			}
			if(del) { ardel.push(od['KeyData']); }
		}

		var ncnt = ardel.length;
		for(i = 0; ncnt > 0 && i < oldr.length; i++) {
			var key = oldr[i]['KeyData'];
			if(ardel.lastIndexOf(key) != -1) {
				delete ocell[key];
				oldr.splice(i, 1);
				ncnt--;
				log('deleted : ' + key);
			}
		}

		ncnt = newr.length - arnew.length;
		for(i = 0; ncnt > 0 && i < newr.length; i++) {
			if(arnew.lastIndexOf(i) == -1) {
				oldr.push(newr[i]);
				//var keydata = newr[i]['KeyData'];
				//ocell.push({keydata : {'color':'default'}});
				ocell[newr[i]['KeyData']] = ncell[ newr[i]['KeyData']];
				ncnt--;

				log('added : ' + newr[i]['KeyData']);
			}
		}
	
	}
}

function getTDate(time) {

	var d = new Date;
	d.setHours(parseInt(time/100));
        d.setMinutes(parseInt(time%100));
        var strvalue = d.getFullYear() + '-' + pad(d.getMonth()+1, 2) + '-' + pad(d.getDate(), 2) + 'T' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':00';

	return strvalue;

}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function messagebox(option){
    if(option){
        if(option.successtext) { $('#msgbtn1').text(option.successtext);  $('#msgbtn1').show()} else { $('#msgbtn1').hide()}
        if(option.canceltext) { $('#msgbtn2').text(option.canceltext);  $('#msgbtn2').show() } else {  $('#msgbtn2').hide()}
        if(option.success) $('#msgbtn1').unbind('click').bind('click', option.success);
        if(option.cancel) $('#msgbtn2').unbind('click').bind('click', option.cancel);
        if(option.message) $('#msgModal .modal-body').html(option.message);
    }
    $('#msgModal').modal('toggle');
}

$(window).scroll(function () {

    if ($(window).scrollTop() > $("#etmTable").offset().top) {
        $('#clone_thead').css('top', '0px');
    } 
    else if ($(window).scrollTop() <= $("#etmTable").offset().top) {
        $('#clone_thead').css('top', ($("#etmTable").offset().top - $(window).scrollTop()) + 'px');
    }
    if ($(window).scrollLeft() >= 0) // parseInt($("#etmTable").offset().left))
    {
        $('#clone_thead').css('left', ($("#etmTable").offset().left - $(window).scrollLeft()) + 'px');
    }
    else if($(window).scrollLeft() <=  $("#etmTable").offset().left) {
	 $('#clone_thead').css('left', $("#etmTable").offset().left +'px');
    }

});
