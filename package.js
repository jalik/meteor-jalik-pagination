Package.describe({
    name: 'jalik:pagination',
    version: '0.1.1',
    author: 'karl.stein.pro@gmail.com',
    summary: 'Pagination for subscription',
    homepage: 'https://github.com/jalik/jalik-pagination',
    git: 'https://github.com/jalik/jalik-pagination.git',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.2');
    api.use(['underscore', 'check', 'session'], 'client');
    api.use(['minimongo', 'mongo-livedata', 'templating', 'reactive-var'], 'client');
    api.addFiles(['pagination.html'], 'client');
    api.addFiles(['pagination.js'], 'client');
    api.export('Pagination');
    api.export('Paginations');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('jalik:pagination');
    api.addFiles('pagination-tests.js');
});
