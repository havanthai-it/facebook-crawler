const FileUtils = require('./utils/FileUtils');
const DOSpaceClient = require('./ext/DOSpaceClient');
const config = require('./config');
const randomString = require('./utils/funcs/randomString');

const test1 = async function() {
  let postImage = 'https://scontent.fhan2-2.fna.fbcdn.net/v/t1.0-1/cp0/p40x40/52355803_10156667247071634_6322424737133756416_o.png?_nc_cat=1&cb=846ca55b-311e05c7&ccb=2&_nc_sid=1eb0c7&_nc_ohc=ebYuWF2jiNEAX9B6XWz&_nc_ht=scontent.fhan2-2.fna&_nc_tp=30&oh=f413dab64af956eb94aa4daeb5dbd6ad&oe=6023C372';
  console.log('start: '+ postImage);
  const newPostImage = await FileUtils.download(postImage, config.file.downloadPath + 'post_' + randomString(8) + FileUtils.getImageExtension(postImage));
  console.log('downloaded:' + newPostImage);
  const uploadImage = await DOSpaceClient.uploadImage(newPostImage);
  console.log('pushed: ' + uploadImage);
  await FileUtils.delete(newPostImage);
  console.log('deleted: ' + newPostImage);
};

const test2 = async function() {
  // upload image to digital ocean space
  let newImages = [];
  let images = 'https://i2.wp.com/ideasfornames.com/wp-content/uploads/2019/10/ionut-comanici-RDcEWH5hSDE-unsplash.jpg?ssl=1,https://images.hdqwalls.com/download/cute-girl-art-4k-o8-800x1280.jpg';
  let arr = images.split(',');
  for(let postImage of arr) {
    console.log('start: '+ postImage);
    const newPostImage = await FileUtils.download(postImage, config.file.downloadPath + 'post_' + randomString(8) + FileUtils.getImageExtension(postImage));
    console.log('downloaded:' + newPostImage);
    newImages.push(await DOSpaceClient.uploadImage(newPostImage));
    console.log('pushed: ');
    await FileUtils.delete(newPostImage);
    console.log('deleted: ' + newPostImage);
  };
  console.log(newImages.join());
}

test2();
