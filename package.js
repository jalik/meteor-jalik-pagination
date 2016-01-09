Package.describe({
    name: 'jalik:pagination',
    version: '0.1.1',
    author: 'karl.stein.pro@gmail.com',
    summary: 'Pagination for subscription',
    homepage: 'https://github.com/jalik/jalik-pagination',
    git: 'https://github.com/jalik/jalik-pagination.git',
    documentation: 'README.md',
    license: 'MIT'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.2');
    api.use('check');
    api.use('jalik:i18n');
    api.use('mongo');
    api.use('reactive-var');
    api.use('session', 'client');
    api.use('templating', 'client');
    api.use('underscore');

    api.addFiles('templates.html', 'client');
    api.addFiles('templates.js', 'client');
    api.addFiles('pagination.js');

    api.export('Pagination');
    api.export('Paginations');
});
