const { v4: uuidv4 } = require('uuid');

class FacebookPage {

  constructor(json) {
    if (json) {
      this.sId = uuidv4().replace(/-/g, '');
      this.sUsername = json.sUsername;
      this.sName = json.sName;
      this.sThumbnail = json.sThumbnail;
      this.sCategory = json.sCategory;
      this.sCountry = json.sCountry;
      this.nHasAds = json.nHasAds;
      this.nLikes = json.nLikes;
      this.nFollows = json.nFollows;
      this.dPublish = json.dPublish;
      this.dCreate = json.dCreate;
      this.dUpdate = json.dUpdate;
      this.sStatus = json.sStatus;

      this.lstAds = json.lstAds;
      this.lstSimilarPages = json.lstSimilarPages;
    }
  }

}

module.exports = FacebookPage;
