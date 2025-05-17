import { string } from "../constructor/string.js";
import { activeGame, activeGif, activeInnerImg, activeSlider, createGameImg, createGif, createInnerImg, createSlider, deleteGameData, deleteGifData, deleteImgData, deleteInnerImgData, getAllGameImg, getAllGif, getAllInnerImg, getAllSliderTextImg, getGameImg, getGif, getInnerImg, getSliderTextImg } from "../controller/slider.controller.js";
import customErrorHandler from "../helper/customErrorHandler.js";
import { Authorize } from "../middleware/auth.js";
import { errorHandler } from "../middleware/ErrorHandling.js";


export const SliderRoute = (app) => {
  /*
     Slider Img Apis Start's.....
  */

  app.post('/api/admin/create-slider-text-img', customErrorHandler, Authorize([string.superAdmin]), createSlider);

  app.get('/api/admin/slider-text-img', customErrorHandler, getSliderTextImg);

  app.get('/api/admin/all-slider-text-img',  customErrorHandler,Authorize([string.superAdmin]), getAllSliderTextImg);

  app.post('/api/admin/active-slider/:imageId', Authorize([string.superAdmin]), customErrorHandler, activeSlider);

  app.delete('/api/delete/img/:imageId', customErrorHandler, Authorize([string.superAdmin]), deleteImgData);

  /*
     Slider Img Apis End's.....
  */

  /*
     Gif Apis Start's.....
  */

  app.post('/api/admin/create-gif', customErrorHandler, errorHandler, Authorize([string.superAdmin]), createGif);

  app.get('/api/admin/get-gif', customErrorHandler, getGif);

  app.get('/api/admin/get-all-gif', customErrorHandler,Authorize([string.superAdmin]), getAllGif);

  app.delete('/api/delete/gif/:imageId', customErrorHandler, Authorize([string.superAdmin]), deleteGifData);

  app.post('/api/admin/active-gif/:imageId', Authorize([string.superAdmin]), customErrorHandler, activeGif);

  /*
     Gif Apis End's.....
  */

  /*
     Game Apis Start's.....
  */

  app.post('/api/admin/create-game-img', customErrorHandler, errorHandler, Authorize([string.superAdmin]), createGameImg);

  app.get('/api/admin/get-game-img', customErrorHandler, getGameImg);

  app.get('/api/admin/get-all-game-img', customErrorHandler, Authorize([string.superAdmin]), getAllGameImg);

  app.delete('/api/delete/game-img/:imageId', customErrorHandler, Authorize([string.superAdmin]), deleteGameData);

  app.post('/api/admin/active-game-img/:imageId', Authorize([string.superAdmin]), customErrorHandler, activeGame);

  /*
     Game Apis End's.....
  */

  /*
      Inner Img Apis Start's.....
   */

  app.post('/api/admin/create-inner-img', customErrorHandler, errorHandler, Authorize([string.superAdmin]), createInnerImg);

  app.get('/api/admin/get-inner-game-img', customErrorHandler, getInnerImg);

  app.get('/api/admin/get-all-inner-img', customErrorHandler,Authorize([string.superAdmin]), getAllInnerImg);

  app.delete('/api/delete/inner-img/:imageId', customErrorHandler, Authorize([string.superAdmin]), deleteInnerImgData);

  app.post('/api/admin/inner-game-img/:imageId', Authorize([string.superAdmin]), customErrorHandler, activeInnerImg);

  /*
     Inner Img Apis End's.....
  */

};
