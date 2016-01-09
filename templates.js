Template.pagination.onCreated(function () {
    var tpl = this;
    var data = tpl.data;

    if (!list[data.id]) {
        throw new Error('Pagination "' + data.id + '" not defined');
    }
    tpl.p = list[data.id];
});

Template.pagination.events({
    'click [name="current-page"]': function (ev, tpl) {
        ev.preventDefault();
        var page = parseInt(tpl.p.selectPage());
        if (!isNaN(page)) {
            tpl.p.setPage(page);
        }
    },
    'click [name="first-page"]': function (ev, tpl) {
        ev.preventDefault();
        tpl.p.setPage(1);
    },
    'click [name="last-page"]': function (ev, tpl) {
        ev.preventDefault();
        tpl.p.last();
    },
    'click [name="next-page"]': function (ev, tpl) {
        ev.preventDefault();
        tpl.p.next();
    },
    'click [name="previous-page"]': function (ev, tpl) {
        ev.preventDefault();
        tpl.p.previous();
    }
});

Template.pagination.helpers({
    count: function () {
        return Template.instance().p.count();
    },
    disableLast: function () {
        var i = Template.instance();
        return i.p.getCurrentPage() < i.p.getPageCount();
    },
    disableNext: function () {
        var i = Template.instance();
        return i.p.getCurrentPage() < i.p.getPageCount();
    },
    disablePrevious: function () {
        return Template.instance().p.getCurrentPage() <= 1;
    },
    first: function () {
        return this.first || Paginations.buttons.first;
    },
    isCustomMode: function () {
        return this.mode === 'custom';
    },
    isDefaultMode: function () {
        return this.mode === 'button' || this.mode === undefined || this.mode === null;
    },
    isImageMode: function () {
        return this.mode === 'img';
    },
    next: function () {
        return this.next || Paginations.buttons.next;
    },
    offset: function () {
        return Template.instance().p.getSkip();
    },
    page: function () {
        return Template.instance().p.getCurrentPage();
    },
    pageCount: function () {
        return Template.instance().p.getPageCount();
    },
    previous: function () {
        return this.previous || Paginations.buttons.previous;
    },
    total: function () {
        return Template.instance().p.getTotal();
    }
});
