import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { upload } from '../middlewares/upload';
import { menuController } from '../controllers/menuController';
import {
  categoryController,
  categoryCreateSchema,
  categoryUpdateSchema,
} from '../controllers/categoryController';
import {
  productController,
  productCreateSchema,
  productUpdateSchema,
} from '../controllers/productController';
import { settingController, settingUpdateSchema } from '../controllers/settingController';

const router = Router();

// Protect everything below
router.use(requireAuth, requireRole('ADMIN', 'STAFF'));

// Dashboard
router.get('/dashboard', menuController.getDashboard);

// Categories
router.get('/categories', categoryController.listAll);
router.post('/categories', validate(categoryCreateSchema), categoryController.create);
router.put('/categories/:id', validate(categoryUpdateSchema), categoryController.update);
router.delete('/categories/:id', categoryController.remove);

// Products
router.get('/products', productController.listAll);
router.post('/products', validate(productCreateSchema), productController.create);
router.put('/products/:id', validate(productUpdateSchema), productController.update);
router.delete('/products/:id', productController.remove);

// Settings
router.get('/settings', settingController.get);
router.put('/settings', validate(settingUpdateSchema), settingController.update);

// Upload (single file under field "file")
router.post('/upload', upload.single('file'), menuController.upload);

export default router;
