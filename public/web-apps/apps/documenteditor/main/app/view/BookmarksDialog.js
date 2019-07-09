/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/**
 *  BookmarksDialog.js.js
 *
 *  Created by Julia Radzhabova on 15.02.2018
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/ListView',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Button',
    'common/main/lib/component/RadioBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    DE.Views.BookmarksDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            height: 360
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 5px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-extra-small">',
                                        '<label class="input-label">', me.textBookmarkName, '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="bookmarks-txt-name" style="display:inline-block;vertical-align: top;margin-right: 10px;"></div>',
                                            '<button type="button" result="add" class="btn btn-text-default" id="bookmarks-btn-add" style="vertical-align: top;">', me.textAdd,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-extra-small">',
                                            '<label class="header" style="margin-right: 10px;">', me.textSort,'</label>',
                                            '<div id="bookmarks-radio-name" style="display: inline-block; margin-right: 10px;"></div>',
                                            '<div id="bookmarks-radio-location" style="display: inline-block;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<div id="bookmarks-list" style="width:100%; height: 130px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<button type="button" class="btn btn-text-default" id="bookmarks-btn-goto" style="margin-right: 10px;">', me.textGoto,'</button>',
                                            '<button type="button" class="btn btn-text-default" id="bookmarks-btn-delete" style="">', me.textDelete,'</button>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<div id="bookmarks-checkbox-hidden"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="footer right">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.textClose + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtName = new Common.UI.InputField({
                el          : $('#bookmarks-txt-name'),
                allowBlank  : true,
                validateOnChange: true,
                validateOnBlur: false,
                style       : 'width: 195px;',
                value       : '',
                maxLength: 40
            }).on('changing', _.bind(this.onNameChanging, this));

            this.radioName = new Common.UI.RadioBox({
                el: $('#bookmarks-radio-name'),
                labelText: this.textName,
                name: 'asc-radio-bookmark-sort',
                checked: true
            });
            this.radioName.on('change', _.bind(this.onRadioSort, this));

            this.radioLocation = new Common.UI.RadioBox({
                el: $('#bookmarks-radio-location'),
                labelText: this.textLocation,
                name: 'asc-radio-bookmark-sort'
            });
            this.radioLocation.on('change', _.bind(this.onRadioSort, this));

            this.bookmarksList = new Common.UI.ListView({
                el: $('#bookmarks-list', this.$window),
                store: new Common.UI.DataViewStore(),
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;"><%= value %></div>')
            });
            this.bookmarksList.store.comparator = function(rec) {
                return (me.radioName.getValue() ? rec.get("value") : rec.get("location"));
            };
            this.bookmarksList.on('item:dblclick', _.bind(this.onDblClickBookmark, this));
            this.bookmarksList.on('entervalue', _.bind(this.onPrimary, this));
            this.bookmarksList.on('item:select', _.bind(this.onSelectBookmark, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#bookmarks-btn-add'),
                disabled: true
            });
            this.$window.find('#bookmarks-btn-add').on('click', _.bind(this.onDlgBtnClick, this));

            this.btnGoto = new Common.UI.Button({
                el: $('#bookmarks-btn-goto'),
                disabled: true
            });
            this.btnGoto.on('click', _.bind(this.gotoBookmark, this));

            this.btnDelete = new Common.UI.Button({
                el: $('#bookmarks-btn-delete'),
                disabled: true
            });
            this.btnDelete.on('click', _.bind(this.deleteBookmark, this));

            this.chHidden = new Common.UI.CheckBox({
                el: $('#bookmarks-checkbox-hidden'),
                labelText: this.textHidden,
                value: Common.Utils.InternalSettings.get("de-bookmarks-hidden") || false
            });
            this.chHidden.on('change', _.bind(this.onChangeHidden, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        close: function() {
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
            Common.Utils.InternalSettings.set("de-bookmarks-hidden", this.chHidden.getValue()=='checked');
        },

        _setDefaults: function (props) {
            this.refreshBookmarks();
            this.bookmarksList.scrollToRecord(this.bookmarksList.selectByIndex(0));
        },

        getSettings: function () {
            return {};
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'add') {
                this.props.asc_AddBookmark(this.txtName.getValue());
            }

            this.close();
        },

        onPrimary: function() {
            return true;
        },

        refreshBookmarks: function() {
            if (this.props) {
                var store = this.bookmarksList.store,
                    count = this.props.asc_GetCount(),
                    showHidden = this.chHidden.getValue()=='checked',
                    arr = [];
                for (var i=0; i<count; i++) {
                    var name = this.props.asc_GetName(i);
                    if (!this.props.asc_IsInternalUseBookmark(name) && (showHidden || !this.props.asc_IsHiddenBookmark(name))) {
                        var rec = new Common.UI.DataViewModel();
                        rec.set({
                            value: name,
                            location: i
                        });
                        arr.push(rec);
                    }
                }
                store.reset(arr, {silent: false});
            }
        },

        onSelectBookmark: function(listView, itemView, record) {
            var value = record.get('value');
            this.txtName.setValue(value);
            this.btnAdd.setDisabled(false);
            this.btnGoto.setDisabled(false);
            this.btnDelete.setDisabled(false);
        },

        gotoBookmark: function(btn, eOpts){
            var rec = this.bookmarksList.getSelectedRec();
            if (rec.length>0) {
                this.props.asc_GoToBookmark(rec[0].get('value'));
            }
        },

        onDblClickBookmark: function(listView, itemView, record) {
            this.props.asc_GoToBookmark(record.get('value'));
        },

        deleteBookmark: function(btn, eOpts){
            var rec = this.bookmarksList.getSelectedRec();
            if (rec.length>0) {
                this.props.asc_RemoveBookmark(rec[0].get('value'));
                var store = this.bookmarksList.store;
                var idx = _.indexOf(store.models, rec[0]);
                store.remove(rec[0]);
            }
        },

        onRadioSort: function(field, newValue, eOpts) {
            if (newValue) {
                this.bookmarksList.store.sort();
                this.bookmarksList.onResetItems();
            }
        },

        onChangeHidden: function(field, newValue, oldValue, eOpts){
            this.refreshBookmarks();
        },

        onNameChanging: function (input, value) {
            var exist = this.props.asc_HaveBookmark(value);
            this.bookmarksList.deselectAll();
            this.btnAdd.setDisabled(!this.props.asc_CheckNewBookmarkName(value) && !exist);
            this.btnGoto.setDisabled(!exist);
            this.btnDelete.setDisabled(!exist);
        },

        textTitle:    'Bookmarks',
        textLocation: 'Location',
        textBookmarkName: 'Bookmark name',
        textSort: 'Sort by',
        textName: 'Name',
        textAdd: 'Add',
        textGoto: 'Go to',
        textDelete: 'Delete',
        textClose: 'Close',
        textHidden: 'Hidden bookmarks'

    }, DE.Views.BookmarksDialog || {}))
});