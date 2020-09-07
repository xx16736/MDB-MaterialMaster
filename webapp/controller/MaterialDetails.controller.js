sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.newell.fiori.HelloWorld.controller.MaterialDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.newell.fiori.HelloWorld.view.MaterialDetails
		 */
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("RouteMatDetails").attachPatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sPath = this.getOwnerComponent().getModel("config").getProperty("/selectedMatPath");
			var index = sPath.split("/")[sPath.split("/").length -1];
			// this.byId("setActivePage").setActivePage();
			this.byId("idCarousel").setActivePage(this.byId("idCarousel").getPages()[index]);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.newell.fiori.HelloWorld.view.MaterialDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.newell.fiori.HelloWorld.view.MaterialDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.newell.fiori.HelloWorld.view.MaterialDetails
		 */
		//	onExit: function() {
		//
		//	}

	});

});