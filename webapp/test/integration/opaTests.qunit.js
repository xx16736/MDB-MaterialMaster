/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/newell/fiori/HelloWorld/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});