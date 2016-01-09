list = {};

Paginations = {
    /**
     * Navigation buttons
     */
    buttons: {
        first: '<<',
        last: '>>',
        next: '>',
        previous: '<'
    },
    /**
     * Pagination collection
     */
    counters: new Mongo.Collection('paginationCounters'),
    /**
     * Default mode to use
     */
    mode: 'button'
};

if (Meteor.isServer) {

    Paginations.counter = function (context, cursor) {
        var selector = cursor._cursorDescription.selector;
        var hash = JSON.stringify(selector);
        var count = 0;
        var counterName = context._name;
        var counters = Paginations.counters.find({name: counterName, selector: hash});
        var collection = Paginations.counters;
        var init = true;
        var handle = cursor.observeChanges({
            added: function (id) {
                count += 1;
                if (!init) {
                    collection.upsert({name: counterName, selector: hash}, {
                        $set: {count: count, updatedAt: new Date()}
                    });
                }
            },
            removed: function (id) {
                count -= 1;
                if (!init) {
                    collection.upsert({name: counterName, selector: hash}, {
                        $set: {count: count, updatedAt: new Date()}
                    });
                }
            }
        });

        // Set the first count
        collection.upsert({name: counterName, selector: hash}, {
            $set: {count: cursor.count(), updatedAt: new Date()}
        });

        init = false;
        //self.added(collectionName, counterName, {count: count});
        //self.ready();
        // Stop observing the cursor when client unsubs.
        // Stopping a subscription automatically takes
        // care of sending the client any removed messages.
        context.onStop(function () {
            handle.stop();
        });
        return counters;
    }
}

if (Meteor.isClient) {
    Paginations.count = function (name) {
        var counter = Paginations.counters.findOne({name: name});
        return counter ? counter.count : 0;
    };
}

/**
 * Pagination manager
 * @param id
 * @param options
 * @constructor
 */
Pagination = function (id, options) {
    // Set default options
    options = _.extend({
        counter: null,
        cursor: null,
        limit: 5,
        onChanged: null,
        skip: 0
    }, options);

    // Check options
    if (options.counter !== null && typeof options.counter !== 'string') {
        throw new Error('counter must be a string');
    }
    if (!options.cursor) {
        throw new Error('cursor not defined');
    }
    if (options.onChanged !== null && typeof options.onChanged !== 'function') {
        throw new Error('onChanged must be a function');
    }

    // Public attributes
    this.id = id;
    this.cursor = options.cursor;
    this.counter = options.counter;
    this.onChanged = options.onChanged;
    list[id] = this;

    if (!isNaN(options.limit)) {
        this.setLimit(options.limit);
    }
    if (!isNaN(options.skip)) {
        this.setSkip(options.skip);
    }

    // todo change de page si l'offset dépasse le count en cas de suppression d'éléments
};

/**
 * Returns the current pagination count
 * @return {number}
 */
Pagination.prototype.count = function () {
    return this.cursor.count();
};

/**
 * Go to the first page
 * @return {number}
 */
Pagination.prototype.first = function () {
    return this.setPage(1);
};

/**
 * Returns the pagination session value
 * @param name
 * @return {*}
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
 * Returns the last page
 * @return {number}
 */
Pagination.prototype.getLastPage = function () {
    return this.getPageCount();
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
    return this.count();
};

/**
 * Returns the pagination ID
 * @return {number}
 */
Pagination.prototype.getName = function () {
    return this.id;
};

/**
 * Returns the next page
 * @return {number}
 */
Pagination.prototype.getNextPage = function () {
    return this.getCurrentPage() + 1;
};

/**
 * Returns the last page
 * @return {number}
 */
Pagination.prototype.getPageCount = function () {
    return Math.ceil(this.getTotal() / this.getLimit());
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
    return this.get('skip');
};

/**
 * Returns the total number of elements
 * @return {number}
 */
Pagination.prototype.getTotal = function () {
    return Paginations.count(this.counter || this.id);
};

/**
 * Go to the last page
 * @return {number}
 */
Pagination.prototype.last = function () {
    return this.setPage(this.getLastPage());
};

/**
 * Go to the next page
 * @return {number}
 */
Pagination.prototype.next = function () {
    return this.setPage(this.getCurrentPage() + 1);
};

/**
 * Go to the previous page
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
    return parseInt(window.prompt(i18n.t("Numéro de page")));
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
    page = page > this.getPageCount() ? this.getLastPage() : page;
    page = page <= 0 ? 1 : page;
    this.setSkip((page - 1) * this.getLimit());

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
    if (skip < 0) {
        skip = 0;
    }
    this.set('skip', parseInt(skip));
};
