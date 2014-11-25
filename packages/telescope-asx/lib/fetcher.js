


Later = Npm.require('later');

var fetchLatestASX = function(){

  var limit = 0; //TODO how many new posts to save per every fetch 

  try{
    
    var url = 'https://www.kimonolabs.com/api/d24n87da?apikey=6CUR6Vw9BNVRomz1pTUSDNK8I8VaruKv';
    var result = Meteor.http.get(url);
    if (!result.data) {
      return 'Response not JSON';
    }

    if(!result.data.results['ASX ANNOCEMENTS'].length) {
      return 'Invalid JSON from Kimono';
    }

    var announcement;    

    var added = 0;

    var bodyToSave;
    var asxcodetosave;

    for (var i=result.data.results['ASX ANNOCEMENTS'].length - 1; i > 0 ; i--){            
      if (added > limit) break;
      announcement = result.data.results['ASX ANNOCEMENTS'][i];
      //saveASXPost

      if(!Posts.findOne({ url : announcement.Link.href } )){
        bodyToSave = 'Pages(' + announcement.Pages + '), announced at ' + announcement.AnnonceTime;
        asxcodetosave = announcement.ASX;

        saveASXPost({
          asxcode: asxcodetosave,
          body: bodyToSave,
          url:  announcement.Link.href,
          title: announcement.Annocement
        });
        added += 1;
      }
    }

    return 'Added ' + added + ' new ASX posts';
  }
  catch(error){
    return 'Connection error or server side error while fetching from Kimono';
  }

};

var saveASXPost = function(asxPost){

  var properties = {
      baseScore: 1,
      body: asxPost.body, //'Today is a Sunday',
      asxcode: asxPost.asxcode,
      commentsCount: 0,
      createdAt: new Date(),
      downvotes: 0,
      //htmlBody: ,
      inactive: false,
      postedAt: new Date(),
      score: 0,
      status: 2,
      sticky: false,
      title: asxPost.title,
      upvoters: [],
      upvotes: 0,
      url: asxPost.url,
      userId: "mhjZudS73hMXPPqDB" //TODO the ID of the user name under which posts should be posted
    };
    //Posts.insert(properties);
    console.log("Inserted fetched ASX Post ID: ", Posts.insert(properties));
}

SyncedCron.options.log = true;

//console.log('Next run=> ', SyncedCron.nextScheduledAtDate('ASX Posts Fetcher') );


SyncedCron.add({
  name: 'ASX Posts Fetcher',
  schedule: function(parser){
    // parser is a later object
    return parser.text('every 2 mins'); //TODO interval between fetches
  },
  job: function(){
    return fetchLatestASX();
  }
});


Meteor.startup(function() {
	SyncedCron.start();

  /*
  These routes, I was using them when I was developing. You can delete them
  */
  
  Router.map(function() {
    this.route('asx', {
      where: 'server',
      path: '/asx',
      action: function(){
        
        fetchLatestASX();
        this.response.end();       
        
        try{
          
          var result = Meteor.http.get('https://www.kimonolabs.com/api/d24n87da?apikey=6CUR6Vw9BNVRomz1pTUSDNK8I8VaruKv');
          if (!result.data) {
            this.response.write('Response not JSON');
            this.response.end();
            return;
          }

          if(!result.data.results['ASX ANNOCEMENTS'].length) {
            this.response.write('Invalid JSON from Kimono');
            this.response.end();
            return;
          }

          var announcement;

          var limit = 5;

          var considered = 0;

          var bodyToSave;
          var asxcodetosave;
          for (var i=result.data.results['ASX ANNOCEMENTS'].length - 1; i > 0 ; i--){            
            if (considered > limit) break;
            announcement = result.data.results['ASX ANNOCEMENTS'][i];
            //saveASXPost

            if(!Posts.findOne({ url : announcement.Link.href } )){
              bodyToSave = 'Pages(' + announcement.Pages + '), announced at ' + announcement.AnnonceTime;
              asxcodetosave = announcement.ASX;
              saveASXPost({
                asxcode: asxcodetosave,
                body: bodyToSave,
                url:  announcement.Link.href,
                title: announcement.Annocement
              });
              considered += 1;
              //this.response.write('<p>Would have saved '+ announcement.Annocement + ' - ' + announcement.Link.href+'</p>');
              this.response.write('<p>Saved [' + announcement.Link.href + '] - '+ announcement.Annocement + ' - ' + bodyToSave +'</p>');
            }
          }
          this.response.end();


        }
        catch(error){
          this.response.write('Paita error ' + JSON.stringify(error));
          this.response.end();
        }

        

      }
    });

  });

});


