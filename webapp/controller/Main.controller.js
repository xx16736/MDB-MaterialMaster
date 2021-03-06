sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	'sap/ui/Device',
	'sap/ui/model/Sorter',
], function (Controller, JSONModel, Fragment, MessageToast, Device, Sorter) {
	"use strict";

	return Controller.extend("com.newell.fiori.HelloWorld.controller.Main", {
		onInit: function () {
			// Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			this._mViewSettingsDialogs = {};

			this.mGroupFunctions = {
				Available: function (oContext) {
					var name = oContext.getProperty("Available");
					return {
						key: name,
						text: name
					};
				},
				MatType: function (oContext) {
					var name = oContext.getProperty("MatType");
					return {
						key: name,
						text: name
					};
				}
			};

			// set background image
			var oApp = this.byId("app");
			oApp.setBackgroundImage("img/NW_WHITE_BG.png");

			var oModel = new JSONModel();
			this.getOwnerComponent().setModel(oModel, "materials");

			var oModelMatType = new JSONModel();
			this.getOwnerComponent().setModel(oModelMatType, "materialtype");

			var oModel = new JSONModel();
			var oConfigAskQuesData = {
				"MatId": "",
				"QuesText": ""
			};
			this.getOwnerComponent().setModel(oModel, "askQues");
			this.getOwnerComponent().getModel("askQues").setData(oConfigAskQuesData);

			var oModelAddMaterial = new JSONModel();
			this.getOwnerComponent().setModel(oModelAddMaterial, "add");

			var oModelconfig = new JSONModel();
			this.getOwnerComponent().setModel(oModelconfig, "config");
			var oConfigData = {
				"materialcount": 0,
				"selectedMatPath": "",
				"PortalURL": "https://ecc.newellrubbermaid.com/irj/go/km/docs/nr_content/Corp/CustomerPortal/images/_",
				"ImgExtension": ".jpg",
				"ImageURL": ""
			};
			this.getOwnerComponent().getModel("config").setData(oConfigData);
			//------
			var appId = "app-001-nntbv"; // Set Realm app ID here.
			var appConfig = {
				id: appId,
				timeout: 1000,
			};

			//sap.ui.core.BusyIndicator.show();
			var app1 = new Realm.App(appConfig);
			var credentials = Realm.Credentials.anonymous(); // create an anonymous credential
			var user = this.fetchUser(app1, credentials).then(function () {
				// fetch materials
				app1.functions.getMaterialTypes().then(function (oResponse) {
					this.getView().getModel("materialtype").setData(oResponse);
					window.console.log("materialtype");
					window.console.log(oResponse);
					var x = app1.functions.getMaterialsWithInquiries().then(function (oResponse, x1, y1) {
						this.formatMaterialList(oResponse);

						sap.ui.core.BusyIndicator.hide();
					}.bind(this));
				}.bind(this));

			}.bind(this));

			/*async function run() {
				var app = new Realm.App(appConfig);
				var credentials = Realm.Credentials.anonymous(); // create an anonymous credential
				//var user = await app.logIn(credentials);
				var user = this.fetchUser(app, credentials).then(function () {
					var mongo = app.services.mongodb("mongodb-atlas"); // mongodb-atlas is the name of the cluster service
					var coll = mongo.db("app01").collection("material");
					var items = await coll.find({}); // find a document where `name` == "test"
				});
			}

			run();*/
		},

		formatMaterialList: function (oResponse) {
			this.getView().getModel("materials").setData(oResponse);
			window.console.log(oResponse);

			$.each(oResponse, function (key, oMaterial) {
				oMaterial.questions = [];
				$.each(oMaterial.inquiries, function (key, oInquiry) {
					if (oInquiry.type === "Q") {
						oMaterial.questions.push(oInquiry);
					}
				}.bind(this));
				if (oMaterial.questions[0]) {
					oMaterial.questions[0].answers = [];
					$.each(oMaterial.inquiries, function (key, oInquiry) {
						if (oInquiry.type === "A") {
							oMaterial.questions[0].answers.push(oInquiry);
						}
					}.bind(this));
				}

			}.bind(this));
			window.console.log(oResponse);

			this.getView().getModel("materials").updateBindings();
			this.getView().getModel("config").setProperty("/materialcount", oResponse.length);
		},

		onAddMaterial: function () {
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "com.newell.fiori.HelloWorld.view.fragments.AddMaterial",
				controller: this
			}).then(function (dialog) {
				this._oAddMaterialDialog = dialog;
				oView.addDependent(this._oAddMaterialDialog);
				this._oAddMaterialDialog.open();
			}.bind(this));
		},

		onAddMaterialDialog: function () {
			var appId = "app-001-nntbv"; // Set Realm app ID here.
			var oData = this.getView().getModel("add").getData();
			var appConfig = {
				id: appId,
				timeout: 1000,
			};
			var app1 = new Realm.App(appConfig);
			var credentials = Realm.Credentials.anonymous(); // create an anonymous credential
			sap.ui.core.BusyIndicator.show();
			var user = this.fetchUser(app1, credentials).then(function () {
				var x = app1.functions.postMaterial(oData).then(function () {
					MessageToast.show("created");
					this.onCloseAddMaterialDialog();
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

		onCloseAddMaterialDialog: function () {
			this._oAddMaterialDialog.close();
			this._oAddMaterialDialog.destroy();
			this.getView().getModel("add").setData({});
		},

		onUpdateMaterial: function (oEvent) {
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "com.newell.fiori.HelloWorld.view.fragments.UpdateMaterial",
				controller: this
			}).then(function (dialog) {
				this._oUpdateMaterialDialog = dialog;
				oView.addDependent(this._oUpdateMaterialDialog);
				this._oUpdateMaterialDialog.open();
				var oTable = this.getView().byId("idMaterialTable");
				var oSelectedItem = oTable.getSelectedItem();
				var oData = oSelectedItem.getBindingContext("materials").getObject();
				this.getView().getModel("add").setData(oData);
				this.getView().getModel("add").updateBindings();
			}.bind(this));
		},

		onUpdateMaterialDialog: function () {
			var appId = "app-001-nntbv"; // Set Realm app ID here.
			var oData = this.getView().getModel("add").getData();
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
					this.onCloseUpdateMaterialDialog();
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

		onCloseUpdateMaterialDialog: function () {
			this._oUpdateMaterialDialog.close();
			this._oUpdateMaterialDialog.destroy();
			this.getView().getModel("add").setData({});
		},

		fetchUser: function (app, credentials) {
			return new Promise(function (fnResolve, fnReject) {
				var user = app.logIn(credentials).then(function () {
					fnResolve(user);
				});
			}.bind(this));
		},

		onDeleteMaterial: function () {
			var oTable = this.getView().byId("idMaterialTable");
			var oSelectedItem = oTable.getSelectedItem();
			var oData = oSelectedItem.getBindingContext("materials").getObject();

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

		onSelectMaterial: function (oEvent) {
			var oSelectedItem = oEvent.getSource();
			var oContext = oSelectedItem.getBindingContext("materials");
			var sPath = oContext.getPath();

			this.getOwnerComponent().getModel("config").setProperty("/selectedMatPath", sPath);
			this.getOwnerComponent().getRouter().navTo("RouteMatDetails");

			/*var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "com.newell.fiori.HelloWorld.view.fragments.MaterialDetails",
				controller: this
			}).then(function (dialog) {
				this._oMaterialDetailsDialog = dialog;
				oView.addDependent(this._oMaterialDetailsDialog);
				this._oMaterialDetailsDialog.open();

				var oMaterialDetailsTable = this.byId("idMaterialDetailsTable");
				oMaterialDetailsTable.bindElement({
					path: sPath,
					model: "materials"
				});
			}.bind(this));*/

		},

		onCloseMaterialDetailsDialog: function () {
			this._oMaterialDetailsDialog.close();
			this._oMaterialDetailsDialog.destroy();
		},

		handleGroupButtonPressed: function () {
			this.createViewSettingsDialog("com.newell.fiori.HelloWorld.view.fragments.GroupDialog").open();
		},

		handleGroupDialogConfirm: function (oEvent) {
			var oTable = this.byId("idMaterialTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];

			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			}
		},

		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},

		rawCode: function () {
			const appId = "imageupload-bhrep"; // Set Realm app ID here.
			const appConfig = {
				id: appId,
				timeout: 1000,
			};
			async function run() {
				let user;
				try {
					const app = new Realm.App(appConfig);
					const credentials = Realm.Credentials.anonymous(); // create an anonymous credential
					user = await app.logIn(credentials);
					const mongo = app.services.mongodb("mongodb-atlas"); // mongodb-atlas is the name of the cluster service
					const coll = mongo.db("appdemo-02").collection("images");
					var e = document.getElementById("img_cat");
					var selected_category = e.options[e.selectedIndex].value;
					items = await coll.find({
						category: selected_category
					}); // find a document where `name` == "test"
					var counter = 0;
					var flag = 0;
				} finally {
					if (user) {
						user.logOut();
					}
				}
			}
		}
	});
});