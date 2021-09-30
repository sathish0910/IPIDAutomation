
// Summary       : Create page to insert/add items to SharePoint List
// Created       : 06-Nov-2020
// Created by    : E Sathish
// Modified		 : 15-Feb-2021
editForm = { vars: { editForm: [] }, fn: {} };
editForm.vars.webUrl = _spPageContextInfo.webAbsoluteUrl;
editForm.vars.currentUserId = _spPageContextInfo.userId;
editForm.vars.clickedGCodeId = "";
$(document).ready(function () {
	editForm.fn.loadForm(); //hilly billy functionality
	editForm.fn.common(); //common functionalities
	editForm.fn.initilizeFunctions(); //Click or Change functions
});
editForm.fn.loadForm = function () {
	$('span.hillbillyForm').each(function () {
		//get the display name from the custom layout
		editForm.vars.displayName = $(this).attr("data-displayName");
		editForm.vars.displayName = editForm.vars.displayName.replace(/&(?!amp;)/g, '&amp;');
		editForm.vars.elem = $(this);
		//find the corresponding field from the default form and move it
		//into the custom layout
		$("table.ms-formtable td").each(function () {
			if (this.innerHTML.indexOf('FieldInternalName="' + editForm.vars.displayName + '"') != -1) {
				$(this).contents().appendTo(editForm.vars.elem);
			}
		});
	});
}
editForm.fn.common = function () {
	$('input[id^="IPNode"]').val($('input[id^="IPNode"]').val().toString().replace(/&amp;/g, '&'));
	if ($('input[id^="TagOrStatus"]').val() === "WFMTPlannerCreated") {
		$('#btnSubmit').css("pointer-events", "none");
	} else {
		$('#btnSubmit').css("pointer-events", "auto");
	}
	editForm.fn.generateDynamicTables("onLoad");
	$('textarea[id^="Project"]').attr('rows', 1)
	$('.user-container input,input[id^="QuantityCards"],textarea[id^="GSStoresEquipmentDetails"],input[id^="TemplateCode"],input[id^="EIN"],textarea[id^="EmailDistribution"],select[id^="TypeOfInterface"],textarea[id^="Project"]').prop('disabled', 'disabled');
	$('div[id^="EmailDistribution"],div[id^="WorkRequestDescription"],div[id^="ConnectivityDescription"]').prop('contenteditable', 'false');
	$('.user-container .ms-dtinput img').hide();
	$('table[id^="BERT"]').children().children().css({ 'float': 'left', 'padding-right': '10px' });
	$('table[id^="BERT"]').children().children().children().find('label').css({ 'margin-top': '5px', 'padding-left': '5px' });
	if ($('textarea[id^="PlannerDescription"]').val() === "") {
		$('textarea[id^="PlannerDescription"]').val("Provide HE EEC gateway connections (via Cablelink) between 21C HE and IPVPN at Knock use ETHN00020915. Please provide TWELVE DIVERSLEY ROUTED Etherway Exchange Connect's for KnockPOP (1st Floor). NEW CABLE LINKS NEED PROVIDING");
	}
	if ($('select[id^="hideandshow"]').val() != "") {
		$('.sme-container').show();
		editForm.fn.fieldsHideAndShow($('select[id^="hideandshow"] :selected').val());
	} else {
		$('.sme-container').hide();
	}
	if($('input[id^="TagOrStatus"]').val() != "IpidRecordCreatedEmailTriggered") {
		$('#btnSubmit').hide();
		$('#btnSave').html('<i class="fa fa-save"></i> Update');
	}
	if ($('input[id^="DayNightSplit"]')[0].checked === true) {
		$('.night-job-gcode-field').show();
	} else {
		$('.night-job-gcode-field').hide();
	}
	//Unique in Lookup field
	var provideRouterType = {};
	$("select[id^='provideRouterType']>option").each(function () {
		if (provideRouterType[this.text]) {
			$(this).remove();
		}
		else {
			provideRouterType[this.text] = this.value;
		}
	});
	var provideRouterQuery = "?$select=ID,Title,*&$top=1000";
	var provideRouterBuildVal = $('input[id^=provideRouterBuild]').val().replace (/(^")|("$)/g, '');
	editForm.fn.getListItems(editForm.vars.webUrl, "Router Card Templates", provideRouterQuery, true).done(function (data) {
		$.each(data, function (key, val) {
			if (val.Router_x0020_Item_x0020_Code === $("select[id^='provideRouterType'] option:selected").text()) {
				$("select[id='selectProvideRouterBuild']").append($('<option>').val(val.Router_x0020_Build).text(val.Router_x0020_Build));
			}
		});
		var provideRouterBuild = {};
		$("select[id='selectProvideRouterBuild']>option").each(function () {
			if (provideRouterBuild[this.text]) {
				$(this).remove();
			}
			else {
				provideRouterBuild[this.text] = this.value;
			}
		});
		$('select[id="selectProvideRouterBuild"] option[value=' + provideRouterBuildVal + ']').attr("selected", "selected");	
	});
}
editForm.fn.initilizeFunctions = function () {
	$('select[id^="hideandshow"]').change(function () {
		editForm.fn.generateDynamicTables();
		editForm.vars.hideandshowval = $(this).children("option:selected").val();
		editForm.fn.fieldsHideAndShow(editForm.vars.hideandshowval);
		editForm.fn.clearVal();
		if ($('input[id^="SiteId"]').val() === "") {
			editForm.vars.product = encodeURIComponent($('input[id^="Product"]').val().split(' ')[0]);
			editForm.vars.ipNode = encodeURIComponent($('input[id^="IPNode"]').val().split(' (')[0]);
			editForm.fn.siteId(editForm.vars.product, editForm.vars.ipNode);
		}
		// $('select[id^="PatchpanelRouterUPLink"]').val('Patchpanel to Router');
		$('.night-job-gcode-field').hide();
	});
	editForm.fn.onchangeDropdownFields();
	editForm.fn.loadTemplateCode();
	$("input[id^='Room'],input[id^='Floor'],input[id^='SiteId']").keypress(function () {
		return editForm.fn.allowNumberField(event);
	})
	editForm.vars.productQuantity = $("input[id^='ProductQuality']").val();
	if ($('select[id^="hideandshow"]').val() != "-- Select --") {
		editForm.fn.onclickEvents(editForm.vars.productQuantity, "OnLoad");
	} else {
		editForm.fn.onclickEvents(editForm.vars.productQuantity, "");
	}
	$('#dayGCode').click(function () {
		$("#dayModal").modal({
			backdrop: 'static',
			keyboard: false
		});
		editForm.vars.dayGCDT = $('#dayGCodeSection').DataTable({
			"aLengthMenu": [[25, 50, 75, -1], [25, 50, 75, "All"]],
			"iDisplayLength": 25
		});
		editForm.vars.clickedGCodeId = "daySelectedGCodeData";
	});
	$('#nightGCode').click(function () {
		$("#nightModal").modal({
			backdrop: 'static',
			keyboard: false
		});
		editForm.vars.nightGCDT = $('#nightGCodeSection').DataTable({
			"aLengthMenu": [[25, 50, 75, -1], [25, 50, 75, "All"]],
			"iDisplayLength": 25
		});
		editForm.vars.clickedGCodeId = "nightSelectedGCodeData";
	});
	$(document).on('click', '.dayGCodeCheck', function () {
		$('.dayGCodeCheck').not(this).prop('checked', false);
	});
	$(document).on('click', '.nightGCodeCheck', function () {
		$('.nightGCodeCheck').not(this).prop('checked', false);
	});
	editForm.fn.getCurrentUserDetails(editForm.vars.webUrl, editForm.vars.currentUserId, false).done(function (data) {
		editForm.vars.currentLoginName = data.d.LoginName.split('|')[1];
	});
}
editForm.fn.siteId = function (product, ipnode) {
	switch (product) {
		case "BTNet":
			var listname = "ICUK-BTNet";
			$('select[id^="AssociatedProductType"]').val("Internet Connect UK");
			break;
		case "IPVPN":
			var listname = "IPVPN";
			$('select[id^="AssociatedProductType"]').val("IP Connect UK");
			break;
	}
	if (listname != "") {
		var query = "?$select=Title,*&$top=1000&$filter=Title eq '" + ipnode + "'"
		editForm.fn.getListItems(editForm.vars.webUrl, listname, query, true).done(function (data) {
			if (data.length != 0) {
				$('input[id^="SiteId"]').val(data[0].Site_x0020_ID);
				$('input[id^="AccountNumber"]').val(data[0].Billing_x0020_Account_x0020_Numb);
				$('input[id^="Floor"]').val(data[0].Floor);
				$('input[id^="Room"]').val(data[0].Room);
				$('input[id^="ProvideNetworkNumber"]').val(data[0].Network_x0020_Number)
			}
		});
	}
}
editForm.fn.generateDynamicTables = function (key) {
	editForm.vars.productQuantity = $("input[id^='ProductQuality']").val();
	switch ($('select[id^="hideandshow"] option:selected').val()) {
		case "Provide New Cards":
			switch ($('select[id^="CardAndConnectivity"] option:selected').val()) {
				case "Card Infill":
					editForm.fn.generateCardDetails(key);
					editForm.fn.generateSubcardDetails(key);
					editForm.fn.generateOpticDetails(key);
					break;
				case "Card and Connectivity":
					break;
			}
			break;
		case "One Siebel":
			editForm.fn.generateLocationRows(editForm.vars.productQuantity, key);
			break;
		case "Connectivity/Jumpering/Cabling":
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, key);
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, key);
			break;
	}
	switch ($('select[id^="PatchpanelRouterUPLink"] option:selected').val()) {
		case "Router to Router/UPLink":
			editForm.fn.generateRouterToRouterRows(key);
			break;
		case "Router to Router/via tie cable":
			editForm.fn.generateRouterTieCableEndRows(key);
			break;
	}
}
editForm.fn.generateCardDetails = function (key) {
	if ($('textarea[id^="CardDetails"]').val()) {
		editForm.vars.cardDetails = JSON.parse($('textarea[id^="CardDetails"]').val());
	} else {
		editForm.vars.cardDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.cardDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='cardrouterDNSName" + index + "' value='" + val.cardrouterDNSName + "' /></td><td><input type='text' id='cardType" + index + "' value='" + val.cardType + "' /></td><td><input type='text' id='slot" + index + "' value='" + val.slot + "'></td><td><input type='text' id='cardPONumber" + index + "' value='" + val.cardPONumber + "'></td><td><input type='button' class='cardDetailsDel delNewRow active'  value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$('#cardDetails tbody').append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateSubcardDetails = function (key) {
	if ($('textarea[id^="SubcardDetails"]').val()) {
		editForm.vars.subcardDetails = JSON.parse($('textarea[id^="SubcardDetails"]').val());
	} else {
		editForm.vars.subcardDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.subcardDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='subrouterDNSName" + index + "' value='" + val.subrouterDNSName + "' /></td><td><input type='text' id='subcardType" + index + "' value='" + val.subcardType + "' /></td><td><input type='text' id='subQuantity" + index + "' value='" + val.subQuantity + "' /></td><td><input type='text' id='slotFrom" + index + "' value='" + val.slotFrom + "'></td><td><input type='text' id='slotTo" + index + "' value='" + val.slotTo + "'></td><td><input type='text' id='subPONumber" + index + "' value='" + val.subPONumber + "'></td><td><input type='button' class='subcardDetailsDel delNewRow active'  value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$('#subCardDetails tbody').append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateOpticDetails = function (key) {
	if ($('textarea[id^="OpticDetails"]').val()) {
		editForm.vars.opticDetails = JSON.parse($('textarea[id^="OpticDetails"]').val());
	} else {
		editForm.vars.opticDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.opticDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='opticrouterDNSName" + index + "' value='" + val.opticrouterDNSName + "' /></td><td><input type='text' id='opticType" + index + "' value='" + val.opticType + "' /></td><td><input type='text' id='opticQuantity" + index + "' value='" + val.opticQuantity + "' /></td><td><input type='text' id='portFrom" + index + "' value='" + val.portFrom + "'></td><td><input type='text' id='portTo" + index + "' value='" + val.portTo + "'></td><td><input type='text' id='opticPONumber" + index + "' value='" + val.opticPONumber + "'></td><td><input type='button' class='opticDetailsDel delNewRow active'  value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$('#opticDetails tbody').append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateLocationRows = function (quantity, key) {
	if ($('textarea[id^="LocationDetails"]').val()) {
		editForm.vars.locationDetails = JSON.parse($('textarea[id^="LocationDetails"]').val());
	} else {
		editForm.vars.locationDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.locationDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='Location" + index + "' value='" + val.Location + "'></td><td><textarea id='inde_next_order" + index + "'>'" + val.IdentifierNextOrder + "'></textarea></td><td><textarea id='next_order" + index + "'>'" + val.NextOrder + "'</textarea></td><td><input type='text' id='LocEX1141Code" + index + "' value='" + val.LocEX1141Code + "'></td><td><input type='text' id='LocSuiteCode" + index + "' value='" + val.LocSuiteCode + "'></td><td><input type='number' placeholder='Numbers only' id='LocRackCode" + index + "' value='" + val.LocRackCode + "' style='width:60px;'></td><td><input type='number' placeholder='Numbers only' id='VUCode" + index + "' value='" + val.VUCode + "' style='width:60px;'></td><td><input type='text' id='ServicePoint" + index + "' value='" + val.ServicePoint + "'></td><td><input type='button' class='locDel delNewRow active'  value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$('#locSection tbody').append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateIPIDAEndRows = function (quantity, key) {
	if ($('textarea[id^="IPIDAEnd"]').val()) {
		editForm.vars.IPIDAEndDetails = JSON.parse($('textarea[id^="IPIDAEnd"]').val());
	} else {
		editForm.vars.IPIDAEndDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.IPIDAEndDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='IPIDAEndEX1141Code" + index + "' value='" + val.IPIDAEndEX1141Code + "'></td><td><input type='text' id='IPIDAEndSuitCode" + index + "' value='" + val.IPIDAEndSuitCode + "'></td><td><input type='number' style='width: 100%' id='IPIDAEndRackCode" + index + "' value='" + val.IPIDAEndRackCode + "'></td><td><input type='number' style='width: 100%' id='IPIDAEndVUCode" + index + "' value='" + val.IPIDAEndVUCode + "'></td><td><input type='text' id='IPIDAEndFloor" + index + "' value='" + val.IPIDAEndFloor + "'></td><td><input type='text' id='IPIDAEndRoom" + index + "' value='" + val.IPIDAEndRoom + "'></td><td><input type='text' id='IPIDAEndPortFrom" + index + "' value='" + val.IPIDAEndPortFrom + "'></td><td><input type='text' id='IPIDAEndPortTo" + index + "' value='" + val.IPIDAEndPortTo + "'></td><td><input type='button' class='AEndDel delNewRow active'  value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$('#ipidAEndSection tbody').append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateIPIDZEndRows = function (quantity, key) {
	if ($('textarea[id^="IPIDZEnd"]').val()) {
		editForm.vars.IPIDZEndDetails = JSON.parse($('textarea[id^="IPIDZEnd"]').val());
	} else {
		editForm.vars.IPIDZEndDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.IPIDZEndDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='IPIDZEndEX1141Code" + index + "' value='" + val.IPIDZEndEX1141Code + "'></td><td><input type='text' id='IPIDZEndSuitCode" + index + "' value='" + val.IPIDZEndSuitCode + "'></td><td><input type='number' style='width: 100%' id='IPIDZEndRackCode" + index + "' value='" + val.IPIDZEndRackCode + "'></td><td><input type='number' style='width: 100%' id='IPIDZEndVUCode" + index + "' value='" + val.IPIDZEndVUCode + "'></td><td><input type='text' id='IPIDZEndFloor" + index + "' value='" + val.IPIDZEndFloor + "'></td><td><input type='text' id='IPIDZEndRoom" + index + "' value='" + val.IPIDZEndRoom + "'></td><td><input type='text' id='IPIDZEndPortFrom" + index + "' value='" + val.IPIDZEndPortFrom + "'></td><td><input type='text' id='IPIDZEndPortTo" + index + "' value='" + val.IPIDZEndPortTo + "'></td><td><input type='button' class='ZEndDel delNewRow active'  value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$("#ipidZEndSection tbody").append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateRouterToRouterRows = function (key) {
	if ($('textarea[id^="RouterUPLinkDetails"]').val()) {
		editForm.vars.RouterUPLinkDetails = JSON.parse($('textarea[id^="RouterUPLinkDetails"]').val());
	} else {
		editForm.vars.RouterUPLinkDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.RouterUPLinkDetails, function (index, val) {
				var temp = "<tr><td><input type='text' id='Subnet" + index + "' value='" + val.Subnet + "'></td><td><input type='text' id='RouterFrom" + index + "' value='" + val.RouterFrom + "'></td><td><input type='text' id='PortFrom" + index + "' value='" + val.PortFrom + "'></td><td><input type='text' id='Subnet1" + index + "' value='" + val.Subnet1 + "'></td><td><input type='text' id='RouterTo" + index + "' value='" + val.RouterTo + "'></td><td><input type='text' id='PortTo" + index + "' value='" + val.PortTo + "'></td><td><input type='text' id='IPAddress" + index + "' value='" + val.IPAddress + "'></td><td><input type='button' class='rtrDel delNewRow active' value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$("#routerToRouterSection tbody").append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.generateRouterTieCableEndRows = function (key) {
	if ($('textarea[id^="RouterTieCable"]').val()) {
		editForm.vars.RouterTieCableDetails = JSON.parse($('textarea[id^="RouterTieCable"]').val());
	} else {
		editForm.vars.RouterTieCableDetails = [];
	}
	switch (key) {
		case 'onLoad':
			var finalTemp = "";
			$.each(editForm.vars.RouterTieCableDetails, function (index, val) {
				var temp = "<tr><td style='font-weight: bold;'>" + val.routertieheader + "</td><td><input type='text' id='routerTieCableEX1141Code" + index + "' value='" + val.routerTieCableEX1141Code + "'></td><td><input type='text' id='routerTieCableSuitCode" + index + "' value='" + val.routerTieCableSuitCode + "'></td><td><input type='number' style='width: 100%' id='routerTieCableRackCode" + index + "' value='" + val.routerTieCableRackCode + "'></td><td><input type='number' style='width: 100%' id='routerTieCableVUCode" + index + "' value='" + val.routerTieCableVUCode + "'></td><td><input type='text' id='routerTieCableFloor" + index + "' value='" + val.routerTieCableFloor + "'></td><td><input type='text' id='routerTieCableRoom" + index + "' value='" + val.routerTieCableRoom + "'></td><td><input type='text' id='routerTieCablePortFrom" + index + "' value='" + val.routerTieCablePortFrom + "'></td><td><input type='text' id='routerTieCablePortTo" + index + "' value='" + val.routerTieCablePortTo + "'></td><td><input type='button' class='routerTieCableDel delNewRow active' value='Delete'></td></tr>";
				finalTemp = finalTemp + temp;
			})
			$("#routerTieCableSection tbody").append(finalTemp);
			break;
		case undefined:
		case null:
		case "":
			break;
	}
}
editForm.fn.bindGCodeData = function (data) {
	// Onload bind day job G Code --Start--
	if ($('textarea[id^="DayJobGCode"]').val()) {
		editForm.vars.dayJobGCode = JSON.parse($('textarea[id^="DayJobGCode"]').val());
	} else {
		editForm.vars.dayJobGCode = [];
	}
	$.each(editForm.vars.dayJobGCode, function (key, val) {
		var check = ""
		if (val.DayJobPackTemplate === true) {
			check = "checked"
		} else {
			check = "";
		}
		$('#daySelectedGCodeData').append('<tr><td><input type="text" value="' + val.DayGCode + '" /></td><td><input type="text" value="' + val.DayQuantity + '" /></td><td><input class="dayGCodeCheck" type="checkbox" ' + check + ' /></td><td><input type="button" class="dayDel delNewRow active" value="Delete"></td></tr>')
	})
	// Onload bind day job G Code --End--
	// Onload bind night job G Code --Start--
	if ($('textarea[id^="NightJobGCode"]').val()) {
		editForm.vars.nightJobGCode = JSON.parse($('textarea[id^="NightJobGCode"]').val());
	} else {
		editForm.vars.nightJobGCode = [];
	}
	$.each(editForm.vars.nightJobGCode, function (key, val) {
		var check = ""
		if (val.NightJobPackTemplate === true) {
			check = "checked"
		} else {
			check = "";
		}
		$('#nightSelectedGCodeData').append('<tr><td><input type="text" value="' + val.NightGCode + '" /></td><td><input type="text" value="' + val.NightQuantity + '" /></td><td><input class="nightGCodeCheck" type="checkbox" ' + check + ' /></td><td><input type="button" class="nightDel delNewRow active" value="Delete"></td></tr>')
	})
	// Onload bind night job G Code --End--
	$("#tbodyDayGCode,#tbodyNightGCode").empty();
	$.each(data, function (key, val) {
		$("#tbodyDayGCode").append("<tr><td><input type='checkbox' id='dayId" + val.Id + "' /></td><td>" + val.Title + "</td><td>" + val.Gcode + "</td><td>" + val.DESCRIPTION + "</td><td>" + val.WORKACTIVITY + "</td><td>" + val.Unit + "</td><td>" + val.PlanningHours + "</td><td>" + val.WorksHours + "</td></tr>");
		$("#tbodyNightGCode").append("<tr><td><input type='checkbox' id='nightId" + val.Id + "' /></td><td>" + val.Title + "</td><td>" + val.Gcode + "</td><td>" + val.DESCRIPTION + "</td><td>" + val.WORKACTIVITY + "</td><td>" + val.Unit + "</td><td>" + val.PlanningHours + "</td><td>" + val.WorksHours + "</td></tr>");
	});
	// editForm.vars.testData = []
	// $('#tbodyDayGCode').on('click', 'tr', function () {
	// 	editForm.vars.testData.push(editForm.vars.dayGCDT.row(this).data()[2]);
	// });
	// $('#addDayGCodeCheckedData').click(function () {
	// 	$('#daySelectedGCodeData').empty();
	// 	$.each(editForm.vars.testData, function (key, val) {
	// 		$('#' + editForm.vars.clickedGCodeId).append('<tr><td><input type="text" value="' + val + '" /></td><td><input type="text" value="1" /></td><td><input class="nightGCodeCheck" type="checkbox" /></td><td><input type="button" class="nightDel delNewRow active" value="Delete"></td></tr>')
	// 	})
	// });
	$('#addDayGCodeCheckedData').click(function () {
		$('#daySelectedGCodeData').empty();
		$('#tbodyDayGCode input[type="checkbox"]:checked').each(function () {
			var getRow = $(this).parents('tr'); //variable for the entire row
			var gCode = (getRow.find('td:eq(2)').text());
			$('#' + editForm.vars.clickedGCodeId).append('<tr><td><input type="text" value="' + gCode + '" /></td><td><input type="text" value="1" /></td><td><input class="dayGCodeCheck" type="checkbox" /></td><td><input type="button" class="dayDel delNewRow active" value="Delete"></td></tr>')
		})
	});
	$("#daySelectedGCodeData").on("click", ".dayDel", function (event) {
		$(this).closest("tr").remove();
	});
	$('#addNightGCodeCheckedData').click(function () {
		$('#nightSelectedGCodeData').empty();
		$('#tbodyNightGCode input[type="checkbox"]:checked').each(function () {
			var getRow = $(this).parents('tr'); //variable for the entire row
			var gCode = (getRow.find('td:eq(2)').text());
			$('#' + editForm.vars.clickedGCodeId).append('<tr><td><input type="text" value="' + gCode + '" /></td><td><input type="text" value="1" /></td><td><input class="nightGCodeCheck" type="checkbox" /></td><td><input type="button" class="nightDel delNewRow active" value="Delete"></td></tr>')
		})
	});
	$("#nightSelectedGCodeData").on("click", ".nightDel", function (event) {
		$(this).closest("tr").remove();
	});
}
editForm.fn.onclickEvents = function (quantity, key) {
	//Card Details Table
	if (key === "OnLoad") {
		var carddetails = $('#cardDetails tbody tr').length;
	} else {
		var carddetails = 0;
	}
	$("#cardDetailsAddRow").on("click", function () {
		var cardDetailsNewRow = $("<tr>");
		var cardDetailsCols = "";
		if ($('#cardDetails tbody tr').length === 0) {
			cardDetailsCols += "<td><input type='text' class='form-control' name='cardrouterDNSName" + carddetails + "' id='cardrouterDNSName" + carddetails + "' /></td>";
			cardDetailsCols += "<td><input type='text' class='form-control' name='cardType" + carddetails + "' id='cardType" + carddetails + "' /></td>";
			cardDetailsCols += "<td><input type='text' class='form-control' name='slot" + carddetails + "' id='slot" + carddetails + "' /></td>";
			cardDetailsCols += "<td><input type='text' class='form-control' name='cardPONumber" + carddetails + "' id='cardPONumber" + carddetails + "' /></td>";
		} else {
			cardDetailsCols += "<td><input type='text' class='form-control' name='cardrouterDNSName" + carddetails + "' id='cardrouterDNSName" + carddetails + "' value='" + $('#cardrouterDNSName' + (carddetails - 1) + '').val() + "' /></td>";
			cardDetailsCols += "<td><input type='text' class='form-control' name='cardType" + carddetails + "' id='cardType" + carddetails + "' value='" + $('#cardType' + (carddetails - 1) + '').val() + "' /></td>";
			cardDetailsCols += "<td><input type='text' class='form-control' name='slot" + carddetails + "' id='slot" + carddetails + "' value='" + $('#slot' + (carddetails - 1) + '').val() + "' /></td>";
			cardDetailsCols += "<td><input type='text' class='form-control' name='cardPONumber" + carddetails + "' id='cardPONumber" + carddetails + "' value='" + $('#cardPONumber' + (carddetails - 1) + '').val() + "' /></td>";
		}
		cardDetailsCols += '<td><input type="button" class="cardDetailsDel delNewRow active"  value="Delete"></td>';
		cardDetailsNewRow.append(cardDetailsCols);
		$("#cardDetails tbody").append(cardDetailsNewRow);
		carddetails++;
	});
	$("#cardDetails").on("click", ".cardDetailsDel", function (event) {
		$(this).closest("tr").remove();
		carddetails -= 1;
	});
	//Subcard Details Table
	if (key === "OnLoad") {
		var subcarddetails = $('#subCardDetails tbody tr').length;
	} else {
		var subcarddetails = 0;
	}
	$("#subcardDetailsAddRow").on("click", function () {
		var subCardDetailsNewRow = $("<tr>");
		var subCardDetailsCols = "";
		if ($('#subCardDetails tbody tr').length === 0) {
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subrouterDNSName" + subcarddetails + "' id='subrouterDNSName" + subcarddetails + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subcardType" + subcarddetails + "' id='subcardType" + subcarddetails + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subQuantity" + subcarddetails + "' id='subQuantity" + subcarddetails + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='slotFrom" + subcarddetails + "' id='slotFrom" + subcarddetails + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='slotTo" + subcarddetails + "' id='slotTo" + subcarddetails + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subPONumber" + subcarddetails + "' id='subPONumber" + subcarddetails + "' /></td>";
		} else {
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subrouterDNSName" + subcarddetails + "' id='subrouterDNSName" + subcarddetails + "' value='" + $('#subrouterDNSName' + (subcarddetails - 1) + '').val() + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subcardType" + subcarddetails + "' id='subcardType" + subcarddetails + "' value='" + $('#subcardType' + (subcarddetails - 1) + '').val() + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subQuantity" + subcarddetails + "' id='subQuantity" + subcarddetails + "' value='" + $('#subQuantity' + (subcarddetails - 1) + '').val() + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='slotFrom" + subcarddetails + "' id='slotFrom" + subcarddetails + "' value='" + $('#slotFrom' + (subcarddetails - 1) + '').val() + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='slotTo" + subcarddetails + "' id='slotTo" + subcarddetails + "' value='" + $('#slotTo' + (subcarddetails - 1) + '').val() + "' /></td>";
			subCardDetailsCols += "<td><input type='text' class='form-control' name='subPONumber" + subcarddetails + "' id='subPONumber" + subcarddetails + "' value='" + $('#subPONumber' + (subcarddetails - 1) + '').val() + "' /></td>";
		}
		subCardDetailsCols += '<td><input type="button" class="subcardDetailsDel delNewRow active"  value="Delete"></td>';
		subCardDetailsNewRow.append(subCardDetailsCols);
		$("#subCardDetails tbody").append(subCardDetailsNewRow);
		subcarddetails++;
	});
	$("#subCardDetails").on("click", ".subcardDetailsDel", function (event) {
		$(this).closest("tr").remove();
		subcarddetails -= 1;
	});
	//Optic Details Table
	if (key === "OnLoad") {
		var opticdetails = $('#opticDetails tbody tr').length;
	} else {
		var opticdetails = 0;
	}
	$("#opticDetailsAddRow").on("click", function () {
		var opticdetailsNewRow = $("<tr>");
		var opticdetailsCols = "";
		if ($('#opticDetails tbody tr').length === 0) {
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticrouterDNSName" + opticdetails + "' id='opticrouterDNSName" + opticdetails + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticType" + opticdetails + "' id='opticType" + opticdetails + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticQuantity" + opticdetails + "' id='opticQuantity" + opticdetails + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='portFrom" + opticdetails + "' id='portFrom" + opticdetails + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='portTo" + opticdetails + "' id='portTo" + opticdetails + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticPONumber" + opticdetails + "' id='opticPONumber" + opticdetails + "' /></td>";
		} else {
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticrouterDNSName" + opticdetails + "' id='opticrouterDNSName" + opticdetails + "' value='" + $('#opticrouterDNSName' + (opticdetails - 1) + '').val() + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticType" + opticdetails + "' id='opticType" + opticdetails + "' value='" + $('#opticType' + (opticdetails - 1) + '').val() + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticQuantity" + opticdetails + "' id='opticQuantity" + opticdetails + "' value='" + $('#opticQuantity' + (opticdetails - 1) + '').val() + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='portFrom" + opticdetails + "' id='portFrom" + opticdetails + "' value='" + $('#portFrom' + (opticdetails - 1) + '').val() + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='portTo" + opticdetails + "' id='portTo" + opticdetails + "' value='" + $('#portTo' + (opticdetails - 1) + '').val() + "' /></td>";
			opticdetailsCols += "<td><input type='text' class='form-control' name='opticPONumber" + opticdetails + "' id='opticPONumber" + opticdetails + "' value='" + $('#opticPONumber' + (opticdetails - 1) + '').val() + "' /></td>";
		}
		opticdetailsCols += '<td><input type="button" class="opticDetailsDel delNewRow active"  value="Delete"></td>';
		opticdetailsNewRow.append(opticdetailsCols);
		$("#opticDetails tbody").append(opticdetailsNewRow);
		opticdetails++;
	});
	$("#opticDetails").on("click", ".opticDetailsDel", function (event) {
		$(this).closest("tr").remove();
		opticdetails -= 1;
	});
	//Location Table
	if (key === "OnLoad") {
		var locationtab = $('#locSection tbody tr').length;
	} else {
		var locationtab = 0;
	}
	$("#locAddRow").on("click", function () {
		if ($('#locSection tbody tr').length < parseInt(quantity)) {
			var locNewRow = $("<tr>");
			var locCols = "";
			if ($('#locSection tbody tr').length === 0) {
				locCols += "<td><input type='text' class='form-control' name='Location" + locationtab + "' id='Location" + locationtab + "' /></td>";
				locCols += "<td><textarea class='form-control' name='inde_next_order" + locationtab + "' id='inde_next_order" + locationtab + "'></textarea></td>";
				locCols += "<td><textarea class='form-control' name='next_order" + locationtab + "' id='next_order" + locationtab + "'></textarea></td>";
				locCols += "<td><input type='text' class='form-control' name='LocEX1141Code" + locationtab + "' id='LocEX1141Code" + locationtab + "' /></td>";
				locCols += "<td><input type='text' class='form-control' name='LocSuiteCode" + locationtab + "' id='LocSuiteCode" + locationtab + "' /></td>";
				locCols += "<td><input type='number' class='form-control' placeholder='Numbers only' name='LocRackCode" + locationtab + "' id='LocRackCode" + locationtab + "' /></td>";
				locCols += "<td><input type='number' class='form-control' placeholder='Numbers only' name='VUCode" + locationtab + "' id='VUCode" + locationtab + "' /></td>";
				locCols += "<td><input type='text' class='form-control' name='ServicePoint" + locationtab + "' id='ServicePoint" + locationtab + "' /></td>";
			} else {
				locCols += "<td><input type='text' class='form-control' name='Location" + locationtab + "' id='Location" + locationtab + "' value='" + $('#Location' + (locationtab - 1) + '').val() + "' /></td>";
				locCols += "<td><textarea class='form-control' name='inde_next_order" + locationtab + "' id='inde_next_order" + locationtab + "'>" + $('#inde_next_order' + (locationtab - 1) + '').val() + "</textarea></td>";
				locCols += "<td><textarea class='form-control' name='next_order" + locationtab + "' id='next_order" + locationtab + "'>" + $('#next_order' + (locationtab - 1) + '').val() + "</textarea></td>";
				locCols += "<td><input type='text' class='form-control' name='LocEX1141Code" + locationtab + "' id='LocEX1141Code" + locationtab + "' value='" + $('#LocEX1141Code' + (locationtab - 1) + '').val() + "' /></td>";
				locCols += "<td><input type='text' class='form-control' name='LocSuiteCode" + locationtab + "' id='LocSuiteCode" + locationtab + "' value='" + $('#LocSuiteCode' + (locationtab - 1) + '').val() + "' /></td>";
				locCols += "<td><input type='number' class='form-control' placeholder='Numbers only' name='LocRackCode" + locationtab + "' id='LocRackCode" + locationtab + "' value='" + $('#LocRackCode' + (locationtab - 1) + '').val() + "' /></td>";
				locCols += "<td><input type='number' class='form-control' placeholder='Numbers only' name='VUCode" + locationtab + "' id='VUCode" + locationtab + "' value='" + $('#VUCode' + (locationtab - 1) + '').val() + "' /></td>";
				locCols += "<td><input type='text' class='form-control' name='ServicePoint" + locationtab + "' id='ServicePoint" + locationtab + "' value='" + $('#ServicePoint' + (locationtab - 1) + '').val() + "' /></td>";
			}
			locCols += '<td><input type="button" class="locDel delNewRow active"  value="Delete"></td>';
			locNewRow.append(locCols);
			$("#locSection tbody").append(locNewRow);
			locationtab++;
		}
	});
	$("#locSection").on("click", ".locDel", function (event) {
		$(this).closest("tr").remove();
		locationtab -= 1;
	});
	//AEND Table
	if (key === "OnLoad") {
		var aendtab = $('#ipidAEndSection tbody tr').length;
	} else {
		var aendtab = 0;
	}
	$("#AEndAddRow").on("click", function () {
		if ($('#ipidAEndSection tbody tr').length < parseInt(quantity)) {
			var aendNewRow = $("<tr>");
			var aendCols = "";
			if ($('#ipidAEndSection tbody tr').length === 0) {
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndEX1141Code" + aendtab + "' id='IPIDAEndEX1141Code" + aendtab + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndSuitCode" + aendtab + "' id='IPIDAEndSuitCode" + aendtab + "' /></td>";
				aendCols += "<td><input type='number' class='form-control' name='IPIDAEndRackCode" + aendtab + "' id='IPIDAEndRackCode" + aendtab + "' /></td>";
				aendCols += "<td><input type='number' class='form-control' name='IPIDAEndVUCode" + aendtab + "' id='IPIDAEndVUCode" + aendtab + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndFloor" + aendtab + "' id='IPIDAEndFloor" + aendtab + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndRoom" + aendtab + "' id='IPIDAEndRoom" + aendtab + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndPortFrom" + aendtab + "' id='IPIDAEndPortFrom" + aendtab + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndPortTo" + aendtab + "' id='IPIDAEndPortTo" + aendtab + "' /></td>";
			} else {
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndEX1141Code" + aendtab + "' id='IPIDAEndEX1141Code" + aendtab + "' value='" + $('#IPIDAEndEX1141Code' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndSuitCode" + aendtab + "' id='IPIDAEndSuitCode" + aendtab + "' value='" + $('#IPIDAEndSuitCode' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='number' class='form-control' name='IPIDAEndRackCode" + aendtab + "' id='IPIDAEndRackCode" + aendtab + "' value='" + $('#IPIDAEndRackCode' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='number' class='form-control' name='IPIDAEndVUCode" + aendtab + "' id='IPIDAEndVUCode" + aendtab + "' value='" + $('#IPIDAEndVUCode' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndFloor" + aendtab + "' id='IPIDAEndFloor" + aendtab + "' value='" + $('#IPIDAEndFloor' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndRoom" + aendtab + "' id='IPIDAEndRoom" + aendtab + "' value='" + $('#IPIDAEndRoom' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndPortFrom" + aendtab + "' id='IPIDAEndPortFrom" + aendtab + "' value='" + $('#IPIDAEndPortFrom' + (aendtab - 1) + '').val() + "' /></td>";
				aendCols += "<td><input type='text' class='form-control' name='IPIDAEndPortTo" + aendtab + "' id='IPIDAEndPortTo" + aendtab + "' value='" + $('#IPIDAEndPortTo' + (aendtab - 1) + '').val() + "' /></td>";
			}
			aendCols += '<td><input type="button" class="AEndDel delNewRow active"  value="Delete"></td>';
			aendNewRow.append(aendCols);
			$("#ipidAEndSection tbody").append(aendNewRow);
			aendtab++;
		}
	});
	$("#ipidAEndSection").on("click", ".AEndDel", function (event) {
		$(this).closest("tr").remove();
		aendtab -= 1;
	});
	//ZEND Table
	if (key === "OnLoad") {
		var zendtab = $('#ipidZEndSection tbody tr').length;
	} else {
		var zendtab = 0;
	}
	$("#ZEndAddRow").click(function () {
		if ($('#ipidZEndSection tbody tr').length < parseInt(quantity)) {
			var zendNewRow = $("<tr>");
			var zendCols = "";
			if ($("#ipidZEndSection tbody tr").length === 0) {
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndEX1141Code" + zendtab + "' id='IPIDZEndEX1141Code" + zendtab + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndSuitCode" + zendtab + "' id='IPIDZEndSuitCode" + zendtab + "' /></td>";
				zendCols += "<td><input type='number' class='form-control' name='IPIDZEndRackCode" + zendtab + "' id='IPIDZEndRackCode" + zendtab + "' /></td>";
				zendCols += "<td><input type='number' class='form-control' name='IPIDZEndVUCode" + zendtab + "' id='IPIDZEndVUCode" + zendtab + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndFloor" + zendtab + "' id='IPIDZEndFloor" + zendtab + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndRoom" + zendtab + "' id='IPIDZEndRoom" + zendtab + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndPortFrom" + zendtab + "' id='IPIDZEndPortFrom" + zendtab + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndPortTo" + zendtab + "' id='IPIDZEndPortTo" + zendtab + "' /></td>";
			} else {
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndEX1141Code" + zendtab + "' id='IPIDZEndEX1141Code" + zendtab + "' value='" + $('#IPIDZEndEX1141Code' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndSuitCode" + zendtab + "' id='IPIDZEndSuitCode" + zendtab + "' value='" + $('#IPIDZEndSuitCode' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='number' class='form-control' name='IPIDZEndRackCode" + zendtab + "' id='IPIDZEndRackCode" + zendtab + "' value='" + $('#IPIDZEndRackCode' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='number' class='form-control' name='IPIDZEndVUCode" + zendtab + "' id='IPIDZEndVUCode" + zendtab + "' value='" + $('#IPIDZEndVUCode' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndFloor" + zendtab + "' id='IPIDZEndFloor" + zendtab + "' value='" + $('#IPIDZEndFloor' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndRoom" + zendtab + "' id='IPIDZEndRoom" + zendtab + "' value='" + $('#IPIDZEndRoom' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndPortFrom" + zendtab + "' id='IPIDZEndPortFrom" + zendtab + "' value='" + $('#IPIDZEndPortFrom' + (zendtab - 1) + '').val() + "' /></td>";
				zendCols += "<td><input type='text' class='form-control' name='IPIDZEndPortTo" + zendtab + "' id='IPIDZEndPortTo" + zendtab + "' value='" + $('#IPIDZEndPortTo' + (zendtab - 1) + '').val() + "' /></td>";
			}
			zendCols += '<td><input type="button" class="ZEndDel delNewRow active"  value="Delete"></td>';
			zendNewRow.append(zendCols);
			$("#ipidZEndSection tbody").append(zendNewRow);
			zendtab++;
		}
	});
	$("#ipidZEndSection").on("click", ".ZEndDel", function (event) {
		$(this).closest("tr").remove();
		zendtab -= 1;
	});
	//Router via Tie Cable Table
	if (key === "OnLoad") {
		var routerTieCableTab = $('#routerTieCableSection tbody tr').length;
	} else {
		var routerTieCableTab = 0;
	}
	$("#RouterTieCableAddRow").click(function () {
		var header = "";
		if ($('#routerTieCableSection tbody tr').length < parseInt(4)) {
			if ($('#router_tie_cable_tbody tr').length < 2) {
				header = 'AEnd'
			} else if ($('#router_tie_cable_tbody tr').length >= 2) {
				header = 'ZEnd'
			}
			var routerTieCableNewRow = $("<tr>");
			var routerTieCableCols = "";
			if ($("#routerTieCableSection tbody tr").length === 0) {
				routerTieCableCols += "<td class='routertieHeader' style='font-weight: bold'>" + header + "</td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableEX1141Code" + routerTieCableTab + "' id='routerTieCableEX1141Code" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableSuitCode" + routerTieCableTab + "' id='routerTieCableSuitCode" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='number' class='form-control' name='routerTieCableRackCode" + routerTieCableTab + "' id='routerTieCableRackCode" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='number' class='form-control' name='routerTieCableVUCode" + routerTieCableTab + "' id='routerTieCableVUCode" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableFloor" + routerTieCableTab + "' id='routerTieCableFloor" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableRoom" + routerTieCableTab + "' id='routerTieCableRoom" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCablePortFrom" + routerTieCableTab + "' id='routerTieCablePortFrom" + routerTieCableTab + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCablePortTo" + routerTieCableTab + "' id='routerTieCablePortTo" + routerTieCableTab + "' /></td>";
			} else {
				routerTieCableCols += "<td class='routertieHeader' style='font-weight: bold'>" + header + "</td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableEX1141Code" + routerTieCableTab + "' id='routerTieCableEX1141Code" + routerTieCableTab + "' value='" + $('#routerTieCableEX1141Code' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableSuitCode" + routerTieCableTab + "' id='routerTieCableSuitCode" + routerTieCableTab + "' value='" + $('#routerTieCableSuitCode' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='number' class='form-control' name='routerTieCableRackCode" + routerTieCableTab + "' id='routerTieCableRackCode" + routerTieCableTab + "' value='" + $('#routerTieCableRackCode' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='number' class='form-control' name='routerTieCableVUCode" + routerTieCableTab + "' id='routerTieCableVUCode" + routerTieCableTab + "' value='" + $('#routerTieCableVUCode' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableFloor" + routerTieCableTab + "' id='routerTieCableFloor" + routerTieCableTab + "' value='" + $('#routerTieCableFloor' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCableRoom" + routerTieCableTab + "' id='routerTieCableRoom" + routerTieCableTab + "' value='" + $('#routerTieCableRoom' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCablePortFrom" + routerTieCableTab + "' id='routerTieCablePortFrom" + routerTieCableTab + "' value='" + $('#routerTieCablePortFrom' + (routerTieCableTab - 1) + '').val() + "' /></td>";
				routerTieCableCols += "<td><input type='text' class='form-control' name='routerTieCablePortTo" + routerTieCableTab + "' id='routerTieCablePortTo" + routerTieCableTab + "' value='" + $('#routerTieCablePortTo' + (routerTieCableTab - 1) + '').val() + "' /></td>";
			}
			routerTieCableCols += '<td><input type="button" class="routerTieCableDel delNewRow active"  value="Delete"></td>';
			routerTieCableNewRow.append(routerTieCableCols);
			$("#routerTieCableSection tbody").append(routerTieCableNewRow);
			routerTieCableTab++;
		}
	});
	$("#routerTieCableSection").on("click", ".routerTieCableDel", function (event) {
		$(this).closest("tr").remove();
		routerTieCableTab -= 1;
	});
	//Router to Router
	if (key === "OnLoad") {
		var routertorouter = $('#routerToRouterSection tbody tr').length;
	} else {
		var routertorouter = 0;
	}
	$("#rtrAddRow").click(function () {
		var rtrNewRow = $("<tr>");
		var rtrCols = "";
		if ($("#routerToRouterSection tbody tr").length === 0) {
			rtrCols += "<td><input type='text' class='form-control' name='Subnet" + routertorouter + "' id='Subnet" + routertorouter + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='RouterFrom" + routertorouter + "' id='RouterFrom" + routertorouter + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='PortFrom" + routertorouter + "' id='PortFrom" + routertorouter + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='Subnet1" + routertorouter + "' id='Subnet1" + routertorouter + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='RouterTo" + routertorouter + "' id='RouterTo" + routertorouter + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='PortTo" + routertorouter + "' id='PortTo" + routertorouter + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='IPAddress" + routertorouter + "' id='IPAddress" + routertorouter + "' /></td>";
			rtrCols += '<td><input type="button" class="rtrDel delNewRow active" value="Delete"></td>';
		} else {
			rtrCols += "<td><input type='text' class='form-control' name='Subnet" + routertorouter + "' id='Subnet" + routertorouter + "' value='" + $('#Subnet' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='RouterFrom" + routertorouter + "' id='RouterFrom" + routertorouter + "' value='" + $('#RouterFrom' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='PortFrom" + routertorouter + "' id='PortFrom" + routertorouter + "' value='" + $('#PortFrom' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='Subnet1" + routertorouter + "' id='Subnet1" + routertorouter + "' value='" + $('#Subnet1' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='RouterTo" + routertorouter + "' id='RouterTo" + routertorouter + "' value='" + $('#RouterTo' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='PortTo" + routertorouter + "' id='PortTo" + routertorouter + "' value='" + $('#PortTo' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += "<td><input type='text' class='form-control' name='IPAddress" + routertorouter + "' id='IPAddress" + routertorouter + "' value='" + $('#IPAddress' + (routertorouter - 1) + '').val() + "' /></td>";
			rtrCols += '<td><input type="button" class="rtrDel delNewRow active" value="Delete"></td>';
		}

		rtrNewRow.append(rtrCols);
		$("#routerToRouterSection tbody").append(rtrNewRow);
		routertorouter++;
	});
	$("#routerToRouterSection").on("click", ".rtrDel", function (event) {
		$(this).closest("tr").remove();
		routertorouter -= 1;
	});
	$('#btnSubmit').click(function () {
		if ($('select[id^="hideandshow"]').val() != '-- Select --') {
			$('input[id^="TagOrStatus"]').val('PlannerUpdatedRecord');
			$('input[id^="EIN"]').val(editForm.vars.currentLoginName);
		}
	});
}
editForm.fn.fieldsHideAndShow = function (val) {
	switch (val) {
		case "Provide New Cards":
			$('.card-and-connectivity-field,.sme-container').show();
			$(".routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.card-recovery-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.cable-length-field,.card-des-field,.cards-field,.eng-cont-field,.po-available-field,.po-details-field,.req-dt-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field,.IP-address-field,.router-uplink-table,.router-tie-cable-table,.occupancy-commence-field,.when-termarea-field,.available13amp-socket-field,.provide-network-numr-field,.bert-field,.pew-req-field,.day-job-gcode-field,.planner-desc-field,.ein-field,.site-id-field,.acc-num-field,.provide-network-numr-field,.bt-ref-field,.bulid-name-field,.contractual-dts-field,.floor-field,.ctry-field,.occupy-premises-field,.customer-an-field,.customer-len-field,.customer-ler-field,.customer-req-dt-field,.dt-of-eng-visit-field,.etherway-access-bandwidth-field,.etherway-term-contract-field,.exc-constr-charges-field,.level-of-res-field,.order-dts-field,.overbooking-field,.pstcde-field,.rnan-field,.dns-rn-field,.room-field,.site-add-field,.site-visit-field,.socket13amp-field,.tele-num-field,.termarea-field,.time-scale-charges-field,.toc-field,.type-of-interface-field,.unique-ref-field,.vlans-field,.loc-ord-table,.site-contact-name-field,.KCI-updates-delivered-field,.contacted-for-KCIUpdates-field,.telephone-number-field,.customer-order-reference-field,.authorized-person-field,.primary-access-field,.engineer-contact-field,.associated-product-type-field,.time-service-outage-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").hide();
			editForm.fn.cardAndConnectivityFieldOnChange();
			break;
		case "Provide New Router":
			$('.sme-container').show();
			$(".routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.card-and-connectivity-field,.card-recovery-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.cable-length-field,.card-des-field,.cards-field,.eng-cont-field,.po-available-field,.po-details-field,.req-dt-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field,.IP-address-field,.router-uplink-table,.router-tie-cable-table,.occupancy-commence-field,.when-termarea-field,.available13amp-socket-field,.provide-network-numr-field,.bert-field,.pew-req-field,.day-job-gcode-field,.planner-desc-field,.ein-field,.site-id-field,.acc-num-field,.provide-network-numr-field,.bt-ref-field,.bulid-name-field,.contractual-dts-field,.floor-field,.ctry-field,.occupy-premises-field,.customer-an-field,.customer-len-field,.customer-ler-field,.customer-req-dt-field,.dt-of-eng-visit-field,.etherway-access-bandwidth-field,.etherway-term-contract-field,.exc-constr-charges-field,.level-of-res-field,.order-dts-field,.overbooking-field,.pstcde-field,.rnan-field,.dns-rn-field,.room-field,.site-add-field,.site-visit-field,.socket13amp-field,.tele-num-field,.termarea-field,.time-scale-charges-field,.toc-field,.type-of-interface-field,.unique-ref-field,.vlans-field,.loc-ord-table,.site-contact-name-field,.KCI-updates-delivered-field,.contacted-for-KCIUpdates-field,.telephone-number-field,.customer-order-reference-field,.authorized-person-field,.primary-access-field,.engineer-contact-field,.associated-product-type-field,.time-service-outage-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.provide-new-router-table").hide();
			editForm.fn.provideNewRouterOnchange();
			break;
		case "Card Recovery":
			$('.card-recovery-field,.sme-container').show();
			$(".routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.card-and-connectivity-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.cable-length-field,.card-des-field,.cards-field,.eng-cont-field,.po-available-field,.po-details-field,.req-dt-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field,.IP-address-field,.router-uplink-table,.router-tie-cable-table,.occupancy-commence-field,.when-termarea-field,.available13amp-socket-field,.provide-network-numr-field,.bert-field,.pew-req-field,.day-job-gcode-field,.planner-desc-field,.ein-field,.site-id-field,.acc-num-field,.provide-network-numr-field,.bt-ref-field,.bulid-name-field,.contractual-dts-field,.floor-field,.ctry-field,.occupy-premises-field,.customer-an-field,.customer-len-field,.customer-ler-field,.customer-req-dt-field,.dt-of-eng-visit-field,.etherway-access-bandwidth-field,.etherway-term-contract-field,.exc-constr-charges-field,.level-of-res-field,.order-dts-field,.overbooking-field,.pstcde-field,.rnan-field,.dns-rn-field,.room-field,.site-add-field,.site-visit-field,.socket13amp-field,.tele-num-field,.termarea-field,.time-scale-charges-field,.toc-field,.type-of-interface-field,.unique-ref-field,.vlans-field,.loc-ord-table,.site-contact-name-field,.KCI-updates-delivered-field,.contacted-for-KCIUpdates-field,.telephone-number-field,.customer-order-reference-field,.authorized-person-field,.primary-access-field,.engineer-contact-field,.associated-product-type-field,.time-service-outage-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").hide();
			editForm.fn.cardRecoveryFieldOnChange();
			break;
		case "One Siebel":
			$('.sme-container').show();
			$(".routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.card-recovery-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.cable-length-field,.card-des-field,.cards-field,.dns-rn-field,.eng-cont-field,.po-available-field,.po-details-field,.req-dt-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.card-and-connectivity-field,.patchpanel-router-uplink-field,.IP-address-field,.router-uplink-table,.router-tie-cable-table,.occupancy-commence-field,.when-termarea-field,.available13amp-socket-field,.provide-network-numr-field,.bert-field,.pew-req-field,.day-job-gcode-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").hide();
			$(".planner-desc-field,.ein-field,.site-id-field,.acc-num-field,.provide-network-numr-field,.bt-ref-field,.bulid-name-field,.contractual-dts-field,.floor-field,.ctry-field,.occupy-premises-field,.customer-an-field,.customer-len-field,.customer-ler-field,.customer-req-dt-field,.dt-of-eng-visit-field,.etherway-access-bandwidth-field,.etherway-term-contract-field,.exc-constr-charges-field,.level-of-res-field,.order-dts-field,.overbooking-field,.pstcde-field,.rnan-field,.room-field,.site-add-field,.site-visit-field,.socket13amp-field,.tele-num-field,.termarea-field,.time-scale-charges-field,.toc-field,.type-of-interface-field,.unique-ref-field,.vlans-field,.loc-ord-table,.site-contact-name-field,.KCI-updates-delivered-field,.contacted-for-KCIUpdates-field,.telephone-number-field,.customer-order-reference-field,.authorized-person-field,.primary-access-field,.engineer-contact-field,.associated-product-type-field,.time-service-outage-field").show();
			editForm.fn.autoPopulateOneSiebelValues();
			break;
		case "Connectivity/Jumpering/Cabling":
			$('.sme-container').show();
			$('.routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.card-recovery-field,.planner-desc-field,.site-id-field,.acc-num-field,.provide-network-numr-field,.available13amp-socket-field,.bt-ref-field,.bulid-name-field,.contractual-dts-field,.floor-field,.ctry-field,.occupy-premises-field,.customer-an-field,.customer-len-field,.customer-ler-field,.customer-req-dt-field,.dt-of-eng-visit-field,.etherway-access-bandwidth-field,.etherway-term-contract-field,.exc-constr-charges-field,.level-of-res-field,.occupancy-commence-field,.order-dts-field,.overbooking-field,.provide-network-numr-field,.pstcde-field,.rnan-field,.room-field,.site-add-field,.site-visit-field,.socket13amp-field,.tele-num-field,.termarea-field,.time-scale-charges-field,.toc-field,.type-of-interface-field,.unique-ref-field,.vlans-field,.when-termarea-field,.card-des-field,.cards-field,.eng-cont-field,.po-available-field,.po-details-field,.req-dt-field,.loc-ord-table,.router-uplink-table,.router-tie-cable-table,.site-contact-name-field,.KCI-updates-delivered-field,.contacted-for-KCIUpdates-field,.telephone-number-field,.customer-order-reference-field,.authorized-person-field,.primary-access-field,.engineer-contact-field,.associated-product-type-field,.time-service-outage-field,.card-and-connectivity-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field').hide();
			$('.dns-rn-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.ein-field,.IP-address-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field,.day-job-gcode-field').show();
			editForm.fn.hideshowPatchpanelRouter($('select[id^="PatchpanelRouterUPLink"]').val());
			$('select[id^="PatchpanelRouterUPLink"]').change(function () {
				editForm.fn.clearVal();
				editForm.fn.hideshowPatchpanelRouter($('select[id^="PatchpanelRouterUPLink"]').val());
				$('.night-job-gcode-field').hide();
			})
			break;
		default:
			$('.sme-container').hide();
			break;
	}
}
editForm.fn.hideshowPatchpanelRouter = function (val) {
	switch (val) {
		case "Patchpanel to Router":
			$('.routerDeliveryDate-field,.IP-address-field,.router-uplink-table,.router-tie-cable-table,.routerIPAddress-field,.additionalStores-field').hide();
			$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field').show();
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "");
			break;
		case "Router to Router/UPLink":
			$('.routerDeliveryDate-field,.IP-address-field,.ein-field,.dns-rn-field,.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table,.routerIPAddress-field,.additionalStores-field').hide();
			$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field,.router-uplink-table').show();
			editForm.fn.generateRouterToRouterRows("");
			break;
		case "Router to Router/via tie cable":
			$('.routerDeliveryDate-field,.IP-address-field,.router-uplink-table,.routerIPAddress-field,.additionalStores-field').hide();
			$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field,.router-tie-cable-table').show();
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "");
			editForm.fn.generateRouterTieCableEndRows("");
			break;
		case "Patchpanel to Router/WAN Links":
			$('.routerDeliveryDate-field,.IP-address-field,.router-uplink-table,.router-tie-cable-table,.routerIPAddress-field,.additionalStores-field').hide();
			$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.patchpanel-router-uplink-field').show();
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "");
			break;
		case "Router to Taps":
			$('.routerDeliveryDate-field,.routerIPAddress-field,.additionalStores-field,.engineer-notes-field,.provide-new-router-table,.tap-details-table,.card-details-table,.subcard-details-table,.optic-details-table,.tap-connectivity-details-table,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table').hide();
			break;
		default:
			$('.routerDeliveryDate-field,.routerIPAddress-field,.additionalStores-field,.engineer-notes-field,.provide-new-router-table,.tap-details-table,.card-details-table,.subcard-details-table,.optic-details-table,.tap-connectivity-details-table,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table').hide();
			break;
	}
}
editForm.fn.autoPopulateOneSiebelValues = function () {
	$('input[id^="CustomerOrderReference"]').val("WP" + $('input[id^="Title"]').val());
	if ($('input[id^="CustomerAccountName"]').val() === '') {
		$('input[id^="CustomerAccountName"]').val('BTGS IPVPN BTNET 21CNHE - INTERNAL REVENUE');
	}
	if ($('input[id^="ProvideNetworkNumber"]').val() === '') {
		$('input[id^="ProvideNetworkNumber"]').val('ETHN00020915');
	}
	if ($('input[id^="KCIUpdatesDelivered"]').val() === '') {
		$('input[id^="KCIUpdatesDelivered"]').val('Email');
	}
	if ($('input[id^="ContactedForKCIUpdates"]').val() === '') {
		$('input[id^="ContactedForKCIUpdates"]').val('Keith Hughes');
	}
	if ($('input[id^="TelephoneNumber"]').val() === '') {
		$('input[id^="TelephoneNumber"]').val('03316 641775');
	}
	if ($('input[id^="SiteVisit"]').val() === '') {
		$('input[id^="SiteVisit"]').val('Keith Hughes');
	}
	if ($('input[id^="SiteContactName"]').val() === '') {
		$('input[id^="SiteContactName"]').val('Keith Hughes (Off Side)');
	}
	if ($('input[id^="SiteContactTelephoneNumber"]').val() === '') {
		$('input[id^="SiteContactTelephoneNumber"]').val('03316 641775');
	}
	if ($('input[id^="ExcessConstructionCharges"]').val() === '') {
		$('input[id^="ExcessConstructionCharges"]').val('1');
	}
}
editForm.fn.cardAndConnectivityFieldOnChange = function () {
	switch ($('select[id^="CardAndConnectivity"] :selected').text()) {
		case "Card Infill":
			$(".day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field").show();
			$(".patchpanel-router-uplink-field,.ipid-aend-table,.ipid-zend-table,.router-uplink-table,.router-tie-cable-table,.night-job-gcode-field").hide();
			editForm.fn.generateCardDetails("");
			editForm.fn.generateSubcardDetails("");
			editForm.fn.generateOpticDetails("");
			break;
		case "Card and Connectivity":
			$('.patchpanel-router-uplink-field').show();
			$(".night-job-gcode-field,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.po-number-field").hide();
			editForm.fn.provideNewCardPatchpanelRouter($('select[id^="PatchpanelRouterUPLink"]').val());
			$('select[id^="PatchpanelRouterUPLink"]').change(function () {
				editForm.fn.clearVal();
				switch ($('select[id^="PatchpanelRouterUPLink"]').val()) {
					case "Patchpanel to Router":
						$('.night-job-gcode-field,.router-uplink-table,.router-tie-cable-table').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table").show();
						break;
					case "Router to Router/UPLink":
						$('.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table,.night-job-gcode-field').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table").show();
						break;
					case "Router to Router/via tie cable":
						$('.router-uplink-table,.night-job-gcode-field').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-tie-cable-table").show();
						break;
					case "Patchpanel to Router/WAN Links":
						$('.night-job-gcode-field,.router-uplink-table,.router-tie-cable-table').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table").show();
						break;
					case "Router To Taps":
						$('.routerIPAddress-field,.additionalStores-field,.routerDeliveryDate-field,.provide-new-router-table,.tap-details-table,.tap-connectivity-details-table,.engineer-notes-field,.card-details-table,.subcard-details-table,.optic-details-table,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.night-job-gcode-field').hide();
						break;
					default:
						$('.routerIPAddress-field,.additionalStores-field,.routerDeliveryDate-field,.provide-new-router-table,.tap-details-table,.tap-connectivity-details-table,.engineer-notes-field,.card-details-table,.subcard-details-table,.optic-details-table,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.night-job-gcode-field').hide();
						break;
				}
			});
			break;
		default:
			$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.patchpanel-router-uplink-field,.night-job-gcode-field').hide();
			break;
	}
}
editForm.fn.provideNewCardPatchpanelRouter = function () {
	switch ($('select[id^="PatchpanelRouterUPLink"]').val()) {
		case "Patchpanel to Router":
			$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table").show();
			$('.router-uplink-table,.router-tie-cable-table').hide();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "onLoad");
			break;
		case "Router to Router/UPLink":
			$('.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table').hide();
			$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table").show();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateRouterToRouterRows("");
			break;
		case "Router to Router/via tie cable":
			$('.router-uplink-table').hide();
			$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-tie-cable-table").show();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateRouterTieCableEndRows("onLoad");
			break;
		case "Patchpanel to Router/WAN Links":
			$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table").show();
			$('.router-uplink-table,.router-tie-cable-table').hide();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "onLoad");
			break;
		case "Router to Taps":
			$('.routerIPAddress-field,.additionalStores-field,.routerDeliveryDate-field,.provide-new-router-table,.tap-details-table,.tap-connectivity-details-table,.engineer-notes-field,.card-details-table,.subcard-details-table,.optic-details-table,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.night-job-gcode-field').hide();
			break;
		default:
			$('.routerIPAddress-field,.additionalStores-field,.routerDeliveryDate-field,.provide-new-router-table,.tap-details-table,.tap-connectivity-details-table,.engineer-notes-field,.card-details-table,.subcard-details-table,.optic-details-table,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.night-job-gcode-field').hide();
			break;
	}
}
editForm.fn.cardRecoveryFieldOnChange = function () {
	switch ($('select[id^="CardRecovery"] :selected').text()) {
		case "Recover Cards":
			$(".day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field").show();
			$(".patchpanel-router-uplink-field,.ipid-aend-table,.ipid-zend-table,.router-uplink-table,.router-tie-cable-table,.night-job-gcode-field,.routerIPAddress-field,.additionalStores-field,.provide-new-router-table,.ein-field,.bert-field").hide();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			break;
		case "Recover Card and Connectivity":
			$('.patchpanel-router-uplink-field').show();
			$(".night-job-gcode-field,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.po-number-field,.routerIPAddress-field,.additionalStores-field,.provide-new-router-table").hide();
			editForm.fn.provideNewCardPatchpanelRouter($('select[id^="PatchpanelRouterUPLink"]').val());
			$('select[id^="PatchpanelRouterUPLink"]').change(function () {
				editForm.fn.clearVal();
				switch ($('select[id^="PatchpanelRouterUPLink"]').val()) {
					case "Patchpanel to Router":
						$('.router-uplink-table,.router-tie-cable-table,.night-job-gcode-field').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table").show();
						break;
					case "Router to Router/UPLink":
						$('.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table,.night-job-gcode-field').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table").show();
						break;
					case "Router to Router/via tie cable":
						$('.router-uplink-table,.night-job-gcode-field').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-tie-cable-table").show();
						break;
					case "Patchpanel to Router/WAN Links":
						$('.router-uplink-table,.router-tie-cable-table,.night-job-gcode-field').hide();
						$(".dns-rn-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table").show();
						break;
					case "Router to Taps":
						$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.card-details-table,.subcard-details-table,.optic-details-table,.router-tie-cable-table,.night-job-gcode-field,.routerIPAddress-field,.additionalStores-field,.provide-new-router-table').hide();
						break;
					default:
						$('.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.card-details-table,.subcard-details-table,.optic-details-table,.router-tie-cable-table,.night-job-gcode-field,.routerIPAddress-field,.additionalStores-field,.provide-new-router-table').hide();
						break;
				}
			});
			break;
		default:
			$('.patchpanel-router-uplink-field,.day-job-gcode-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.night-job-gcode-field,.routerIPAddress-field,.additionalStores-field,.provide-new-router-table').hide();
			break;
	}
}
editForm.fn.provideNewRouterOnchange = function () {
	$('.patchpanel-router-uplink-field').show();
	$(".night-job-gcode-field,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.po-number-field,.routerIPAddress-field,.additionalStores-field").hide();
	editForm.fn.provideNewRouter($('select[id^="PatchpanelRouterUPLink"]').val());
	$('select[id^="PatchpanelRouterUPLink"]').change(function () {
		editForm.fn.clearVal();
		switch ($('select[id^="PatchpanelRouterUPLink"]').val()) {
			case "Patchpanel to Router":
				$('.tap-connectivity-details-table,.tap-details-table,.router-uplink-table,.router-tie-cable-table').hide();
				$(".dns-rn-field,.routerDeliveryDate-field,.routerIPAddress-field,.additionalStores-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table,.provide-new-router-table").show();
				break;
			case "Router to Router/UPLink":
				$('.tap-connectivity-details-table,.tap-details-table,.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table').hide();
				$(".dns-rn-field,.routerDeliveryDate-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
				break;
			case "Router to Router/via tie cable":
				$('.tap-connectivity-details-table,.tap-details-table,.router-uplink-table').hide();
				$(".dns-rn-field,.routerDeliveryDate-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-tie-cable-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
				break;
			case "Patchpanel to Router/WAN Links":
				$('.dns-rn-field,.tap-connectivity-details-table,.tap-details-table,.router-uplink-table,.router-tie-cable-table').hide();
				$(".routerDeliveryDate-field,.routerIPAddress-field,.additionalStores-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table,.provide-new-router-table").show();
				break;
			case "Router to Taps":
				$('.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table').hide();
				$(".dns-rn-field,.routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
				break;
			default:
				$('.routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.day-job-gcode-field,.day-night-split-field,.night-job-gcode-field,.provide-new-router-table,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.routerIPAddress-field,.additionalStores-field').hide();
				break;
		}
	});
}
editForm.fn.provideNewRouter = function () {
	switch ($('select[id^="PatchpanelRouterUPLink"]').val()) {
		case "Patchpanel to Router":
			$(".dns-rn-field,.routerDeliveryDate-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
			$('.router-uplink-table,.router-tie-cable-table').hide();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "onLoad");
			break;
		case "Router to Router/UPLink":
			$('.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table').hide();
			$(".dns-rn-field,.routerDeliveryDate-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateRouterToRouterRows("");
			break;
		case "Router to Router/via tie cable":
			$('.router-uplink-table').hide();
			$(".dns-rn-field,.routerDeliveryDate-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-tie-cable-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateRouterTieCableEndRows("onLoad");
			break;
		case "Patchpanel to Router/WAN Links":
			$(".dns-rn-field,.routerDeliveryDate-field,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.ipid-aend-table,.ipid-zend-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
			$('.router-uplink-table,.router-tie-cable-table').hide();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateIPIDAEndRows(editForm.vars.productQuantity, "onLoad");
			editForm.fn.generateIPIDZEndRows(editForm.vars.productQuantity, "onLoad");
			break;
		case "Router to Taps":
			$('.ipid-aend-table,.ipid-zend-table,.router-tie-cable-table').hide();
			$(".dns-rn-field,.routerDeliveryDate-field,.tap-connectivity-details-table,.tap-details-table,.cable-length-field,.day-night-split-field,.template-code-desc-field,.template-code-field,.day-job-gcode-field,.ein-field,.bert-field,.pew-req-field,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field,.router-uplink-table,.provide-new-router-table,.routerIPAddress-field,.additionalStores-field").show();
			editForm.fn.generateCardDetails("onLoad");
			editForm.fn.generateSubcardDetails("onLoad");
			editForm.fn.generateOpticDetails("onLoad");
			editForm.fn.generateRouterToRouterRows("onLoad");
			editForm.fn.generateRouterTapsRows("onLoad");
			editForm.fn.generateRouterTapsConnectivityRows("onLoad");
			break;
		default:
			$('.routerDeliveryDate-field,.day-job-gcode-field,.day-night-split-field,.night-job-gcode-field,.provide-new-router-table,.template-code-desc-field,.template-code-field,.IP-address-field,.router-uplink-table,.dns-rn-field,.ein-field,.cable-length-field,.bert-field,.pew-req-field,.po-number-field,.ipid-aend-table,.ipid-zend-table,.previous-workpackageId-field,.quantity-cards-field,.GSStoresEquipmentDetails-field,.router-tie-cable-table,.card-details-table,.subcard-details-table,.optic-details-table,.engineer-notes-field').hide();
			break;
	}
}
editForm.fn.onchangeDropdownFields = function () {
	switch ($('select[id^="socket13AMP"]').val()) {
		case "-- Select --":
		case "Yes":
			$('.available13amp-socket-field').hide()
			break;
		case "No":
			$('.available13amp-socket-field').show()
			break;
	}
	$('select[id^="socket13AMP"]').change(function () {
		switch ($(this).val()) {
			case "-- Select --":
			case "Yes":
				$('.available13amp-socket-field').hide()
				$('input[id^="Available13AMPSocket"]').val('')
				break;
			case "No":
				$('.available13amp-socket-field').show()
				$('input[id^="Available13AMPSocket"]').val('')
				break;
		}
	})
	switch ($('select[id^="CurrentPremises"]').val()) {
		case "-- Select --":
		case "Yes":
			$('.occupancy-commence-field').hide()
			break;
		case "No":
			$('.occupancy-commence-field').show()
			break;
	}
	$('select[id^="CurrentPremises"]').change(function () {
		switch ($(this).val()) {
			case "-- Select --":
			case "Yes":
				$('.occupancy-commence-field').hide()
				$('input[id^="OccupancyCommence"]').val('')
				break;
			case "No":
				$('.occupancy-commence-field').show()
				$('input[id^="OccupancyCommence"]').val('')
				break;
		}
	})
	switch ($('select[id^="TerminationArea"]').val()) {
		case "-- Select --":
		case "Yes":
			$('.when-termarea-field').hide()
			break;
		case "No":
			$('.when-termarea-field').show()
			break;
	}
	$('select[id^="TerminationArea"]').change(function () {
		switch ($(this).val()) {
			case "-- Select --":
			case "Yes":
				$('.when-termarea-field').hide()
				$('input[id^="WhenTerminationArea"]').val('')
				break;
			case "No":
				$('.when-termarea-field').show()
				$('input[id^="WhenTerminationArea"]').val('')
				break;
		}
	})
	$('select[id^="EtherwayAccessBandwidth"]').change(function () {
		switch ($(this).val()) {
			case "1Gb":
				$('select[id^="TypeOfInterface"]').val('1000BaseLX')
				break;
			case "10Gb":
				$('select[id^="TypeOfInterface"]').val('10GBaseLR')
				break;
		}
	});
	$('input[id^="DayNightSplit"]').change(function () {
		if (this.checked) {
			$('.night-job-gcode-field').show()
			$('input[id^="DayJobGCode"],input[id^="NightJobGCode"]').val('');
		} else {
			$('.night-job-gcode-field').hide()
			$('input[id^="DayJobGCode"],input[id^="NightJobGCode"]').val('');
		}
	});
	$('select[id^="TemplateCodeDesc"]').change(function () {
		$("#daySelectedGCodeData,#nightSelectedGCodeData").empty();
		descSelectedValue = $('select[id^="TemplateCodeDesc"] option:selected').text();
		if (descSelectedValue != '(None)') {
			templateCodeUrl = "?$select=ID,Title,*&$top=1000&$filter=Description eq '" + encodeURIComponent(descSelectedValue) + "'"
			editForm.fn.getListItems(editForm.vars.webUrl, "Template Code Lookup", templateCodeUrl, true).done(function (data) {
				$('input[id^="TemplateCode"]').val(data[0].Title)
				editForm.fn.loadTemplateCode();
			})
		}
	})
	$('select[id^="CardAndConnectivity"]').change(function () {
		editForm.fn.cardAndConnectivityFieldOnChange();
		editForm.fn.clearVal();
	})
	$('select[id^="CardRecovery"]').change(function () {
		editForm.fn.cardRecoveryFieldOnChange();
		editForm.fn.clearVal();
	});
	$("select[id^='provideRouterType']").change(function () {
		$("select[id='selectProvideRouterBuild']").empty();
		var provideRouterQuery = "?$select=ID,Title,*&$top=1000";
		editForm.fn.getListItems(editForm.vars.webUrl, "Router Card Templates", provideRouterQuery, true).done(function (data) {
			$.each(data, function (key, val) {
				if (val.Router_x0020_Item_x0020_Code === $("select[id^='provideRouterType'] option:selected").text()) {
					$("select[id='selectProvideRouterBuild']").append($('<option>').val(val.Router_x0020_Build).text(val.Router_x0020_Build));
				}
			});
			var provideRouterBuild = {};
			$("select[id='selectProvideRouterBuild']>option").each(function () {
				if (provideRouterBuild[this.text]) {
					$(this).remove();
				}
				else {
					provideRouterBuild[this.text] = this.value;
				}
			});
		});
	});
}
editForm.fn.loadTemplateCode = function () {
	if ($('input[id^="TemplateCode"]').val() != "") {
		var query = "?$select=ID,Title,*&$top=1000&$filter=Title eq '" + $('input[id^="TemplateCode"]').val() + "'";
		editForm.fn.getListItems(editForm.vars.webUrl, "GCode Lookup", query, true).done(function (data) {
			editForm.fn.bindGCodeData(data);
		})
	}
}
editForm.fn.clearVal = function () {
	editForm.vars.inputFields = ["EIN", "RoadNameAndNumber", "BTReference", "AccountNumber", "Room", "Floor", "Available13AMPSocket", "OccupancyCommence", "WhenTerminationArea", "DNSRouterName", "PODetails", "Cards", "CableLength", "PONumber", "IPAddress", "DayJobGCode", "NightJobGCode", "SiteId", "TemplateCode"];
	editForm.vars.textareaFields = ["CardDescription", "LocationDetails", "IPIDAEnd", "IPIDZEnd", "RouterUPLinkDetails", "EngineerNotes", "CardDetails", "SubcardDetails", "OpticDetails", "provideNewRouter"];
	editForm.vars.checkboxFields = ["POAvailable", "DayNightSplit"];
	editForm.vars.dateFields = ["CustomerRequiredDate", "RequiredDate"];
	$('select[id^="TemplateCodeDesc"] option:selected').text('(None)');
	$.each(editForm.vars.inputFields, function (key, value) {
		$('input[id^="' + value + '"]').val("");
	});
	$.each(editForm.vars.textareaFields, function (key, value) {
		$('div[aria-labelledby^=' + value + ']').text('');
		$('textarea[id^="' + value + '"]').val("");
	});
	$.each(editForm.vars.checkboxFields, function (key, value) {
		$('input[id^="' + value + '"]').prop('checked', false)
	});
	$.each(editForm.vars.dateFields, function (key, value) {
		$('input[id^="' + value + '"]').val('');
		$('select[id^="' + value + '"]').prop('selectedIndex', 0)
	});
	$('#cardDetails tbody tr').remove();
	$('#subCardDetails tbody tr').remove();
	$('#opticDetails tbody tr').remove();
	$('#loc_ide_ord_table tr').remove();
	$('#ipid_aend_tbody tr').remove();
	$('#ipid_zend_tbody tr').remove();
	$('#routerToRouterSection tbody tr').remove();
	$('#daySelectedGCodeData tr').remove();
	$('#nightSelectedGCodeData tr').remove();
	$('#cardDetails tbody tr').each(function () {
		$($(this).children()[0]).children().val(""),
			$($(this).children()[1]).children().val(""),
			$($(this).children()[2]).children().val(""),
			$($(this).children()[3]).children().val("")
	});
	$('#subCardDetails tbody tr').each(function () {
		$($(this).children()[0]).children().val(""),
			$($(this).children()[1]).children().val(""),
			$($(this).children()[2]).children().val(""),
			$($(this).children()[3]).children().val(""),
			$($(this).children()[4]).children().val(""),
			$($(this).children()[5]).children().val("")
	});
	$('#opticDetails tbody tr').each(function () {
		$($(this).children()[0]).children().val(""),
			$($(this).children()[1]).children().val(""),
			$($(this).children()[2]).children().val(""),
			$($(this).children()[3]).children().val(""),
			$($(this).children()[4]).children().val(""),
			$($(this).children()[5]).children().val("")
	});
	$('#loc_ide_ord_table tr').each(function () {
		$($(this).children()[0]).children().val("")
		$($(this).children()[1]).children().val("")
		$($(this).children()[2]).children().val("")
		$($(this).children()[3]).children().val("")
		$($(this).children()[4]).children().val("")
		$($(this).children()[5]).children().val("")
		$($(this).children()[6]).children().val("")
		$($(this).children()[7]).children().val("")
	})
	$('#ipid_aend_tbody tr').each(function () {
		$($(this).children()[0]).children().val("")
		$($(this).children()[1]).children().val("")
		$($(this).children()[2]).children().val("")
		$($(this).children()[3]).children().val("")
		$($(this).children()[4]).children().val("")
		$($(this).children()[5]).children().val("")
		$($(this).children()[6]).children().val("")
		$($(this).children()[7]).children().val("")
	})
	$('#ipid_zend_tbody tr').each(function () {
		$($(this).children()[0]).children().val("")
		$($(this).children()[1]).children().val("")
		$($(this).children()[2]).children().val("")
		$($(this).children()[3]).children().val("")
		$($(this).children()[4]).children().val("")
		$($(this).children()[5]).children().val("")
		$($(this).children()[6]).children().val("")
		$($(this).children()[7]).children().val("")
	})
	$('#routerToRouterSection tbody tr').each(function () {
		$($(this).children()[0]).children().val("")
		$($(this).children()[1]).children().val("")
		$($(this).children()[2]).children().val("")
		$($(this).children()[3]).children().val("")
	})
	$('#daySelectedGCodeData tr').each(function () {
		$($(this).children()[0]).children().val(""),
			$($(this).children()[1]).children().val(""),
			$($(this).children()[2]).children().prop('checked', false)
	});
	$('#nightSelectedGCodeData tr').each(function () {
		$($(this).children()[0]).children().val(""),
			$($(this).children()[1]).children().val(""),
			$($(this).children()[2]).children().prop('checked', false)
	});
}
editForm.fn.validation = function (val) {
	var valid = true;
	var oneSiebelFields = [{ "Id": "CustomerAccountName", "FieldType": "input" }, { "Id": "CustomerLegalEntityReference", "FieldType": "input" }, { "Id": "CustomerLegalEntityName", "Fieldtype": "input" }, { "Id": "ServicePoint", "FieldType": "input" }, { "Id": "UniqueReference", "FieldType": "input" }, { "Id": "AddEtherwayNetwork", "FieldType": "input" }, { "Id": "EtherwayAccessBandwidth", "FieldType": "textarea" }, { "Id": "LevelOfResilience", "FieldType": "textarea" }, { "Id": "TypeOfInterface", "FieldType": "textarea" }, { "Id": "TimescaleCharges", "FieldType": "input" }, { "Id": "VLANSegmentation", "FieldType": "input" }, { "Id": "CustomerRequiredDate", "FieldType": "input" }, { "Id": "SiteVisit", "FieldType": "input" }, { "Id": "TelephoneNumber", "FieldType": "input" }];
	// $.each(oneSiebelFields, function (key, value) {
	// 	switch (val) {
	// 		case "One Siebel":
	// 			switch (value.FieldType) {
	// 				case "input":
	// 					if ($('input[id^="' + value.Id + '"]').val() === "") {
	// 						valid = false;
	// 						$('input[id^="' + value.Id + '"]').css('border', '1px solid red');
	// 					}
	// 				case "textarea":
	// 					if ($('textarea[id^="' + value.Id + '"]').val() === "") {
	// 						valid = false;
	// 						$('textarea[id^="' + value.Id + '"]').css('border', '1px solid red');
	// 					}
	// 				case "date":
	// 					if ($('input[id^="' + value.Id + '"]').val() === "") {
	// 						valid = false;
	// 						$('input[id^="' + value.Id + '"]').css('border', '1px solid red');
	// 					}
	// 			}
	// 			$('#loc_ide_ord_table tr').each(function () {
	// 				if ($($(this).children()[1]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[1]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[1]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[2]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[2]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[2]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[3]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[3]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[3]).children().css('border', '1px solid #bbb');
	// 				}
	// 			});
	// 			break;
	// 		case "Card and Connectivity":
	// 			if ($('input[id^="ServicePoint"]').val() === "") {
	// 				valid = false;
	// 				$('input[id^="ServicePoint"]').css('border', '1px solid red');
	// 			}
	// 			$('#ipid_aend_tbody tr').each(function () {
	// 				if ($($(this).children()[1]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[1]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[1]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[2]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[2]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[2]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[3]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[3]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[3]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[4]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[4]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[4]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[5]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[5]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[5]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[6]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[6]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[6]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[7]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[7]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[7]).children().css('border', '1px solid #bbb');
	// 				}
	// 			});
	// 			break;
	// 		case "Connectivity/Jumpering/Cabling":
	// 			$('#ipid_zend_tbody tr').each(function () {
	// 				if ($($(this).children()[1]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[1]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[1]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[2]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[2]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[2]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[3]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[3]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[3]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[4]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[4]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[4]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[5]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[5]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[5]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[6]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[6]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[6]).children().css('border', '1px solid #bbb');
	// 				}
	// 				if ($($(this).children()[7]).children().val() === "") {
	// 					valid = false;
	// 					$($(this).children()[7]).children().css('border', '1px solid red');
	// 				} else {
	// 					$($(this).children()[7]).children().css('border', '1px solid #bbb');
	// 				}
	// 			});
	// 			break;
	// 	}
	// });
	return valid;
}
editForm.fn.allowNumberField = function (evt) {
	evt = (evt) ? evt : window.event;
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	if (charCode > 31 && (charCode < 48 || charCode > 57)) {
		return false;
	}
	return true;
}
editForm.fn.submitData = function () {
	var isValidForm = editForm.fn.validation($('select[id^="hideandshow"]').val());
	if (isValidForm) {
		editForm.vars.cardDetailsValues = [];
		$('#cardDetails tbody tr').each(function () {
			editForm.vars.cardDetailsValues.push({
				"cardrouterDNSName": $($(this).children()[0]).children().val(),
				"cardType": $($(this).children()[1]).children().val(),
				"slot": $($(this).children()[2]).children().val(),
				"cardPONumber": $($(this).children()[3]).children().val()
			});
		});
		editForm.vars.subCardDetailsValues = [];
		$('#subCardDetails tbody tr').each(function () {
			editForm.vars.subCardDetailsValues.push({
				"subrouterDNSName": $($(this).children()[0]).children().val(),
				"subcardType": $($(this).children()[1]).children().val(),
				"subQuantity": $($(this).children()[2]).children().val(),
				"slotFrom": $($(this).children()[3]).children().val(),
				"slotTo": $($(this).children()[4]).children().val(),
				"subPONumber": $($(this).children()[5]).children().val()
			});
		});
		editForm.vars.opticDetailsValues = [];
		$('#opticDetails tbody tr').each(function () {
			editForm.vars.opticDetailsValues.push({
				"opticrouterDNSName": $($(this).children()[0]).children().val(),
				"opticType": $($(this).children()[1]).children().val(),
				"opticQuantity": $($(this).children()[2]).children().val(),
				"portFrom": $($(this).children()[3]).children().val(),
				"portTo": $($(this).children()[4]).children().val(),
				"opticPONumber": $($(this).children()[5]).children().val()
			});
		});
		editForm.vars.tableValues = [];
		$('#loc_ide_ord_table tr').each(function () {
			editForm.vars.tableValues.push({
				"Location": $($(this).children()[0]).children().val(),
				"IdentifierNextOrder": $($(this).children()[1]).children().val(),
				"NextOrder": $($(this).children()[2]).children().val(),
				"LocEX1141Code": $($(this).children()[3]).children().val(),
				"LocSuiteCode": $($(this).children()[4]).children().val(),
				"LocRackCode": $($(this).children()[5]).children().val(),
				"VUCode": $($(this).children()[6]).children().val(),
				"ServicePoint": $($(this).children()[7]).children().val()
			});
		});
		editForm.vars.ipidaendValues = [];
		$('#ipid_aend_tbody tr').each(function () {
			editForm.vars.ipidaendValues.push({
				"IPIDAEndEX1141Code": $($(this).children()[0]).children().val(),
				"IPIDAEndSuitCode": $($(this).children()[1]).children().val(),
				"IPIDAEndRackCode": $($(this).children()[2]).children().val(),
				"IPIDAEndVUCode": $($(this).children()[3]).children().val(),
				"IPIDAEndFloor": $($(this).children()[4]).children().val(),
				"IPIDAEndRoom": $($(this).children()[5]).children().val(),
				"IPIDAEndPortFrom": $($(this).children()[6]).children().val(),
				"IPIDAEndPortTo": $($(this).children()[7]).children().val(),
			});
		});
		editForm.vars.ipidzendValues = [];
		$('#ipid_zend_tbody tr').each(function () {
			editForm.vars.ipidzendValues.push({
				"IPIDZEndEX1141Code": $($(this).children()[0]).children().val(),
				"IPIDZEndSuitCode": $($(this).children()[1]).children().val(),
				"IPIDZEndRackCode": $($(this).children()[2]).children().val(),
				"IPIDZEndVUCode": $($(this).children()[3]).children().val(),
				"IPIDZEndFloor": $($(this).children()[4]).children().val(),
				"IPIDZEndRoom": $($(this).children()[5]).children().val(),
				"IPIDZEndPortFrom": $($(this).children()[6]).children().val(),
				"IPIDZEndPortTo": $($(this).children()[7]).children().val(),
			});
		});
		editForm.vars.routerTieCableValues = [];
		$('#router_tie_cable_tbody tr').each(function () {
			editForm.vars.routerTieCableValues.push({
				"routertieheader": $($(this).children()[0]).text(),
				"routerTieCableEX1141Code": $($(this).children()[1]).children().val(),
				"routerTieCableSuitCode": $($(this).children()[2]).children().val(),
				"routerTieCableRackCode": $($(this).children()[3]).children().val(),
				"routerTieCableVUCode": $($(this).children()[4]).children().val(),
				"routerTieCableFloor": $($(this).children()[5]).children().val(),
				"routerTieCableRoom": $($(this).children()[6]).children().val(),
				"routerTieCablePortFrom": $($(this).children()[7]).children().val(),
				"routerTieCablePortTo": $($(this).children()[8]).children().val(),
			});
		});
		editForm.vars.routertorouter = [];
		$('#routerToRouterSection tbody tr').each(function () {
			editForm.vars.routertorouter.push({
				"Subnet": $($(this).children()[0]).children().val(),
				"RouterFrom": $($(this).children()[1]).children().val(),
				"PortFrom": $($(this).children()[2]).children().val(),
				"Subnet1": $($(this).children()[3]).children().val(),
				"RouterTo": $($(this).children()[4]).children().val(),
				"PortTo": $($(this).children()[5]).children().val(),
				"IPAddress": $($(this).children()[6]).children().val()
			});
		});
		editForm.vars.tbodyDayGCode = [];
		$('#daySelectedGCodeData tr').each(function () {
			editForm.vars.tbodyDayGCode.push({
				"DayGCode": $($(this).children()[0]).children().val(),
				"DayQuantity": $($(this).children()[1]).children().val(),
				"DayJobPackTemplate": $($(this).children()[2]).children().is(':checked')
			});
		});
		editForm.vars.tbodyNightGCode = [];
		$('#nightSelectedGCodeData tr').each(function () {
			editForm.vars.tbodyNightGCode.push({
				"NightGCode": $($(this).children()[0]).children().val(),
				"NightQuantity": $($(this).children()[1]).children().val(),
				"NightJobPackTemplate": $($(this).children()[2]).children().is(':checked')
			});
		});
		$('textarea[id^="CardDetails"]').val(JSON.stringify(editForm.vars.cardDetailsValues));
		$('textarea[id^="SubcardDetails"]').val(JSON.stringify(editForm.vars.subCardDetailsValues));
		$('textarea[id^="OpticDetails"]').val(JSON.stringify(editForm.vars.opticDetailsValues));
		// $('textarea[id^="provideNewRouter"]').val(JSON.stringify(editForm.vars.provideNewRouterValues));
		$('textarea[id^="LocationDetails"]').val(JSON.stringify(editForm.vars.tableValues));
		$('textarea[id^="IPIDAEnd"]').val(JSON.stringify(editForm.vars.ipidaendValues));
		$('textarea[id^="IPIDZEnd"]').val(JSON.stringify(editForm.vars.ipidzendValues));
		$('textarea[id^="RouterTieCable"]').val(JSON.stringify(editForm.vars.routerTieCableValues));
		$('textarea[id^="RouterUPLinkDetails"]').val(JSON.stringify(editForm.vars.routertorouter));
		$('textarea[id^="DayJobGCode"]').val(JSON.stringify(editForm.vars.tbodyDayGCode));
		$('textarea[id^="NightJobGCode"]').val(JSON.stringify(editForm.vars.tbodyNightGCode));
		$('input[id^="provideRouterBuild"]').val($("select[id='selectProvideRouterBuild'] option:selected").val());
		setTimeout(function () {
			$($('[id$="SaveItem"]')[1]).trigger('click');
		}, 200);
	} else {
		alert("Please fill all mandatory fields");
	}

}
editForm.fn.cancel = function () {
	window.location = "/sites/ProdIPID/Lists/IPIDAutomation/AllItems.aspx";
}
/**************************************************************************/
/// Function name: getListItems
/// Summary:  To get list items by REST using filter query
/**************************************************************************/
editForm.fn.getListItems = function (url, listname, query, sync) {
	var dfd = $.Deferred();

	$.ajax({
		url: url + "/_api/web/lists/getbytitle('" + listname + "')/items" + query,
		async: sync,
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" },
		success: function (data) {
			dfd.resolve(data.d.results);
		},
		error: function (data) {
			dfd.reject(JSON.stringify(data));
		}
	});
	return dfd.promise();
};
/**************************************************************************/
/// Function name: getCurrentUserDetails
/// Summary:  To get login user details by REST using filter query
/**************************************************************************/
editForm.fn.getCurrentUserDetails = function (url, userID, sync) {
	var dfd = $.Deferred();
	$.ajax({
		url: url + "/_api/web/getuserbyid(" + userID + ")",
		async: !sync,
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" },
		success: function (data) {
			dfd.resolve(data);
		},
		error: function (data) {
			dfd.reject(JSON.stringify(data));
		}
	});
	return dfd.promise();
}
