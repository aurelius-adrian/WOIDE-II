# WOIDE II

## A Word OMDoc IDE 

This plugin provides the necessary functionality to create semantic annotations within Microsoft Office Word documents.
WOIDE is a proof of concept and was developed to be a Microsoft Office Word variant of sTeX, which is currently only
available for LATEX.

With WOIDE annotations can be created, deleted and exported to SHTML (semantic HTML), furthermore annotation tags can be
toggled between three different display types.

## Installation

After cloning this repository run:
``npm install``

To run the development web server run:
``npm run dev``

To open MS Office Word in the browser run:
``npm run start:web``

Make sure that the `--document "<url>"` flag is set where `<url>` should be replaced by an url to a MS Office Word Web
document.

It is necessary for the development server to use `https` therefore the ``npm run dev`` command specifies the
`--experimental-https` flag, seeing that the self-signed certificate that will be created by NextJS will not be trusted
by your browser. You should make sure that the website can be reached without being blocked by the browser, otherwise
loading the Add-In will not work. In Chromium based browsers this can be done by setting
`chrome://flags/#allow-insecure-localhost` to enabled. Chrome removed this feature in newer versions you can enable
this flag by setting `chrome://flags/#temporary-unexpire-flags-m129` and `chrome://flags/#temporary-unexpire-flags-m130`
to enabled.

This can be tested by accessing `https://localhost:<port>/manifest.xml` and `https://localhost:<port>/taskpane` without
being blocked or asked for user interaction by the browser.

After following the steps above successfully the plugin can be opened and used by clicking "Show Taskpane" in the ribbon menu.

## Usage

WIP