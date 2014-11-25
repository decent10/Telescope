Package.describe({summary: "Telescope ASX Stocks Module Package"});

Npm.depends({
	"later": "1.1.6"
});

Package.onUse(function (api) {

  api.use(['telescope-lib', 'telescope-base'], ['client', 'server']);

  api.use(['http'], ['server']);
  
  api.use([
    'percolatestudio:synced-cron'
  ], ['server']);

  api.add_files(['lib/fetcher.js'], ['server']);

  api.export([

  ]);

});