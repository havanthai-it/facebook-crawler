const { v4: uuidv4 } = require('uuid');

class FacebookAds {

  constructor(json) {
    if (json) {
      this.sId = uuidv4().replace(/-/g, '');
      this.sPostId = json.sPostId;
      this.sAdsId = json.sAdsId;
      this.sPixelId = json.sPixelId;
      this.sFacebookPageUsername = json.sFacebookPageUsername;
      this.sImages = json.sImages;
      this.sVideos = json.sVideos;
      this.sContent = json.sContent;
      this.sType = json.sType;
      this.sCategory = json.sCategory;
      this.sCountry = json.sCountry;
      this.sLanguage = json.sLanguage;
      this.nLikes = json.nLikes;
      this.nComments = json.nComments;
      this.nShares = json.nShares;
      this.nViews = json.nViews;
      this.sStatus = json.sStatus;
      this.sLinks = json.sLinks;
      this.sWebsite = json.sWebsite;
      this.sPlatform = json.sPlatform;
      this.dPublish = json.dPublish;
      this.dCreate = json.dCreate;
      this.dUpdate = json.dUpdate;
    }
  }

}

module.exports = FacebookAds;
