sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createAppConfigModel: function () {
			var oModel = new JSONModel();
			var oData = {
				"images": jQuery.sap.getModulePath("com.newell.fiori.HelloWorld.img"),
				"imgName": "NW_WHITE_BG.png"
			};
			oModel.setData(oData);
			return oModel;
		},

	};
});