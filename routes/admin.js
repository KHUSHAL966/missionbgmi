// routes/videoRoutes.js
import { Router } from 'express';
import {
    addVideo,
    editVideo,
    deleteVideo,
    getAllVideos,
    getAllActiveVideos,
    getAllActiveVideos2,
} from '../controllers/videoController.js';

import {
    addBanner,
    editBanner,
    deleteBanner,
    getAllBanners,
    getAllActiveBanners,
    getAllBannersById,
} from '../controllers/bannerController.js';

import  {bookTournamentSlot,verify,book, getallbooking,getnotification, updatewinnerstatus, getallwinnerbooking, getBookingsByUserId, getsmsnotfiation, generateslot, totalavailableslot} from '../controllers/bookingController.js'
import {
    addPackage,
    editPackage,
    deletePackage,
    getAllPackages,
    getAllActivePackages,
    getPackageById,
} from '../controllers/packageController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { getAllMessages, submitContactForm } from '../controllers/contactController.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/add',authMiddleware,roleMiddleware("Admin"), addPackage);
router.put('/edit/:id',authMiddleware,roleMiddleware("Admin"), editPackage);
router.delete('/delete/:id',authMiddleware,roleMiddleware("Admin"), deletePackage);
router.get('/all',authMiddleware,roleMiddleware("Admin"), getAllPackages);
router.get('/all/:id',authMiddleware,roleMiddleware("Admin"),getPackageById);
router.get('/activepackage',authMiddleware,roleMiddleware("User","Admin"), getAllActivePackages);
router.post('/addbanner',authMiddleware,roleMiddleware("Admin"), addBanner);
router.put('/banneredit/:id',authMiddleware,roleMiddleware("Admin"), editBanner);
router.delete('/bannerdelete/:id',authMiddleware,roleMiddleware("Admin"), deleteBanner);
router.get('/bannerall',authMiddleware,roleMiddleware("Admin"), getAllBanners);
router.get('/bannerall/:id',authMiddleware,roleMiddleware("Admin"), getAllBannersById);
router.get('/active',authMiddleware,roleMiddleware("User"), getAllActiveBanners);
router.post('/videoadd',authMiddleware,roleMiddleware("Admin"), addVideo);
router.put('/videoedit/:id',authMiddleware,roleMiddleware("Admin"), editVideo);
router.delete('/videodelete/:id',authMiddleware,roleMiddleware("Admin"), deleteVideo);
router.get('/videoall',authMiddleware,roleMiddleware("Admin"), getAllVideos);
router.get('/videoactive', getAllActiveVideos);
router.get('/videoactive2', getAllActiveVideos2);
router.get('/getallbooking',authMiddleware,roleMiddleware("Admin"), getallbooking)
router.get('/getuserbooking',authMiddleware,roleMiddleware("User"), getBookingsByUserId)
router.post('/create-order',authMiddleware,roleMiddleware("User"), bookTournamentSlot);
router.post('/book',authMiddleware,roleMiddleware("User"), book);
router.post('/verify-payment',authMiddleware,roleMiddleware("User"), verify);
router.post('/send-notification',authMiddleware,roleMiddleware("Admin"),getnotification);
router.post('/send-message',authMiddleware,roleMiddleware("Admin"), getsmsnotfiation)
router.put("/update-winner/:id",authMiddleware,roleMiddleware("Admin"),updatewinnerstatus);
router.get('/getallwinner', getallwinnerbooking);
router.post('/AddContactus', submitContactForm);
router.get('/ListContactus',authMiddleware,roleMiddleware("Admin"), getAllMessages);
router.get('/generateslot',authMiddleware,roleMiddleware("User"), generateslot);
router.get('/totalavailableslot',authMiddleware,roleMiddleware("User"), totalavailableslot);


export default router;
