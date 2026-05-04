import { Router } from 'express';
import { menuController } from '../controllers/menuController';
import { categoryController } from '../controllers/categoryController';
import { productController } from '../controllers/productController';
import { settingController } from '../controllers/settingController';

const router = Router();

router.get('/menu', menuController.getMenu);
router.get('/categories', categoryController.listPublic);
router.get('/products', productController.listPublic);
router.get('/products/:slug', productController.getBySlug);
router.get('/settings', settingController.get);

export default router;
