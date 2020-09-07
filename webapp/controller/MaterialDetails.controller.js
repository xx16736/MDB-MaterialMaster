sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function (Controller, Fragment, MessageToast) {
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
			var index = sPath.split("/")[sPath.split("/").length - 1];
			// this.byId("setActivePage").setActivePage();
			this.byId("idCarousel").setActivePage(this.byId("idCarousel").getPages()[index]);
		},

		onAskQues: function () {
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "com.newell.fiori.HelloWorld.view.fragments.AskQuestion",
				controller: this
			}).then(function (dialog) {
				this._oAskQuestionDialog = dialog;
				oView.addDependent(this._oAskQuestionDialog);
				this._oAskQuestionDialog.open();

				this.getOwnerComponent().getModel("askQues").setProperty("/MatId", "001");
			}.bind(this));
		},

		onSubmitAskQues: function () {
			var appId = "app-001-nntbv"; // Set Realm app ID here.
			var oData = this.getView().getModel("askQues").getData();
			var appConfig = {
				id: appId,
				timeout: 1000,
			};
			var app1 = new Realm.App(appConfig);
			var credentials = Realm.Credentials.anonymous(); // create an anonymous credential
			sap.ui.core.BusyIndicator.show();
			var user = this.fetchUser(app1, credentials).then(function () {
				var x = app1.functions.postInquiry(oData).then(function () {
					MessageToast.show("created");
					this.onCloseAskQuesDialog();
					var user = this.fetchUser(app1, credentials).then(function () {
						var x = app1.functions.getMaterialsWithInquiries().then(function (oResponse) {
							this.getView().getModel("materials").setData(oResponse);
							this.getView().getModel("materials").updateBindings();
							this.getView().getModel("config").setProperty("/materialcount", oResponse.length);
							sap.ui.core.BusyIndicator.hide();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		
		},
		
		fetchUser: function (app, credentials) {
			return new Promise(function (fnResolve, fnReject) {
				var user = app.logIn(credentials).then(function () {
					fnResolve(user);
				});
			}.bind(this));
		},

		onCloseAskQuesDialog: function () {
			this._oAskQuestionDialog.close();
			this._oAskQuestionDialog.destroy();
			this.getView().getModel("askQues").setData({});
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