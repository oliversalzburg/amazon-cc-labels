// ==ClosureCompiler==
// @output_file_name amazon-cc-labels.min.user.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

// ==UserScript==
// @name         Amazon CC Labels
// @namespace    http://github.com/oliversalzburg
// @version      0.1
// @description  Allows you to name your Amazon CCs
// @author       Oliver Salzburg <oliver.salzburg@gmail.com>
// @match         *://*.amazon.com/*
// @match         *://*.amazon.com.au/*
// @match         *://*.amazon.co.uk/*
// @match         *://*.amazon.de/*
// @grant        none
// ==/UserScript==

(function() {
	/**
	 * Convenience wrapper around localStorage.
	 * @param {string} prefix The prefix to apply to stored items.
	 * @constructor
	 */
	function LocalStorage( prefix ) {
		this.storagePrefix = prefix + "-";
	}

	LocalStorage.prototype.getItem = function LocalStorage$getItem( key ) {
		return localStorage.getItem( this.storagePrefix + key );
	};

	LocalStorage.prototype.setItem = function LocalStorage$setItem( key, value ) {
		localStorage.setItem( this.storagePrefix + key, value );
	};

	/**
	 * The main application.
	 * @constructor
	 */
	function AmazonCcLabels() {
		this.storage = new LocalStorage( "amazon-cc-labels" );
	}

	AmazonCcLabels.prototype.initialize = function AmazonCcLabels$initialize() {
		this.__installDomElements();
	};

	AmazonCcLabels.prototype.__installDomElements = function AmazonCcLabels$__installDomElements() {
		var paymentRows = document.querySelectorAll( ".payment-row" );
		[].forEach.call( paymentRows, this.__addLabelElements.bind( this ) );
		[].forEach.call( paymentRows, this.__addRenameLink.bind( this ) );
		this.__updateLabels();
	};

	AmazonCcLabels.prototype.__addLabelElements = function AmazonCcLabels$__addLabelElements( paymentRow ) {
		var cardInfoElement = paymentRow.querySelector( ".card-info" );

		// Insert our label after the first element in the card info box.
		if( !cardInfoElement.children || !cardInfoElement.children.length ) {
			return;
		}

		var paymentId = paymentRow.getAttribute( "paymentmethodid" );

		var labelElement = document.createElement( "span" );
		labelElement.classList.add( "amazon-cc-label" );
		labelElement.setAttribute( "paymentmethodid", paymentId );
		labelElement.textContent = "";

		var paddingElement = document.createTextNode( "\u00A0" );

		if( cardInfoElement.children.length <= 1 ) {
			cardInfoElement.appendChild( labelElement );
			cardInfoElement.appendChild( paddingElement );

		} else {
			cardInfoElement.insertBefore( labelElement, cardInfoElement.children[ 1 ] );
			cardInfoElement.insertBefore( paddingElement, cardInfoElement.children[ 2 ] );
		}
	};

	AmazonCcLabels.prototype.__updateLabels = function AmazonCcLabels$__updateLabels() {
		var labelElements = document.querySelectorAll( ".amazon-cc-label" );
		[].forEach.call( labelElements, this.__updateLabel.bind( this ) );
	};

	AmazonCcLabels.prototype.__updateLabel = function AmazonCcLabels$__updateLabel( labelElement ) {
		var paymentId = labelElement.getAttribute( "paymentmethodid" );
		var cardLabel = this.storage.getItem( paymentId );

		if( !cardLabel || "" === cardLabel ) {
			cardLabel = "unlabeled card";
			labelElement.style.display = "none";

		} else {
			labelElement.style.display = "inline";
		}

		labelElement.textContent = cardLabel;
	};

	AmazonCcLabels.prototype.__addRenameLink = function AmazonCcLabels$__addRenameLink( paymentRow ) {
		var _amazonCcLabels = this;

		var paymentId = paymentRow.getAttribute( "paymentmethodid" );
		var insertTarget = paymentRow.querySelector( ".bottom-cell .a-row" ).children[ 0 ];

		// Construct rename link.
		var renameLink = document.createElement( "a" );
		renameLink.href = "#";
		renameLink.textContent = "Rename this card";
		renameLink.addEventListener( "click", function onClickHandler() {
			_amazonCcLabels.__handleRenameRequest.bind( _amazonCcLabels )( this, paymentId );
			_amazonCcLabels.__updateLabels();
		} );

		// Place link into DOM.
		var renameLinkContainer = document.createElement( "div" );
		renameLinkContainer.appendChild( document.createTextNode( "(" ) );
		renameLinkContainer.appendChild( renameLink );
		renameLinkContainer.appendChild( document.createTextNode( ")" ) );

		insertTarget.appendChild( renameLinkContainer );
	};

	AmazonCcLabels.prototype.__handleRenameRequest = function AmazonCcLabels$__handleRenameRequest( renameLink, paymentId ) {
		// Determine the current label.
		var currentLabel = this.storage.getItem( paymentId );
		if( !currentLabel || "" === currentLabel ) {
			currentLabel = "no label yet";
		}

		var newLabel = window.prompt( "Please enter a new label for the card.", currentLabel );

		// Persist label.
		if( newLabel && newLabel != currentLabel ) {
			this.storage.setItem( paymentId, newLabel );
		}
	};

	function bootstrap() {
		if( !document.getElementById( "existing-payment-methods" ) ) {
			return;
		}

		var amazonCcLabels = new AmazonCcLabels();
		amazonCcLabels.initialize();
	}

	document.addEventListener( "DOMContentLoaded", bootstrap );

}());
