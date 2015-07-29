var list = {};

Paginations = {
    buttons: {
        first: '<<',
        next: '>',
        previous: '<'
    }
};

/**
 * Pagination helper
 * @param id
 * @param options
 * @constructor
 */
Pagination = function (id, options) {
    // Set default options
    options = _.extend({
        cursor: null,
        limit: 5,
        onChanged: null,
        skip: 0
    }, options);

    // Check options
    if (!options.cursor) {
        throw new Error('cursor not defined');
    }

    if (typeof options.onChanged === 'function') {
        this.onChanged = options.onChanged;
    }

    // Public attributes
    this.id = id;
    this.cursor = options.cursor;

    if (isNaN(this.getLimit())) {
        this.setLimit(options.limit);
    }

    if (isNaN(this.getSkip())) {
        this.setSkip(options.skip);
    }

    // Add to the list
    list[id] = this;
};

/**
 * Returns the pagination session value
 * @param name
 * @return {any}
 */
Pagination.prototype.get = function (name) {
    return Session.get('pagination.' + this.id + '.' + name);
};

/**
 * Returns the current page
 * @return {number}
 */
Pagination.prototype.getCurrentPage = function () {
    return this.getSkip() / this.getLimit() + 1;
};

/**
 * Returns the pagination cursor
 * @return {cursor}
 */
Pagination.prototype.getCursor = function () {
    return this.cursor;
};

/**
 * Returns the pagination ID
 * @return {number}
 */
Pagination.prototype.getName = function () {
    return this.id;
};

/**
 * Returns the pagination limit
 * @return {number}
 */
Pagination.prototype.getLimit = function () {
    return parseInt(this.get('limit'));
};

/**
 * Returns the number of loaded elements
 * @return {number}
 */
Pagination.prototype.getLoaded = function () {
    return this.cursor.count();
};

/**
 * Returns the next page
 * @return {number}
 */
Pagination.prototype.getNextPage = function () {
    return this.getCurrentPage() + 1;
};

/**
 * Returns the previous page
 * @return {number}
 */
Pagination.prototype.getPreviousPage = function () {
    return this.getCurrentPage() - 1 || 1;
};

/**
 * Returns the number of skipped elements
 * @return {number}
 */
Pagination.prototype.getSkip = function () {
    return parseInt(this.get('skip'));
};

/**
 * Go to next page
 * @return {number}
 */
Pagination.prototype.next = function () {
    return this.setPage(this.getCurrentPage() + 1);
};

/**
 * Go to previous page
 * @return {number}
 */
Pagination.prototype.previous = function () {
    return this.setPage(this.getCurrentPage() - 1);
};

/**
 * Sets a pagination session value
 * @param name
 * @param value
 */
Pagination.prototype.set = function (name, value) {
    Session.set('pagination.' + this.id + '.' + name, value);
};

/**
 * Select a page
 * @return {number}
 */
Pagination.prototype.selectPage = function () {
    return parseInt(window.prompt(i18n("Numéro de page")));
};

/**
 * Sets the pagination limit
 * @param limit
 */
Pagination.prototype.setLimit = function (limit) {
    check(limit, Number);
    this.set('limit', parseInt(limit));
};

/**
 * Go to specified page
 * @param page
 */
Pagination.prototype.setPage = function (page) {
    check(page, Number);
    page = parseInt(page);
    page = page <= 0 ? 1 : page;
    this.set('skip', (page - 1) * this.getLimit());

    if (typeof this.onChanged === 'function') {
        this.onChanged.call(this);
    }
};

/**
 * Sets the number of elements to skip
 * @param skip
 */
Pagination.prototype.setSkip = function (skip) {
    check(skip, Number);
    this.set('skip', parseInt(skip));
};


Template.pagination.onCreated(function () {
    var tpl = this;
    var data = this.data;

    if (!list[data.id]) {
        throw new Error('pagination "' + data.id + '" not defined');
    }
    tpl.pagination = list[data.id];
});

Template.pagination.events({
    'click [name=current-page]': function (ev) {
        ev.preventDefault();
        var page = parseInt(list[this.id].selectPage());
        if (!isNaN(page)) {
            list[this.id].setPage(page);
        }
    },
    'click [name=first-page]': function (ev) {
        ev.preventDefault();
        list[this.id].setPage(1);
    },
    'click [name=next-page]': function (ev) {
        ev.preventDefault();
        list[this.id].next();
    },
    'click [name=previous-page]': function (ev) {
        ev.preventDefault();
        list[this.id].previous();
    }
});

Template.pagination.helpers({
    disableNext: function () {
        var count = list[this.id].getCursor().count();
        return count < list[this.id].getLimit();
    },
    disablePrevious: function () {
        return list[this.id].getCurrentPage() <= 1;
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
    page: function () {
        return list[this.id].getCurrentPage();
    },
    previous: function () {
        return this.previous || Paginations.buttons.previous;
    }
});