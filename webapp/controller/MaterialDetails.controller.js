sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"com/newell/fiori/HelloWorld/libs/Download",
	"sap/m/Dialog",
], function (Controller, Fragment, MessageToast, Download, Dialog) {
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
			//this.fetchMaterialImage();
			this.pageChanged();
		},

		fetchMaterialImage: function (sMatId) {
			//sMatId = "01";
			var oModel = this.getOwnerComponent().getModel("config");
			var sURL = oModel.getProperty("/PortalURL") + sMatId + oModel.getProperty("/ImgExtension");
			oModel.setProperty("/ImageURL", sURL);
		},

		pageChanged: function (oEvent) {
			var sIndex = this.byId("idCarousel").getActivePage().split("-")[this.byId("idCarousel").getActivePage().split("-").length - 1];
			var sMatId = this.byId("idCarousel").getPages()[sIndex].getBindingContext("materials").getObject().MatId;
			this.fetchMaterialImage(sMatId);
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

				var sIndex = this.byId("idCarousel").getActivePage().split("-")[this.byId("idCarousel").getActivePage().split("-").length - 1];
				var sMatId = this.byId("idCarousel").getPages()[sIndex].getBindingContext("materials").getObject().MatId;
				this.getOwnerComponent().getModel("askQues").setProperty("/MatId", sMatId);
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

		showInquiries: function () {
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "com.newell.fiori.HelloWorld.view.fragments.Inquiries",
				controller: this
			}).then(function (dialog) {
				this._oInquiriesDialog = dialog;
				oView.addDependent(this._oInquiriesDialog);
				this._oInquiriesDialog.open();
				var sIndex = this.byId("idCarousel").getActivePage().split("-")[this.byId("idCarousel").getActivePage().split("-").length - 1];
				var oContext = this.byId("idCarousel").getPages()[sIndex].getBindingContext("materials");
				var sPath = oContext.getPath();
				this.byId("inquiryList").bindElement({ path: sPath, model: "materials" });
				
				this.byId("inquiryListNL").bindElement({ path: sPath, model: "materials" });

				// var sIndex = this.byId("idCarousel").getActivePage().split("-")[this.byId("idCarousel").getActivePage().split("-").length - 1];
				// var sMatId = this.byId("idCarousel").getPages()[sIndex].getBindingContext("materials").getObject().MatId;
				// this.getOwnerComponent().getModel("askQues").setProperty("/MatId", sMatId);
			}.bind(this));
		},
		
		onCloseInquiryDialog: function () {
			this._oInquiriesDialog.close();
			this._oInquiriesDialog.destroy();
		},

		onUpdateMatInfo: function () {
			var appId = "app-001-nntbv"; // Set Realm app ID here.
			var sIndex = this.byId("idCarousel").getActivePage().split("-")[this.byId("idCarousel").getActivePage().split("-").length - 1];
			var oData = this.byId("idCarousel").getPages()[sIndex].getBindingContext("materials").getObject();
			var appConfig = {
				id: appId,
				timeout: 1000,
			};
			var app1 = new Realm.App(appConfig);
			var credentials = Realm.Credentials.anonymous(); // create an anonymous credential
			sap.ui.core.BusyIndicator.show();
			var user = this.fetchUser(app1, credentials).then(function () {
				var x = app1.functions.updateMaterial(oData).then(function () {
					MessageToast.show("updated");
					sap.ui.core.BusyIndicator.hide();
					/*var user = this.fetchUser(app1, credentials).then(function () {
						var x = app1.functions.getMaterialsWithInquiries().then(function (oResponse) {
							this.getView().getModel("materials").setData(oResponse);
							this.getView().getModel("materials").updateBindings();
							this.getView().getModel("config").setProperty("/materialcount", oResponse.length);
							sap.ui.core.BusyIndicator.hide();
						}.bind(this));
					}.bind(this));*/
				}.bind(this));
			}.bind(this));

		},

		onDeleteMat: function () {
			var sIndex = this.byId("idCarousel").getActivePage().split("-")[this.byId("idCarousel").getActivePage().split("-").length - 1];
			var sNewIndex = parseInt(sIndex, 10) + 1;
			//this.byId("idCarousel").setActivePage(this.byId("idCarousel").getPages()[index]);
			var oData = this.byId("idCarousel").getPages()[sIndex].getBindingContext("materials").getObject();

			var appId = "app-001-nntbv"; // Set Realm app ID here.
			var appConfig = {
				id: appId,
				timeout: 1000,
			};
			var app1 = new Realm.App(appConfig);
			var credentials = Realm.Credentials.anonymous(); // create an anonymous credential
			sap.ui.core.BusyIndicator.show();
			var user = this.fetchUser(app1, credentials).then(function () {
				var x = app1.functions.deleteMaterial(oData).then(function () {
					MessageToast.show("deleted");
					this.byId("idCarousel").setActivePage(this.byId("idCarousel").getPages()[sNewIndex]);
					sap.ui.core.BusyIndicator.hide();
					/*var user = this.fetchUser(app1, credentials).then(function () {
						var x = app1.functions.getMaterialsWithInquiries().then(function (oResponse) {
							this.getView().getModel("materials").setData(oResponse);
							this.getView().getModel("materials").updateBindings();
							this.getView().getModel("config").setProperty("/materialcount", oResponse.length);
							sap.ui.core.BusyIndicator.hide();
						}.bind(this));
					}.bind(this));*/
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
		
		goBack: function () {
			this.getOwnerComponent().getRouter().navTo("RouteMain");
		},
		
		capturePic: function () {
			var that = this;
			this.cameraDialog = new Dialog({
				title: "Click on Capture to take a photo",
				beginButton: new sap.m.Button({
					text: "Capture",
					press: function (oEvent) {
						that.imageValue = document.getElementById("player");
						var oButton = oEvent.getSource();
						that.imageText = oButton.getParent().getContent()[1].getValue();
						that.cameraDialog.close();
					}
				}),
				content: [
					new sap.ui.core.HTML({
						content: "<video id='player' autoplay></video>"
					}),
					new sap.m.Input({
						placeholder: "Please input image text here",
						required: true
					})
				],
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function () {
						that.cameraDialog.close();
					}
				})

			});
			this.getView().addDependent(this.cameraDialog);
			this.cameraDialog.open();
			this.cameraDialog.attachBeforeClose(this.setImage, this);
			if (navigator.mediaDevices) {
				navigator.mediaDevices.getUserMedia({
					video: true,
					//facingMode: "environment" 
				}).then(function (stream) {
					player.srcObject = stream;
				});
			}
		},

		setImage: function () {
			var oVBox = this.getView().byId("vBox1");
			var oItems = oVBox.getItems();
			var imageId = 'archie-' + oItems.length;
			var fileName = this.imageText;
			var imageValue = this.imageValue;
			if (imageValue == null) {
				MessageToast.show("No image captured");
			} else {

				var oCanvas = new sap.ui.core.HTML({
					content: "<canvas id='" + imageId + "' width='320px' height='320px' " +
						" style='2px solid red'></canvas> "
				});
				var snapShotCanvas;

				oVBox.addItem(oCanvas);
				oCanvas.addEventDelegate({
					onAfterRendering: function () {
						snapShotCanvas = document.getElementById(imageId);
						var oContext = snapShotCanvas.getContext('2d');
						oContext.drawImage(imageValue, 0, 0, snapShotCanvas.width, snapShotCanvas.height);
						var imageData = snapShotCanvas.toDataURL('image/png');
						var imageBase64 = imageData.substring(imageData.indexOf(",") + 1);
						//	window.open(imageData);  --Use this if you dont want to use third party download.js file 
						download(imageData, fileName + ".png", "image/png");

					}
				});

			}
		}

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