var ExternalModules = {
	sortModuleTable: function(table){
		table.find('tr').sort(function(a, b){
			a = $(a).find('.external-modules-title').text()
			b = $(b).find('.external-modules-title').text()

			return a.localeCompare(b)
		}).appendTo(table)
	}
};

ExternalModules.Settings = function(){}

ExternalModules.Settings.prototype.addEscapedAttribute = function(elementHtml, name, value){
	var element = $(elementHtml)
	element.attr(name, value)

	return element[0].outerHTML
}

// Function to get the HTML for all the setting rows
ExternalModules.Settings.prototype.getSettingRows = function(configSettings, savedSettings,instance){
	var rowsHtml = '';
	var settingsObject = this;
	configSettings.forEach(function(setting){
		var setting = $.extend({}, setting);

		rowsHtml += settingsObject.getSettingColumns(setting,savedSettings,instance);
	});

	return rowsHtml;
};

ExternalModules.Settings.prototype.getSettingColumns = function(setting,savedSettings,previousInstance) {
	var settingsObject = this;
	var rowsHtml = '';

	if(typeof previousInstance === 'undefined') {
		previousInstance = [];
	}

	var thisSavedSettings = savedSettings[setting.key];

	if(typeof thisSavedSettings === "undefined") {
		thisSavedSettings = [{}];
	}
	else {
		thisSavedSettings = thisSavedSettings.value;
		for(var i = 0; i < previousInstance.length; i++) {
			// If this setting is currently a string because of prior saves, but now it's in a repeating sub-setting
			// make it an array
			if(typeof(thisSavedSettings) == "string" && previousInstance[i] === 0) {
				thisSavedSettings = [thisSavedSettings];
			}

			if(thisSavedSettings.hasOwnProperty(previousInstance[i]) && thisSavedSettings[previousInstance[i]] !== null) {
				thisSavedSettings = thisSavedSettings[previousInstance[i]];
			}
			else {
				thisSavedSettings = [{}];
			}

		}
	}


	if(typeof thisSavedSettings === 'undefined') {
		thisSavedSettings = [{}];
	}

	if(!Array.isArray(thisSavedSettings)) {
		thisSavedSettings = [thisSavedSettings];
	}

	thisSavedSettings.forEach(function(settingValue,instance) {
		var subInstance  = previousInstance.slice();
		subInstance.push(instance);

		if(setting.type == "sub_settings") {
			rowsHtml += settingsObject.getColumnHtml(setting);
			setting.sub_settings.forEach(function(settingDetails){
				rowsHtml += settingsObject.getSettingRows([settingDetails],savedSettings,subInstance);
			});
			rowsHtml += "<tr style='display:none' class='sub_end' field='" + setting.key + "'></tr>";
		}
		else {
			if(['string', 'boolean'].indexOf(typeof settingValue) == -1) {
				settingValue = "";
			}

			rowsHtml += settingsObject.getColumnHtml(setting, settingValue);
		}
	});

	return rowsHtml;
};

// Function to use javascript to finish setting up configuration
// This is called twice from two different ajax calls when first loading a configuration, so we wait until
// both are done before actually configuring the settings
ExternalModules.Settings.prototype.configureSettings = function() {
	if($('#external-modules-configure-modal').find('tbody').html() == "" || (typeof ExternalModules.Settings.projectList === "undefined")) {
		return;
	}

	// Loop through every project_id_textbox to add the project label to the select
	$(".project_id_textbox").each(function() {
		var selectedOption = $(this).find("option:selected");
		if(selectedOption.val() in ExternalModules.Settings.projectList) {
			selectedOption.html(ExternalModules.Settings.projectList[selectedOption.val()]);
		}
	});

	var settings = this;

	// Reset the instances so that things will be saved correctly
	// This has to run before initializing rich text fields so that the names are correct
	settings.resetConfigInstances();

	// Set up other functions that need configuration
	settings.initializeRichTextFields();
}


ExternalModules.Settings.prototype.getColumnHtml = function(setting,value,className){
	var type = setting.type;
	var key = setting.key;

	if(setting['super-users-only'] && !ExternalModules.SUPER_USER){
		return '';
	}

	if(typeof className === "undefined") {
		className = "";
	}
	var trClass = className;
	
	var colspan = '';
	if(type == 'descriptive'){
		colspan = " colspan='3'";
	}

	var instanceLabel = "";
	if (typeof instance != "undefined") {
		instanceLabel = (instance+1)+". ";
	}
	var html = "<td></td>";
	if(type != 'sub_settings') {
		var reqLabel = '';
		if(setting.required) {
			reqLabel = '<div class="requiredlabel">* must provide value</div>';
		}
		html = "<td" + colspan + "><span class='external-modules-instance-label'>" + instanceLabel + "</span><label>" + setting.name + (type == 'descriptive' ? '' : ':') + "</label>" + reqLabel + "</td>";
	}

	if (typeof instance != "undefined") {
		// for looping for repeatable elements
		if (typeof header == "undefined" && typeof value != "undefined" && value !== null) {
			value = value[instance];
		}
		key = this.getInstanceName(key, instance);
	}

	var inputHtml;
	if(type == 'dropdown'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'field-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'form-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'event-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'arm-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'user-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'user-role-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'dag-list'){
		inputHtml = this.getSelectElement(key, setting.choices, value, []);
	}
	else if(type == 'project-id'){
		// Set up an option to store the saved value (setting.choice will be blank otherwise)
		if(value != "") {
			setting.choices = [{"value" : value, "name" : value}];
		}
		inputHtml = "<div style='width:200px'>" + this.getSelectElement(key, setting.choices, value, {"class":"project_id_textbox"}) + "</div>";
	}
	else if(type == 'textarea'){
		inputHtml = this.getTextareaElement(key, value, {"rows" : "6"});
	}
	else if(type == 'rich-text') {
		inputHtml = this.getRichTextElement(key, value);
	}
	else if(type == 'sub_settings'){
		inputHtml = "<span class='external-modules-instance-label'>"+instanceLabel+"</span><label name='"+key+"'>" + setting.name + ":</label><input type='hidden' value='true' name='key' />";
		trClass += ' sub_start';
	}
	else if(type == 'radio'){
		inputHtml = "";
		for(var i in setting.choices ){
			var choice = setting.choices[i];

			var inputAttributes = [];
			if(choice.value == value) {
				inputAttributes["checked"] = "true";
			}

			inputHtml += this.getInputElement(type, key, choice.value, inputAttributes) + '<label>' + choice.name + '</label><br>';
		}
	}
	else if(type == 'custom') {
		var functionName = setting.functionName;

		inputHtml = this.getInputElement(type, key, value, inputAttributes);
		inputHtml += "<script type='text/javascript'>" + functionName + "($('input[name=\"" + key + "\"]'));</script>";
	} else {
		var inputAttributes = [];
		if(type == 'checkbox' && value == 1){
			inputAttributes['checked'] = 'checked';
		} else if (type == 'text' && typeof setting.validation != "undefined") {
			var validation = setting.validation;
			var validation_min = (typeof setting.validation_min == "undefined") ? "" : setting.validation_min;
			var validation_max = (typeof setting.validation_max == "undefined") ? "" : setting.validation_max;
			inputAttributes['onblur'] = "redcap_validate(this,'"+validation_min+"','"+validation_max+"','soft_typed','"+validation+"',1);";
		}

		inputHtml = this.getInputElement(type, key, value, inputAttributes);
	}
	
	if(type != 'descriptive'){
		html += "<td class='external-modules-input-td'>" + inputHtml + "</td>";
	}
	
	if(setting.required) {
		trClass += ' requiredm';
	}
	
	if(setting.repeatable) {
		// Add repeatable buttons
		html += "<td class='external-modules-add-remove-column'>";
		html += "<button class='external-modules-add-instance' setting='" + setting.key + "'>+</button>";
		html += "<button class='external-modules-remove-instance' >-</button>";
		//html += "<span class='external-modules-original-instance'>original</span>";
		html += "</td>";

		trClass += ' repeatable';
	}
	else {
		html += "<td></td>";
	}

	var outputHtml = "<tr" + (trClass === "" ? "" : " class='" + trClass + "'") + " field='" + setting.key + "'>" + html + "</tr>";

	return outputHtml;
};

ExternalModules.Settings.prototype.getSelectElement = function(name, choices, selectedValue, selectAttributes){
	if(!selectAttributes){
		selectAttributes = [];
	}

	var optionsHtml = '';
	var choiceHasBlankValue = false;
	for(var i in choices ){
		var choice = choices[i];
		var value = choice.value;		
		if (value == '') choiceHasBlankValue = true;

		var optionAttributes = ''
		if(value == selectedValue){
			optionAttributes += 'selected'
		}

		var option = '<option ' + optionAttributes + '>' + choice.name + '</option>'
		option = this.addEscapedAttribute(option, 'value', value)

		optionsHtml += option
	}
	
	if (!choiceHasBlankValue) {
		optionsHtml = '<option value=""></option>' + optionsHtml;
	}

	var defaultAttributes = {"class" : "external-modules-input-element"};
	var attributeString = this.getElementAttributes(defaultAttributes,selectAttributes);

	return '<select ' + attributeString + ' name="' + name + '" >' + optionsHtml + '</select>';
}

ExternalModules.Settings.prototype.getInputElement = function(type, name, value, inputAttributes){
	if (typeof value == "undefined") {
		value = "";
	}

	if (type == "file") {
		if (ExternalModules.PID) {
			return this.getProjectFileFieldElement(name, value, inputAttributes);
		} else {
			return this.getSystemFileFieldElement(name, value, inputAttributes);
		}
	} else {
		var input = '<input type="' + type + '" name="' + name + '" ' + this.getElementAttributes({"class":"external-modules-input-element"},inputAttributes) + '>';
		input = this.addEscapedAttribute(input, 'value', value)
		return input
	}
}

// abstracted because file fields need to be reset in multiple places
ExternalModules.Settings.prototype.getSystemFileFieldElement = function(name, value, inputAttributes) {
	return this.getFileFieldElement(name, value, inputAttributes, "");
}

// abstracted because file fields need to be reset in multiple places
ExternalModules.Settings.prototype.getProjectFileFieldElement = function(name, value, inputAttributes) {
	return this.getFileFieldElement(name, value, inputAttributes, "pid=" + ExternalModules.PID);
}

// abstracted because file fields need to be reset in multiple places
ExternalModules.Settings.prototype.getFileFieldElement = function(name, value, inputAttributes, pid) {
	var attributeString = this.getElementAttributes([],inputAttributes);
	var type = "file";
	if ((typeof value != "undefined") && (value !== "")) {
		var input = $('<input type="hidden" name="' + name + '">');
		var html = this.addEscapedAttribute(input, 'value', value);
		html += '<span class="external-modules-edoc-file"></span>';
		html += '<button class="external-modules-delete-file" '+attributeString+'>Delete File</button>';
		$.post('ajax/get-edoc-name.php?' + pid, { edoc : value }, function(data) {
			//Name starts with
			$("[name^='"+name+"'][value='"+value+"']").closest("tr").find(".external-modules-edoc-file").html("<b>" + data.doc_name + "</b><br>");
		});
		return html;
	} else {
		attributeString = this.getElementAttributes({"class":"external-modules-input-element"},inputAttributes);
		return '<input type="' + type + '" name="' + name + '" ' + attributeString + '>';
	}
}

ExternalModules.Settings.prototype.getTextareaElement = function(name, value, inputAttributes){
	if (typeof value == "undefined") {
		value = "";
	}

	var textarea = $('<textarea contenteditable="true" name="' + name + '" ' + this.getElementAttributes([],inputAttributes) + '></textarea>');
	textarea.html(value)
	return textarea[0].outerHTML
}

ExternalModules.Settings.prototype.getRichTextElement = function(name, value) {
	if (!value) {
		value = '';
	}

	return '<textarea class="external-modules-rich-text-field" name="' + name + '">' + value + '</textarea>';
};

ExternalModules.Settings.prototype.getElementAttributes = function(defaultAttributes, additionalAttributes) {
	var attributeString = "";

	for (var tag in additionalAttributes) {
		if(defaultAttributes[tag]) {
			attributeString += tag + '="' + defaultAttributes[tag] + ' ' + additionalAttributes[tag] + '" ';
			delete defaultAttributes[tag];
		}
		else {
			attributeString += tag + '="' + additionalAttributes[tag] + '" ';
		}
	}

	for (var tag in defaultAttributes) {
		attributeString += tag + '="' + defaultAttributes[tag] + '" ';
	}

	return attributeString;
}

ExternalModules.Settings.prototype.getInstanceSymbol = function(){
	return "____";
}

ExternalModules.Settings.prototype.findSettings = function(config,name) {
	var configSettings = [config['project-settings'],config['system-settings']];
	var activeSetting = false;

	configSettings.forEach(function(configType) {
		var matchedSetting = ExternalModules.Settings.prototype.parseSettings(configType, name);

		if(matchedSetting !== false) {
			activeSetting = matchedSetting;
		}
	});

	return activeSetting;
};

ExternalModules.Settings.prototype.parseSettings = function(configType, name) {
	var activeSetting = false;
	configType.forEach(function(setting) {
		if(setting.key == name) {
			activeSetting = setting;
		}
		else if(setting.type == 'sub_settings') {
			var matchedSetting = ExternalModules.Settings.prototype.parseSettings(setting.sub_settings,name);

			if(matchedSetting !== false) {
				activeSetting = matchedSetting;
			}
		}
	});

	return activeSetting;
};

ExternalModules.Settings.prototype.getEndOfSub = function(startTr) {
	var currentTr = startTr;
	var reachedEnd = false;
	var currentDepth = 1;

	// Loop through subsequent <tr> elements until finding its end element
	while(!reachedEnd) {
		currentTr = currentTr.next();

		// If reaching end of a sub-setting, decrement depth and check if reached
		// the end of the original element
		if(currentTr.hasClass("sub_end")) {
			currentDepth--;
			reachedEnd = currentDepth < 1;
		}

		// If nested sub-setting, increment the depth counter
		if(currentTr.hasClass("sub_start")) {
			currentDepth++;
		}
	}

	return currentTr;
};

ExternalModules.Settings.prototype.resetConfigInstances = function() {
	var currentInstance = [];
	var currentFields = [];
	var lastWasEndNode = false;

	// Sync textarea and rich text divs before renaming
	tinyMCE.triggerSave();


	// Loop through each config row to find it's place in the loop
	$("#external-modules-configure-modal tr").each(function() {
		var lastField = currentFields.slice(-1);
		lastField = (lastField.length > 0 ? lastField[0] : false);

		// End current count if next node is different field
		if(lastWasEndNode) {
			if($(this).attr("field") != lastField) {
				// If there's only one instance of the previous field, hide "-" button
				if(currentInstance[currentInstance.length - 1] == 0) {
					var previousLoopField = currentFields[currentFields.length - 1];
					var currentTr = $(this).prev();

					// If merely a single repeating field
					if(!currentTr.hasClass("sub_end")) {
						currentTr.find(".external-modules-remove-instance").hide();
					}
					else {
						// Loop backwards until finding a start element matching the previousLoopField
						while((typeof currentTr !== "undefined") && !(currentTr.hasClass("sub_start") && (currentTr.attr("field") == previousLoopField))) {
							currentTr = currentTr.prev();
						}
						currentTr.find(".external-modules-remove-instance").hide();
					}
				}
				currentInstance.pop();
				currentFields.pop();
			}
		}

		// Increment or start count on current loop
		if($(this).hasClass("sub_start") || $(this).hasClass("repeatable")) {
			if(lastField == $(this).attr("field")) {
				currentInstance[currentInstance.length - 1]++;
			}
			else {
				currentInstance.push(0);
				currentFields.push($(this).attr("field"));
			}
		}

		lastWasEndNode = ($(this).hasClass("repeatable") && !$(this).hasClass("sub_start")) || $(this).hasClass("sub_end");

		// Update the number scheme on label and input names
		var currentLabel = "";
		var currentName = "";
		// Use PHP/JSON instance keys, so need to add one to make it look normal
		for(var i = 0; i < currentInstance.length; i++) {
			currentLabel += (currentInstance[i] + 1) + ".";
			currentName += ExternalModules.Settings.prototype.getInstanceSymbol() + currentInstance[i];
		}

		$(this).find(".external-modules-instance-label").html(currentLabel + " ");
		$(this).find("input, select, textarea").attr("name",$(this).attr("field") + currentName);
	});
};

ExternalModules.Settings.prototype.initializeRichTextFields = function(){

	$(".project_id_textbox").select2({
		width: '100%',
		ajax: {
			url: 'ajax/get-project-list.php',
			dataType: 'json',
			delay: 250,
			data: function(params) { return {'parameters':params.term }; },
			method: 'GET',
			cache: true
		}
	});

	$('.external-modules-rich-text-field').each(function(index, textarea){
		textarea = $(textarea)
		var expectedId = 'external-modules-rich-text-field_' + textarea.attr('name')
		if(expectedId != textarea.attr('id')){
			// This textarea must have just been added by clicking the repeatable plus button.
			// We need to fix it's id.
			textarea.attr('id', expectedId)

			// Remove the cloned TinyMCE elements (always the previous sibling), so they can be reinitialized.
			textarea.prev().remove()

			// Show the textarea (so TinyMCE will reinitialize it).
			textarea.show()
		}
	})

	tinymce.init({
		mode: 'specific_textareas',
		editor_selector: 'external-modules-rich-text-field',
		height: 200,
		menubar: false,
		branding: false,
		elementpath: false, // Hide this, since it oddly renders below the textarea.
		plugins: ['autolink lists link image charmap hr anchor pagebreak searchreplace code fullscreen insertdatetime media nonbreaking table contextmenu directionality textcolor colorpicker imagetools'],
		toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify',
		toolbar2: 'outdent indent | bullist numlist | table | forecolor backcolor | searchreplace fullscreen code',
		relative_urls : true, // force image urls to be absolute
		document_base_url : "http://www.example.com/path1/",
		file_picker_callback: function(callback, value, meta){
			var prefix = $('#external-modules-configure-modal').data('module')
			tinymce.activeEditor.windowManager.open({
				url: ExternalModules.BASE_URL + '/manager/rich-text/get-uploaded-file-list.php?prefix=' + prefix + '&pid=' + pid,
				width: 500,
				height: 300,
				title: 'Files',
				onOpen: function(data){
					// Show a loading indicator.

					var window = data.target.$el
					var iframe = window.find('.mce-window-body iframe')

					var loading = $('<div></div>')
					iframe.on('load', function(){
						loading.hide()
					})

					iframe.before(loading)
					new Spinner().spin(loading[0]);
				}
			});

			ExternalModules.currentFilePickerCallback = function(url){
				tinymce.activeEditor.windowManager.close()
				callback(url)
			}
		}
	});
}

$(function(){
	var settings = new ExternalModules.Settings();

	var onValueChange = function() {
		var val;
		if (this.type == "checkbox") {
			val = $(this).is(":checked");
		} else {
			val = $(this).val();
		}
	};

	$('#external-modules-configure-modal').on('change', '.external-modules-input-element', onValueChange);
	$('#external-modules-configure-modal').on('check', '.external-modules-input-element', onValueChange);

	/**
	 * Function to add new elements
	 */
	$('#external-modules-configure-modal').on('click', '.external-modules-add-instance-subsettings, .external-modules-add-instance', function(){
		// Get the full configuration for the active module from the global variable
		var config = ExternalModules.configsByPrefix[configureModal.data('module')];

		// Find the setting currently being added to and its configuration
		var name = $(this).attr('setting');
		var setting = ExternalModules.Settings.prototype.findSettings(config,name);
		//console.log(config);
		//console.log(name);
		//console.log(setting);
		if(typeof setting !== "undefined") {
			// Create new html for this setting
			var html = ExternalModules.Settings.prototype.getSettingRows([setting],[{}]);

			var thisTr = $(this).closest("tr");

			if(thisTr.hasClass("sub_start")) {
				thisTr = ExternalModules.Settings.prototype.getEndOfSub(thisTr);
			}
			thisTr.after(html);
		}

		// This has to run before initializing rich text fields so that the names are correct
		settings.resetConfigInstances();

		settings.initializeRichTextFields();
	});

	/**
	 * function to remove the elements
	 */
	$('#external-modules-configure-modal').on('click', '.external-modules-remove-instance-subsettings, .external-modules-remove-instance', function(){
		var startTr = $(this).closest('tr');

		// If this element is a sub_setting element, loop through until reaching the end
		// of this setting's rows
		if(startTr.hasClass("sub_start")) {
			var lastTr = ExternalModules.Settings.prototype.getEndOfSub(startTr);

			// Remove all the elements between start and end. Then remove last element.
			startTr.nextUntil(lastTr).remove();
			lastTr.remove();
		}

		// Clean up by removing the original element
		startTr.remove();

		tinymce.editors.forEach(function(editor, index){
			if(!document.contains(editor.getElement())){
				// The element for this editor was removed from the DOM.  Destroy the editor.
				editor.remove()
			}
		})

		settings.resetConfigInstances();
	});

	// Merged from updated enabled-modules, may need to reconfigure
	ExternalModules.configsByPrefix = ExternalModules.configsByPrefixJSON;
	ExternalModules.versionsByPrefix = ExternalModules.versionsByPrefixJSON;

	var pid = ExternalModules.PID;
	var pidString = pid;
	if(pid === null){
		pidString = '';
	}
	var configureModal = $('#external-modules-configure-modal');
	// may need to reconfigure
	var isSuperUser = (ExternalModules.SUPER_USER == 1);

	// Shared function for combining 2 arrays to produce an attribute string for an HTML object
	$('#external-modules-enabled').on('click', '.external-modules-configure-button', function(){
		// find the module directory prefix from the <tr>
		var moduleDirectoryPrefix = $(this).closest('tr').data('module');
		configureModal.data('module', moduleDirectoryPrefix);

		var config = ExternalModules.configsByPrefix[moduleDirectoryPrefix];
		configureModal.find('.module-name').html(config.name);
		var tbody = configureModal.find('tbody');

		var loading = $('<div style="margin-top: 400px">')
		new Spinner().spin(loading[0]);
		tbody.html(loading);

		// Param list to pass to get-settings.php
		var params = {moduleDirectoryPrefix: moduleDirectoryPrefix};
		if (pid) {
			params['pid'] = pidString;
		}

		var getProjectList = function(callback){
			// Just in case there are any project-id lists, we need to get a full project list
			if(typeof ExternalModules.Settings.projectList === "undefined") {
				$.ajax({
					url:'ajax/get-project-list.php',
					dataType: 'json'
				}).always(function(data) {
					if(data["results"]){
						ExternalModules.Settings.projectList = [];
						data["results"].forEach(function(projectDetails) {
							ExternalModules.Settings.projectList[projectDetails["id"]] = projectDetails["text"];
						});
					}
					else{
						alert('An error occurred while loading the project list!')
						ExternalModules.Settings.projectList = []
					}

					callback()
				});
			}
			else{
				callback()
			}
		}

		var getSettings = function(callback){
			// Get the existing values for this module through ajax
			$.post('ajax/get-settings.php', params, function(data){
				if(data.status != 'success'){
					return;
				}

				var savedSettings = data.settings;

				// Get the html for the configuration
				var settingsHtml = "";

				if(pid) {
					settingsHtml += settings.getSettingRows(config['project-settings'], savedSettings);
				}
				else {
					settingsHtml += settings.getSettingRows(config['system-settings'], savedSettings);
				}

				// Add blank tr to end of table to make resetConfigInstances work better
				settingsHtml += "<tr style='display:none'></tr>";

				tbody.html(settingsHtml);

				callback()
			});
		}

		configureModal.on('shown.bs.modal', function () {
			configureModal.off('shown.bs.modal')

			async.parallel([
				getProjectList,
				getSettings
			], function(){
				settings.configureSettings();
				configureModal.trigger('externalModules:configModalReady', [configureModal.data('module')]);
			})
		})

		configureModal.modal('show');
	});


	var deleteFile = function(ob) {
		var moduleDirectoryPrefix = configureModal.data('module');

		var row = ob.closest("tr");
		var input = row.find("input[type=hidden]");
		var disabled = input.prop("disabled");
		var deleteFileButton = row.find("button.external-modules-delete-file");
		if (deleteFileButton) {
			deleteFileButton.hide();
		}

		$.post("ajax/delete-file.php?pid="+pidString, { moduleDirectoryPrefix: moduleDirectoryPrefix, key: input.attr('name'), edoc: input.val() }, function(data) {
			if (data.status == "success") {
			    console.log(JSON.stringify(data))
				var inputAttributes = "";
				if (disabled) {
					inputAttributes = "disabled";
				}
				row.find(".external-modules-edoc-file").html(settings.getProjectFileFieldElement(input.attr('name'), "", inputAttributes));
				input.remove();
			} else {		// failure
				alert("The file was not able to be deleted. "+JSON.stringify(data));
			}
		});
	};
	configureModal.on('click', '.external-modules-delete-file', function() {
		deleteFile($(this));
	});

	var resetSaveButton = function() {
		if ($(this).val() != "") {
			$(".save").html("Save and Upload");
		}
		var allEmpty = true;
		$("input[type=file]").each(function() {
			if ($(this).val() !== "") {
				allEmpty = false;
			}
		});
		if (allEmpty) {
			$(".save").html("Save");
		}
	}

	configureModal.on('change', 'input[type=file]', resetSaveButton);

	// helper method for saving
	var saveFilesIfTheyExist = function(url, files, callbackWithNoArgs) {
		var lengthOfFiles = 0;
		var formData = new FormData();
		for (var name in files) {
			lengthOfFiles++;
			formData.append(name, files[name]);   // filename agnostic
		}
		if (lengthOfFiles > 0) {
			// AJAX rather than $.post
			$.ajax({
				url: url,
				data: formData,
				processData: false,
				contentType: false,
				async: false,
				type: 'POST',
				success: function(returnData) {
					// alert(JSON.stringify(returnData))
					if (returnData.status != 'success') {
						alert(returnData.status+" One or more of the files could not be saved."+JSON.stringify(returnData));
					}
					// proceed anyways to save data
					callbackWithNoArgs();
				},
				error: function(e) {
					alert("One or more of the files could not be saved."+JSON.stringify(e));
					callbackWithNoArgs();
				}
			});
		} else {
			callbackWithNoArgs();
		}
	}

	// helper method for saving
	var saveSettings = function(pidString, moduleDirectoryPrefix, version, data) {
	   $.post('ajax/save-settings.php?pid=' + pidString + '&moduleDirectoryPrefix=' + moduleDirectoryPrefix, JSON.stringify(data)).done( function(returnData){
			if(returnData.status != 'success'){
				alert("An error occurred while saving settings: \n\n" + returnData);
				configureModal.show();
				return;
			}

			// Reload the page reload after saving settings,
			// in case a settings affects some page behavior (like which menu items are visible).
			location.reload();
		});
	}

	configureModal.on('click', 'button.save', function(){
		var moduleDirectoryPrefix = configureModal.data('module');
		var version = ExternalModules.versionsByPrefix[moduleDirectoryPrefix];

		var data = {};
		var files = {};
		var requiredFieldErrors = 0;
		configureModal.find('tr.requiredm td.external-modules-input-td :input').each(function(index, element){
			if ($(this).val() == '' && $(this).attr('type') != 'checkbox' && !$(this).is('button')) {
				requiredFieldErrors++;
			}
		});
		if (requiredFieldErrors > 0 && !confirm("SOME SETTINGS REQUIRE A VALUE!\n\nIt appears that some settings are required but are missing a value. If you wish to go back and enter more values, click CANCEL. If you wish to save the current settings, click OKAY.")) {
			return;
		}
		
		configureModal.hide();
		
		configureModal.find('input, select, textarea').each(function(index, element){
			var element = $(element);
			var name = element.attr('name');
			var type = element[0].type;

			if(!name || (type == 'radio' && !element.is(':checked'))){
				return;
			}

			if (type == 'file') {
				// only store one file per variable - the first file
				jQuery.each(element[0].files, function(i, file) {
					if (typeof files[name] == "undefined") {
						files[name] = file;
					}
				});
			} else {
				var value;
				if(type == 'checkbox'){
					if(element.prop('checked')){
						value = true;
					}
					else{
						value = false;
					}
				}
				else if(element.hasClass('external-modules-rich-text-field')){
					var id = element.attr('id');
					value = tinymce.get(id).getContent();
				}
				else{
					value = element.val();
				}

				data[name] = value;
			}
		});

		var url = 'ajax/save-file.php?pid=' + pidString +
			'&moduleDirectoryPrefix=' + moduleDirectoryPrefix +
			'&moduleDirectoryVersion=' + version;
		saveFilesIfTheyExist(url, files, function() {
	         saveSettings(pidString, moduleDirectoryPrefix, version, data);
		});
	});

	configureModal.on('hidden.bs.modal', function () {
		tinymce.remove()
	})

	$('.external-modules-usage-button').click(function(){
		var row = $(this).closest('tr');
		var prefix = row.data('module')
		$.get('ajax/usage.php', {prefix: prefix}, function(data){
			if(data == ''){
				data = 'None'
			}

			var modal = $('#external-modules-usage-modal')
			modal.find('.modal-title').html('Project Usage:<br><b>' + row.find('.external-modules-title').text() + '</b>')
			modal.find('.modal-body').html(data)
			modal.modal('show')
		})
	})
});
